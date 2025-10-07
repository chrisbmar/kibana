/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';

// Content-only component for use with core.overlays.openFlyout()
export const OneChatFlyoutContent: React.FC<{
  onClose: () => void;
  context?: Record<string, unknown>;
}> = ({ onClose, context }) => {
  const { euiTheme } = useEuiTheme();

  return (
    <div
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
        max-inline-size: calc(100% - 20px);
        min-inline-size: 400px;
      `}
    >
      <div
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: ${euiTheme.size.l};
        `}
      >
        <h2>OneChat Agent Builder</h2>
        <p>Welcome to OneChat! The agent builder interface will be loaded here.</p>
        <p>This flyout will contain the full OneChat application.</p>

        {context && Object.keys(context).length > 0 && (
          <div
            css={css`
              margin-top: ${euiTheme.size.l};
              padding: ${euiTheme.size.m};
              background: ${euiTheme.colors.lightShade};
              border-radius: ${euiTheme.border.radius.medium};
              text-align: left;
              max-width: 500px;
            `}
          >
            <h3>Context Data:</h3>
            <pre
              css={css`
                white-space: pre-wrap;
                word-break: break-word;
                font-family: monospace;
                font-size: ${euiTheme.size.m};
                line-height: 1.4;
              `}
            >
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
