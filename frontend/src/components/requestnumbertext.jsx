import Box from '@mui/material/Box';

const REQUEST_NUMBER_PATTERN = /(LR-[A-Z0-9-]+)/gi;
const EXACT_REQUEST_NUMBER_PATTERN = /^LR-[A-Z0-9-]+$/i;

export default function RequestNumberText({ children }) {
  const text = String(children ?? '');

  if (!text.match(REQUEST_NUMBER_PATTERN)) {
    return children;
  }

  return text.split(REQUEST_NUMBER_PATTERN).map((part, index) =>
    EXACT_REQUEST_NUMBER_PATTERN.test(part) ? (
      <Box
        component="span"
        className="system-table-request-number"
        key={`${part}-${index}`}
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  );
}
