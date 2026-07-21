import React from 'react';

interface ModalActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmLoading?: boolean;
  isDestructive?: boolean;
}

const ModalActions: React.FC<ModalActionsProps> = ({
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmLoading = false,
  isDestructive = false,
}) => {
  return (
    <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
      <button
        onClick={onCancel}
        disabled={confirmLoading}
        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelLabel}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmLoading}
        className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isDestructive
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {confirmLoading ? 'Loading...' : confirmLabel}
      </button>
    </div>
  );
};

export default ModalActions;