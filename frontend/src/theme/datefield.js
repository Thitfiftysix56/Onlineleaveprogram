export const standardDateFieldSx = (primaryColor) => ({
  cursor: 'pointer',
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    cursor: 'pointer',
    ...(primaryColor
      ? { '&.Mui-focused fieldset': { borderColor: primaryColor } }
      : {}),
  },
  '& .MuiInputBase-input': {
    cursor: 'pointer',
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#6B7280',
    opacity: 1,
  },
  ...(primaryColor
    ? { '& .MuiInputLabel-root.Mui-focused': { color: primaryColor } }
    : {}),
});

export const standardDateIconSx = {
  color: '#374151',
};
