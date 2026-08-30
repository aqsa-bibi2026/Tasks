import React, {
  useEffect
} from 'react';

import {
  CheckCircle2,
  CircleAlert,
  X
} from 'lucide-react';

export default function Toast({
  toast,
  onClose
}) {
  useEffect(() => {
    if (!toast) return;

    const timer =
      setTimeout(onClose, 3500);

    return () =>
      clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon =
    toast.tone === 'error'
      ? CircleAlert
      : CheckCircle2;

  return (
    <div
      className={`toast ${toast.tone}`}
    >
      <Icon size={17} />
      <span>{toast.message}</span>

      <button
        type="button"
        onClick={onClose}
      >
        <X size={14} />
      </button>
    </div>
  );
}
