import React from 'react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-head">
          <h3>{title}</h3>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}

