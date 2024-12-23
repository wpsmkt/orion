import { Snackbar, Alert } from '@mui/material';
import { FeedbackState } from '../types';

interface FeedbackProps extends Omit<FeedbackState, 'open'> {
  open: boolean;
  onClose: () => void;
}

export default function Feedback({ open, message, severity, onClose }: FeedbackProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
} 