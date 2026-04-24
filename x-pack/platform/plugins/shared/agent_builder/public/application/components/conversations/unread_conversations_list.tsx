/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';

import { useConversationList } from '../../hooks/use_conversation_list';
import { usePinnedConversations } from '../../hooks/use_pinned_conversations';
import { appPaths } from '../../utils/app_paths';

const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface ConversationSectionProps {
  agentId: string;
  label: string;
  conversations: Array<{ id: string; title: string; updated_at: string }>;
  dotColor: string;
  action?: React.ReactNode;
}

const ConversationSection: React.FC<ConversationSectionProps> = ({
  agentId,
  label,
  conversations,
  dotColor,
  action,
}) => {
  const { euiTheme } = useEuiTheme();

  const rowStyles = css`
    padding: ${euiTheme.size.s} ${euiTheme.size.m};
    border-radius: ${euiTheme.border.radius.medium};
    background-color: ${euiTheme.colors.backgroundBaseSubdued};
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    gap: ${euiTheme.size.s};
    transition: background-color 0.15s;
    &:hover {
      background-color: ${euiTheme.colors.backgroundLightPrimary};
      text-decoration: none;
    }
  `;

  const dotStyles = css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${dotColor};
    flex-shrink: 0;
  `;

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiText size="s" color="subdued">
              <strong>{label}</strong>
            </EuiText>
          </EuiFlexItem>
          {action ? <EuiFlexItem grow={false}>{action}</EuiFlexItem> : null}
        </EuiFlexGroup>
      </EuiFlexItem>

      {conversations.map((conversation) => (
        <EuiFlexItem key={conversation.id} grow={false}>
          <Link
            to={appPaths.agent.conversations.byId({ agentId, conversationId: conversation.id })}
            css={rowStyles}
            data-test-subj={`agentBuilderConversationStatusRow-${conversation.id}`}
          >
            <div css={dotStyles} />

            <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
              <EuiFlexItem grow>
                <EuiText size="s">
                  <span css={css`font-weight: 500;`}>{conversation.title || conversation.id}</span>
                </EuiText>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="subdued">
                  {relativeTime(conversation.updated_at)}
                </EuiText>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiIcon type="arrowRight" size="s" color="subdued" />
              </EuiFlexItem>
            </EuiFlexGroup>
          </Link>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};

interface UnreadConversationsListProps {
  agentId: string;
}

export const UnreadConversationsList: React.FC<UnreadConversationsListProps> = ({ agentId }) => {
  const { euiTheme } = useEuiTheme();
  const { conversations = [] } = useConversationList({ agentId });
  const { getMetadata, setConversationStatus } = usePinnedConversations();

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations, getMetadata]
  );

  const awaitingConversations = useMemo(
    () => sorted.filter((c) => getMetadata(c.id)?.status === 'awaiting_prompt'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, getMetadata]
  );

  const unreadConversations = useMemo(
    () => sorted.filter((c) => getMetadata(c.id)?.status === 'unread'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, getMetadata]
  );

  if (awaitingConversations.length === 0 && unreadConversations.length === 0) return null;

  const markAllRead = () => {
    unreadConversations.forEach((c) => setConversationStatus(c.id, 'read'));
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      {awaitingConversations.length > 0 ? (
        <EuiFlexItem grow={false}>
          <ConversationSection
            agentId={agentId}
            label={i18n.translate('xpack.agentBuilder.newConversation.awaitingAction', {
              defaultMessage: 'Awaiting action',
            })}
            conversations={awaitingConversations}
            dotColor={euiTheme.colors.warning}
          />
        </EuiFlexItem>
      ) : null}

      {unreadConversations.length > 0 ? (
        <EuiFlexItem grow={false}>
          <ConversationSection
            agentId={agentId}
            label={i18n.translate('xpack.agentBuilder.newConversation.unreadSessions', {
              defaultMessage: 'Unread',
            })}
            conversations={unreadConversations}
            dotColor={euiTheme.colors.primary}
            action={
              <EuiButtonEmpty size="xs" color="text" onClick={markAllRead} flush="right">
                {i18n.translate('xpack.agentBuilder.newConversation.markAllRead', {
                  defaultMessage: 'Mark all read',
                })}
              </EuiButtonEmpty>
            }
          />
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>
  );
};
