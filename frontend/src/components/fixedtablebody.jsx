import { Children } from 'react';
import { TableBody, TableCell, TableRow } from '@mui/material';

function FixedTableBody({ children, rowsPerPage = 5, fillerHeight = 72, ...props }) {
  const rows = Children.toArray(children);
  const fillerCount = Math.max(0, rowsPerPage - rows.length);

  return (
    <TableBody {...props}>
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
