/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  EuiDraggable,
  EuiDroppable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiTextTruncate,
  useEuiTheme,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { appPaths } from '../../../../../utils/app_paths';
import { useConversationList } from '../../../../../hooks/use_conversation_list';
import {
  createConversationListItemStyles,
  createActiveConversationListItemStyles,
} from '../../../../conversations/conversation_list_item_styles';
import { usePinnedConversations } from '../../../../../hooks/use_pinned_conversations';
import type { ConversationStatus } from '../../../../../hooks/use_pinned_conversations';
import { ConversationListItemRow } from './conversation_list_item_row';

const newConversationLabel = i18n.translate(
  'xpack.agentBuilder.sidebar.conversation.newConversation',
  { defaultMessage: 'New conversation' }
);

interface ConversationListProps {
  agentId: string;
  currentConversationId: string | undefined;
  isNewConversationRoute: boolean;
  onItemClick?: () => void;
  pinnedConversationIds?: Set<string>;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  agentId,
  currentConversationId,
  isNewConversationRoute,
  onItemClick,
  pinnedConversationIds,
}) => {
  const { euiTheme } = useEuiTheme();
  const { conversations = [], isLoading } = useConversationList({ agentId });
  const { getMetadata } = usePinnedConversations();

  const sortedConversations = useMemo(
    () =>
      [...conversations]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .filter((c) => !pinnedConversationIds?.has(c.id)),
    [conversations, pinnedConversationIds]
  );

  const linkStyles = createConversationListItemStyles(euiTheme);
  const activeLinkStyles = createActiveConversationListItemStyles(euiTheme);

  if (isLoading) {
    return (
      <EuiFlexGroup direction="column" gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiLoadingSpinner size="s" />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  // Keep CHATS droppable present even when empty so pinned items can be dropped back
  if (sortedConversations.length === 0) {
    return (
      <EuiDroppable droppableId="CHATS" spacing="none" grow={false}>
        <EuiFlexGroup direction="column" gutterSize="xs">
          <EuiFlexItem grow={false}>
            <Link
              to={appPaths.agent.conversations.new({ agentId })}
              css={isNewConversationRoute ? activeLinkStyles : linkStyles}
              data-test-subj="agentBuilderSidebarConversation-new"
              onClick={onItemClick}
            >
              <EuiTextTruncate text={newConversationLabel} />
            </Link>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDroppable>
    );
  }

  return (
    <EuiDroppable
      droppableId="CHATS"
      spacing="none"
      grow={false}
      style={{ display: 'flex', flexDirection: 'column', gap: euiTheme.size.xs }}
    >
      {sortedConversations.map((conversation, index) => {
        const isActive = currentConversationId === conversation.id;
        const status: ConversationStatus = getMetadata(conversation.id)?.status ?? 'read';
        return (
          <EuiDraggable
            key={conversation.id}
            draggableId={conversation.id}
            index={index}
            spacing="none"
          >
            <ConversationListItemRow
              agentId={agentId}
              conversationId={conversation.id}
              title={conversation.title || conversation.id}
              isActive={isActive}
              routeConversationId={currentConversationId}
              onItemClick={onItemClick}
              status={status}
            />
          </EuiDraggable>
        );
      })}
    </EuiDroppable>
  );
};
