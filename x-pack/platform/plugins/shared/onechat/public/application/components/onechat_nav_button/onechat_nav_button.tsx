/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import { EuiButton, EuiToolTip } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { OneChatFlyoutContent } from '../onechat_flyout/onechat_flyout';

const BUTTON_LABEL = i18n.translate('xpack.onechat.navButton.label', {
  defaultMessage: 'Agent Builder',
});

const TOOLTIP_CONTENT = i18n.translate('xpack.onechat.navButton.tooltip', {
  defaultMessage: 'Open Agent Builder',
});

export const OneChatNavButton: React.FC = () => {
  const { services } = useKibana();

  const handleClick = useCallback(() => {
    if (services.overlays) {
      const flyout = services.overlays.openFlyout(
        toMountPoint(
          <OneChatFlyoutContent
            onClose={() => flyout.close()}
            context={{ source: 'header-button' }}
          />,
          services as any
        ),
        {
          size: 'm',
          maxWidth: 'calc(100% - 20px)',
          'data-test-subj': 'onechat-flyout',
        }
      );
    }
  }, [services]);

  return (
    <EuiToolTip content={TOOLTIP_CONTENT}>
      <EuiButton
        onClick={handleClick}
        color="primary"
        size="s"
        data-test-subj="agentBuilderNavButton"
        aria-label={BUTTON_LABEL}
      >
        {BUTTON_LABEL}
      </EuiButton>
    </EuiToolTip>
  );
};
