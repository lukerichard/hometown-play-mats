import { useCallback, useMemo, useState } from 'react';
import { AppDialogContext } from './AppDialogBase';

export const AppDialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const closeDialog = useCallback((value) => {
    setDialog((current) => {
      current?.resolve?.(value);
      return null;
    });
  }, []);

  const alert = useCallback((message, options = {}) => (
    new Promise((resolve) => {
      setDialog({
        type: 'alert',
        title: options.title || 'Heads up',
        message,
        confirmLabel: options.confirmLabel || 'Done',
        tone: options.tone || 'default',
        resolve,
      });
    })
  ), []);

  const confirm = useCallback((message, options = {}) => (
    new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title: options.title || 'Please confirm',
        message,
        confirmLabel: options.confirmLabel || 'Continue',
        cancelLabel: options.cancelLabel || 'Cancel',
        tone: options.tone || 'default',
        resolve,
      });
    })
  ), []);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {dialog && (
        <>
          <div className="cart-confirmation-scrim" onClick={() => closeDialog(dialog.type === 'confirm' ? false : undefined)} />
          <section
            className={`app-dialog-modal ${dialog.tone ? `is-${dialog.tone}` : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
          >
            <div className="cart-confirmation-header">
              <div>
                <span>{dialog.type === 'confirm' ? 'Confirmation' : 'Message'}</span>
                <h2 id="app-dialog-title">{dialog.title}</h2>
              </div>
              <button
                type="button"
                className="cart-confirmation-close"
                onClick={() => closeDialog(dialog.type === 'confirm' ? false : undefined)}
                aria-label="Close message"
              >
                X
              </button>
            </div>
            <div className="app-dialog-body">
              <p>{dialog.message}</p>
            </div>
            <div className="cart-confirmation-actions">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => closeDialog(false)}
                >
                  {dialog.cancelLabel}
                </button>
              )}
              <button
                type="button"
                className="primary-action"
                onClick={() => closeDialog(dialog.type === 'confirm' ? true : undefined)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </section>
        </>
      )}
    </AppDialogContext.Provider>
  );
};
