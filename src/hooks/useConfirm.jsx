import React, { useCallback, useRef, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const defaults = {
  title: 'Please Confirm',
  message: 'Are you sure you want to continue?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

export default function useConfirm() {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState({ ...defaults, open: false });

  const confirm = useCallback((options = {}) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialog({
      ...defaults,
      ...options,
      open: true,
    });
  }), []);

  const close = useCallback((result) => {
    setDialog((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const ConfirmDialog = useCallback(() => (
    <Modal open={dialog.open} title={dialog.title} onClose={() => close(false)}>
      <p className="muted">{dialog.message}</p>
      <div className="inline-form">
        <Button variant="ghost" onClick={() => close(false)}>{dialog.cancelText}</Button>
        <Button onClick={() => close(true)}>{dialog.confirmText}</Button>
      </div>
    </Modal>
  ), [close, dialog]);

  return { confirm, ConfirmDialog };
}
