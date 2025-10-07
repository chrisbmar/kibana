/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButton } from '@elastic/eui';
import type { EuiButtonProps } from '@elastic/eui';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import type { OnechatPluginStart } from '@kbn/onechat-plugin/public';

export interface OneChatButtonProps extends Omit<EuiButtonProps, 'onClick'> {
  alertId?: string;
  ruleName?: string;
  context?: Record<string, unknown>;
}

export const OneChatButton: React.FC<OneChatButtonProps> = ({
  alertId,
  ruleName,
  context,
  children = 'Ask OneChat',
  ...buttonProps
}) => {
  const { services } = useKibana<{ onechat?: OnechatPluginStart }>();
  const oneChat = services.onechat;

  if (!oneChat) {
    return null; // Don't render if OneChat is not available
  }

  const handleClick = () => {
    oneChat.openFlyout({
      context: {
        ...context,
        ...(alertId &&
          ruleName && {
            securityAlert: {
              alertId,
              ruleName,
            },
          }),
        pageContext: {
          appId: 'securitySolution',
          pageTitle: document.title,
          url: window.location.href,
        },
      },
    });
  };

  return (
    <EuiButton {...buttonProps} onClick={handleClick} iconType="logoElasticsearch">
      {children}
    </EuiButton>
  );
};
