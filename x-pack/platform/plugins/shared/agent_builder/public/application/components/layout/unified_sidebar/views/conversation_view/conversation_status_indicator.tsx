/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiLoadingSpinner, EuiToolTip, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import type { ConversationStatus } from '../../../../../hooks/use_pinned_conversations';

const INDICATOR_SIZE = '8px';

const tooltipLabels: Record<ConversationStatus, string> = {
  streaming: i18n.translate('xpack.agentBuilder.sidebar.conversationStatus.streaming', {
    defaultMessage: 'In progress',
  }),
  awaiting_prompt: i18n.translate('xpack.agentBuilder.sidebar.conversationStatus.awaitingPrompt', {
    defaultMessage: 'Awaiting your action',
  }),
  unread: i18n.translate('xpack.agentBuilder.sidebar.conversationStatus.unread', {
    defaultMessage: 'Unread',
  }),
  read: i18n.translate('xpack.agentBuilder.sidebar.conversationStatus.read', {
    defaultMessage: 'Read',
  }),
};

export const ConversationStatusIndicator: React.FC<{ status: ConversationStatus }> = ({
  status,
}) => {
  const { euiTheme } = useEuiTheme();

  const containerStyles = css`
    width: ${INDICATOR_SIZE};
    height: ${INDICATOR_SIZE};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `;

  const dotStyles = css`
    width: ${INDICATOR_SIZE};
    height: ${INDICATOR_SIZE};
    border-radius: 50%;
  `;

  let indicator: React.ReactNode;

  if (status === 'streaming') {
    indicator = <EuiLoadingSpinner size="s" />;
  } else if (status === 'awaiting_prompt') {
    indicator = (
      <div
        css={[
          dotStyles,
          css`
            background-color: ${euiTheme.colors.warning};
          `,
        ]}
      />
    );
  } else if (status === 'unread') {
    indicator = (
      <div
        css={[
          dotStyles,
          css`
            background-color: ${euiTheme.colors.primary};
          `,
        ]}
      />
    );
  } else {
    indicator = (
      <div
        css={[
          dotStyles,
          css`
            background-color: transparent;
            border: 1.5px solid ${euiTheme.colors.mediumShade};
          `,
        ]}
      />
    );
  }

  return (
    <EuiToolTip content={tooltipLabels[status]} position="right">
      <div css={containerStyles} aria-label={tooltipLabels[status]}>
        {indicator}
      </div>
    </EuiToolTip>
  );
};
