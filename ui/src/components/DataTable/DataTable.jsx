import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  DataTableSkeleton,
} from '@carbon/react';

import DataTableError from './DataTableError.jsx';
import DataTableEmpty from './DataTableEmpty.jsx';

const DataTable = function DataTable({
  title, description, toolbarItems, headers, renderRow, data, loading, error, refresh, emptyTitle, emptyDescription, emptyAction,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(data?.filter((item) => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, data]);

  if (loading && !data) {
    return (
      <DataTableSkeleton headers={headers} description={description} aria-label={`${title}-table`} />
    );
  }

  return (
    <TableContainer title={title} description={description}>
      {!error && (
      <>
        {(rows && rows.length !== 0) && (
        <>
          <TableToolbar>
            <TableToolbarContent>
              <TableToolbarSearch onChange={(e) => { setSearchQuery(e.target.value); }} value={searchQuery} placeholder="Filter" />
              {toolbarItems}
            </TableToolbarContent>
          </TableToolbar>
          <Table size="md" useZebraStyles={false}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader id={header.key} key={header}>
                    {header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.slice(indexOfFirstItem, indexOfLastItem).map((row) => row != null && renderRow(row))}
            </TableBody>
          </Table>
        </>
        )}
        {(!rows || rows.length === 0) && <DataTableEmpty title={emptyTitle} description={emptyDescription} action={emptyAction} />}
        {rows && rows.length !== 0
        && (
        <TableToolbar
          aria-label={`${title}-pagination`}
        >
          <TableToolbarContent>
            <Pagination
              disabled={error}
              backwardText="Previous page"
              forwardText="Next page"
              itemsPerPageText="Items per page:"
              pageNumberText="Page Number"
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setItemsPerPage(pageSize);
              }}
              page={currentPage}
              pageSize={itemsPerPage}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={data.length}
            />
          </TableToolbarContent>
        </TableToolbar>
        )}
      </>
      )}
      {error && <DataTableError resource={title} error={error} retry={refresh} />}
    </TableContainer>
  );
};

DataTable.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  emptyTitle: PropTypes.string.isRequired,
  emptyDescription: PropTypes.string.isRequired,
  emptyAction: PropTypes.node.isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  toolbarItems: PropTypes.node,
  renderRow: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  refresh: PropTypes.func.isRequired,
};

DataTable.defaultProps = {
  toolbarItems: null,
};

export default DataTable;
