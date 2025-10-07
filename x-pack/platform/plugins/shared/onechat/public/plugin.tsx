/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {
  type CoreSetup,
  type CoreStart,
  type Plugin,
  type PluginInitializerContext,
} from '@kbn/core/public';
import type { Logger } from '@kbn/logging';
import { AGENT_BUILDER_ENABLED_SETTING_ID } from '@kbn/management-settings-ids';
import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { ONECHAT_FEATURE_ID, uiPrivileges } from '../common/features';
import { docLinks } from '../common/doc_links';
import { registerAnalytics, registerApp, registerManagementSection } from './register';
import type { OnechatInternalService } from './services';
import { AgentService, ChatService, ConversationsService, ToolsService } from './services';
import type {
  ConfigSchema,
  OnechatPluginSetup,
  OnechatPluginStart,
  OnechatSetupDependencies,
  OnechatStartDependencies,
  OneChatFlyoutOptions,
} from './types';
import { createPublicToolContract } from './services/tools';
import { OneChatNavButton } from './application/components/onechat_nav_button/onechat_nav_button';

import { registerLocators } from './locator/register_locators';

export class OnechatPlugin
  implements
    Plugin<
      OnechatPluginSetup,
      OnechatPluginStart,
      OnechatSetupDependencies,
      OnechatStartDependencies
    >
{
  logger: Logger;
  private internalServices?: OnechatInternalService;

  constructor(context: PluginInitializerContext<ConfigSchema>) {
    this.logger = context.logger.get();
  }
  setup(
    core: CoreSetup<OnechatStartDependencies, OnechatPluginStart>,
    deps: OnechatSetupDependencies
  ): OnechatPluginSetup {
    const isOnechatUiEnabled = core.uiSettings.get<boolean>(
      AGENT_BUILDER_ENABLED_SETTING_ID,
      false
    );

    if (isOnechatUiEnabled) {
      registerApp({
        core,
        getServices: () => {
          if (!this.internalServices) {
            throw new Error('getServices called before plugin start');
          }
          return this.internalServices;
        },
      });

      registerAnalytics({ analytics: core.analytics });
      registerLocators(deps.share);
    }

    try {
      core.getStartServices().then(([coreStart]) => {
        const { capabilities } = coreStart.application;
        if (capabilities[ONECHAT_FEATURE_ID][uiPrivileges.showManagement]) {
          registerManagementSection({ core, management: deps.management });
        }
      });
    } catch (error) {
      this.logger.error('Error registering Agent Builder management section', error);
    }

    return {};
  }

  start(core: CoreStart, startDependencies: OnechatStartDependencies): OnechatPluginStart {
    const { http } = core;
    docLinks.setDocLinks(core.docLinks.links);

    const agentService = new AgentService({ http });
    const chatService = new ChatService({ http });
    const conversationsService = new ConversationsService({ http });
    const toolsService = new ToolsService({ http });

    this.internalServices = {
      agentService,
      chatService,
      conversationsService,
      toolsService,
      startDependencies,
    };

    // Register OneChat button in the header navigation
    core.chrome.navControls.registerRight({
      order: 1000, // Place it before the AI Assistant button (order 1001)
      mount: (target) => {
        return this.mountOneChatButton(target, core, startDependencies);
      },
    });

    return {
      tools: createPublicToolContract({ toolsService }),
      openFlyout: (options = {}) => {
        this.openOneChatFlyout(core, options);
      },
    };
  }

  private mountOneChatButton(
    targetDomElement: HTMLElement,
    coreStart: CoreStart,
    _startDependencies: OnechatStartDependencies
  ) {
    ReactDOM.render(
      <KibanaContextProvider services={coreStart}>
        <OneChatNavButton />
      </KibanaContextProvider>,
      targetDomElement
    );

    return () => ReactDOM.unmountComponentAtNode(targetDomElement);
  }

  private openOneChatFlyout(core: CoreStart, options: OneChatFlyoutOptions) {
    import('./application/components/onechat_flyout/onechat_flyout').then(
      ({ OneChatFlyoutContent }) => {
        const flyout = core.overlays.openFlyout(
          toMountPoint(
            <OneChatFlyoutContent onClose={() => flyout.close()} context={options.context} />,
            core
          ),
          {
            size: 'm',
            maxWidth: 'calc(100% - 20px)',
            'data-test-subj': 'onechat-flyout',
          }
        );
      }
    );
  }
}
