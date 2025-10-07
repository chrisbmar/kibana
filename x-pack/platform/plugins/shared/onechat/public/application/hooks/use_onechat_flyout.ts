/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useState } from 'react';

export const useOneChatFlyout = (initialIsOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const openFlyout = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeFlyout = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleFlyout = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openFlyout,
    closeFlyout,
    toggleFlyout,
  };
};
