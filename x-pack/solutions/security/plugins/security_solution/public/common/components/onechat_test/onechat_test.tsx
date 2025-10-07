/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiSpacer, EuiPanel } from '@elastic/eui';
import { OneChatButton } from '../onechat_button/onechat_button';

export const OneChatTest: React.FC = () => {
  return (
    <EuiPanel paddingSize="m" style={{ maxWidth: '400px' }}>
      <h3>{'Security Alert Context'}</h3>
      <p>{'Test OneChat with security alert context:'}</p>
      <OneChatButton
        alertId="alert-123"
        ruleName="Suspicious Activity Detected"
        size="s"
        color="warning"
      >
        {'Ask OneChat about this alert'}
      </OneChatButton>

      <EuiSpacer size="l" />

      <h3>{'Custom Context'}</h3>
      <p>{'Test OneChat with custom context:'}</p>
      <OneChatButton
        context={{
          customField: 'test-value',
          securityContext: 'detection-engine',
        }}
        size="s"
        color="text"
      >
        {'Ask OneChat with custom context'}
      </OneChatButton>
    </EuiPanel>
  );
};
