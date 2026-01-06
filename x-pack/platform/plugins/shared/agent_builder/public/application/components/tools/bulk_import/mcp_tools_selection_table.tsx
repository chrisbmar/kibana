/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CriteriaWithPagination } from '@elastic/eui';
import {
  type EuiBasicTableColumn,
  EuiCheckbox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHighlight,
  EuiInMemoryTable,
  EuiPanel,
  EuiText,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
import type { Tool as McpTool } from '@kbn/mcp-client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { labels } from '../../../utils/i18n';
import { truncateAtSentence } from '../../../utils/truncate_at_sentence';
import { McpToolsSelectionTableHeader } from './mcp_tools_selection_table_header';
import type { McpToolField } from './types';
import { useMcpToolsSearch } from './use_mcp_tools_search';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const tableContainerStyles = (isDisabled = false) => css`
  ${isDisabled &&
  `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

export interface McpToolsSelectionTableProps {
  tools: readonly McpTool[];
  selectedTools: McpToolField[];
  onChange: (tools: McpTool[]) => void;
  isLoading: boolean;
  isError: boolean;
  isDisabled: boolean;
  disabledMessage?: string;
}

export const McpToolsSelectionTable: React.FC<McpToolsSelectionTableProps> = ({
  tools,
  selectedTools,
  onChange,
  isLoading,
  isError,
  isDisabled,
  disabledMessage,
}) => {
  const { euiTheme } = useEuiTheme();
  const [tablePageIndex, setTablePageIndex] = useState(0);
  const [tablePageSize, setTablePageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    searchConfig,
    searchQuery,
    results: filteredTools,
  } = useMcpToolsSearch({ tools, isDisabled });

  // Reset page index when filtered results change
  useEffect(() => {
    setTablePageIndex(0);
  }, [filteredTools]);

  const { selectedNames, selectedMcpTools } = useMemo(() => {
    const names = new Set(selectedTools.map((tool) => tool.name));
    return {
      selectedNames: names,
      selectedMcpTools: tools.filter((tool) => names.has(tool.name)),
    };
  }, [tools, selectedTools]);

  const handleToggleTool = useCallback(
    (tool: McpTool) => {
      if (selectedNames.has(tool.name)) {
        onChange(selectedMcpTools.filter((t) => t.name !== tool.name));
      } else {
        onChange([...selectedMcpTools, tool]);
      }
    },
    [selectedNames, selectedMcpTools, onChange]
  );

  // Current page selection state
  const currentPageItems = filteredTools.slice(
    tablePageIndex * tablePageSize,
    (tablePageIndex + 1) * tablePageSize
  );
  const allPageSelected =
    currentPageItems.length > 0 && currentPageItems.every((t) => selectedNames.has(t.name));
  const somePageSelected =
    !allPageSelected && currentPageItems.some((t) => selectedNames.has(t.name));

  const handleTogglePageSelection = useCallback(() => {
    const pageNames = new Set(currentPageItems.map((t) => t.name));
    if (allPageSelected) {
      onChange(selectedMcpTools.filter((t) => !pageNames.has(t.name)));
    } else {
      onChange([
        ...selectedMcpTools,
        ...currentPageItems.filter((t) => !selectedNames.has(t.name)),
      ]);
    }
  }, [currentPageItems, allPageSelected, selectedMcpTools, selectedNames, onChange]);

  const columns: Array<EuiBasicTableColumn<McpTool>> = useMemo(
    () => [
      {
        field: 'selected',
        name: (
          <EuiCheckbox
            id="select-page-tools"
            checked={allPageSelected}
            indeterminate={somePageSelected}
            disabled={isDisabled || currentPageItems.length === 0}
            onChange={handleTogglePageSelection}
          />
        ),
        width: euiTheme.size.xl,
        render: (_: unknown, tool: McpTool) => (
          <EuiCheckbox
            id={`select-tool-${tool.name}`}
            checked={selectedNames.has(tool.name)}
            onChange={() => handleToggleTool(tool)}
            disabled={isDisabled}
          />
        ),
      },
      {
        field: 'name',
        name: labels.tools.bulkImportMcp.sourceSection.nameColumn,
        sortable: true,
        render: (name: string, tool: McpTool) => {
          const shortDescription = tool.description
            ? truncateAtSentence(tool.description)
            : undefined;
          return (
            <EuiFlexGroup direction="column" gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <strong>
                    <EuiHighlight search={searchQuery}>{name}</EuiHighlight>
                  </strong>
                </EuiText>
              </EuiFlexItem>
              {shortDescription && (
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    <EuiHighlight search={searchQuery}>{shortDescription}</EuiHighlight>
                  </EuiText>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          );
        },
      },
    ],
    [
      allPageSelected,
      somePageSelected,
      currentPageItems.length,
      handleTogglePageSelection,
      selectedNames,
      isDisabled,
      handleToggleTool,
      searchQuery,
      euiTheme.size.xl,
    ]
  );

  const handleClearSelection = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleSelectAll = useCallback(() => {
    onChange([...tools]);
  }, [onChange, tools]);

  const emptyMessage = useMemo(() => {
    if (isLoading) {
      return labels.tools.bulkImportMcp.sourceSection.loadingToolsMessage;
    }
    if (isDisabled) {
      return disabledMessage ?? null;
    }
    if (searchQuery && tools.length > 0 && filteredTools.length === 0) {
      return labels.tools.bulkImportMcp.sourceSection.noMatchingToolsMessage;
    }
    if (tools.length === 0) {
      return labels.tools.bulkImportMcp.sourceSection.noToolsMessage;
    }
    return undefined;
  }, [isDisabled, isLoading, searchQuery, tools.length, filteredTools.length, disabledMessage]);

  const tableHeader = (
    <McpToolsSelectionTableHeader
      isLoading={isLoading}
      pageIndex={tablePageIndex}
      pageSize={tablePageSize}
      totalCount={filteredTools.length}
      selectedCount={selectedMcpTools.length}
      onSelectAll={handleSelectAll}
      onClearSelection={handleClearSelection}
    />
  );

  return (
    <EuiPanel hasBorder paddingSize="m" css={tableContainerStyles(isDisabled)}>
      <EuiInMemoryTable
        items={filteredTools}
        columns={columns}
        itemId="name"
        search={searchConfig}
        onTableChange={({ page }: CriteriaWithPagination<McpTool>) => {
          if (page) {
            setTablePageIndex(page.index);
            if (page.size !== tablePageSize) {
              setTablePageSize(page.size);
              setTablePageIndex(0);
            }
          }
        }}
        pagination={{
          initialPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showPerPageOptions: true,
          pageIndex: tablePageIndex,
          pageSize: tablePageSize,
        }}
        sorting={{
          sort: {
            field: 'name',
            direction: 'asc',
          },
        }}
        loading={isLoading}
        error={isError ? labels.tools.bulkImportMcp.sourceSection.toolsErrorMessage : undefined}
        noItemsMessage={emptyMessage}
        tableCaption={labels.tools.bulkImportMcp.sourceSection.tableCaption}
        childrenBetween={tableHeader}
        rowProps={(item) => ({
          'data-test-subj': `bulkImportMcpToolsTableRow-${item.name}`,
        })}
        data-test-subj="bulkImportMcpToolsTable"
      />
    </EuiPanel>
  );
};
