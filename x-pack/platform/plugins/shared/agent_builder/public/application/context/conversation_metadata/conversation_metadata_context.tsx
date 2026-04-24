/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { createContext, useCallback, useContext, useRef } from 'react';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { storageKeys } from '../../storage_keys';

export type ConversationStatus = 'streaming' | 'awaiting_prompt' | 'unread' | 'read';

export interface ConversationMetadata {
  isPinned: boolean;
  status?: ConversationStatus;
}

type Storage = Record<string, ConversationMetadata>;

interface ConversationMetadataContextValue {
  getMetadata: (id: string) => ConversationMetadata | undefined;
  isPinned: (id: string) => boolean;
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  setConversationStatus: (id: string, status: ConversationStatus) => void;
}

const ConversationMetadataContext = createContext<ConversationMetadataContextValue | undefined>(
  undefined
);

export const ConversationMetadataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storage, setStorage] = useLocalStorage<Storage>(storageKeys.pinnedConversations, {});

  const storageRef = useRef(storage);
  storageRef.current = storage;

  // Readers use reactive `storage` directly so consumers re-render when state changes.
  // Setters use `storageRef.current` to avoid stale closure captures on write.
  const getMetadata = (id: string): ConversationMetadata | undefined => storage?.[id];

  const isPinned = (id: string) => storage?.[id]?.isPinned === true;

  const pinConversation = useCallback(
    (id: string) => {
      const s = storageRef.current;
      setStorage({ ...s, [id]: { ...s?.[id], isPinned: true } });
    },
    [setStorage]
  );

  const unpinConversation = useCallback(
    (id: string) => {
      const s = storageRef.current;
      setStorage({ ...s, [id]: { ...s?.[id], isPinned: false } });
    },
    [setStorage]
  );

  const setConversationStatus = useCallback(
    (id: string, status: ConversationStatus) => {
      const s = storageRef.current;
      setStorage({ ...s, [id]: { ...s?.[id], isPinned: s?.[id]?.isPinned ?? false, status } });
    },
    [setStorage]
  );

  return (
    <ConversationMetadataContext.Provider
      value={{ getMetadata, isPinned, pinConversation, unpinConversation, setConversationStatus }}
    >
      {children}
    </ConversationMetadataContext.Provider>
  );
};

export const useConversationMetadata = (): ConversationMetadataContextValue => {
  const ctx = useContext(ConversationMetadataContext);
  if (!ctx) {
    throw new Error('useConversationMetadata must be used within ConversationMetadataProvider');
  }
  return ctx;
};
