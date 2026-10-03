// Reusable Confirmation Dialog
import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) {
  const isDanger = variant === 'danger';

  const footer = (
    <>
      <Button
        variant="outline"
        size="md"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={isDanger ? 'danger' : 'primary'}
        size="md"
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={footer}
    >
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {isDanger ? (
            <Trash2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
