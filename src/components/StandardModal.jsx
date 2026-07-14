import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function StandardModal({ open, title, children, actionLabel, onAction }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="gmm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="gmm-standard-modal-title">
      <div className="gmm-modal-dialog">
        <div className="gmm-modal-header">
          <h2 id="gmm-standard-modal-title">{title}</h2>
        </div>

        <div className="gmm-modal-body">{children}</div>

        <div className="gmm-modal-footer">
          <button type="button" className="gmm-modal-close" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
