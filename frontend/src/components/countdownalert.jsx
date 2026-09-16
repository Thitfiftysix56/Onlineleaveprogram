import { Alert, Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION_SECONDS = 5;

export default function CountdownAlert({
  durationSeconds = DEFAULT_DURATION_SECONDS,
  onClose,
  action,
  children,
  ...alertProps
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setSecondsLeft(durationSeconds);
    const intervalId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          onCloseRef.current?.();
          return 0;
        }
        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationSeconds, children]);

  return (
    <Alert
      {...alertProps}
      onClose={onClose}
      action={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" sx={{ color: 'inherit', fontSize: '12px', whiteSpace: 'nowrap' }}>
            ปิดใน {secondsLeft} วินาที
          </Typography>
          {action}
        </Box>
      )}
    >
      {children}
    </Alert>
  );
}
