import { Children } from 'react';
import { Box, TableBody, TableCell, TableRow } from '@mui/material';

export function FixedGridFillerRows({ visibleRows, rowsPerPage = 5, rowHeight = 72 }) {
  const fillerCount = Math.max(0, rowsPerPage - visibleRows);

  return Array.from({ length: fillerCount }, (_, index) => (
    <Box
      key={`fixed-grid-filler-${index}`}
      className="system-data-grid-row system-data-grid-filler"
      aria-hidden="true"
      sx={{
        height: `${rowHeight}px`,
        borderBottom: '1px solid #EEF0F3',
        boxSizing: 'border-box',
      }}
    />
  ));
}

function FixedTableBody({ children, rowsPerPage = 5, fillerHeight = 72, sx, ...props }) {
  const rows = Children.toArray(children);
  const fillerCount = Math.max(0, rowsPerPage - rows.length);

  return (
    <TableBody
      {...props}
      sx={{
        '& > .MuiTableRow-root': {
          height: `${fillerHeight}px`,
        },
        ...sx,
      }}
    >
      {rows}
      {Array.from({ length: fillerCount }, (_, index) => (
        <TableRow key={`fixed-table-filler-${index}`} aria-hidden="true" sx={{ height: `${fillerHeight}px` }}>
          <TableCell colSpan={100} sx={{ padding: 0, borderBottom: '1px solid #E5E7EB' }} />
        </TableRow>
      ))}
    </TableBody>
  );
}

export default FixedTableBody;
