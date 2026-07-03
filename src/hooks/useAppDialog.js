import { useContext } from 'react';
import { AppDialogContext } from '../contexts/AppDialogBase';

export const useAppDialog = () => {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
};
