import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100 max-h-screen overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;



/* 


const [isModalOpen, setIsModalOpen] = React.useState(false);

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
  showCloseButton
>
  <p className="text-gray-700 mb-4">Are you sure?</p>
  <ModalActions
    onConfirm={() => {
      // Handle confirm action
      setIsModalOpen(false);
    }}
    onCancel={() => setIsModalOpen(false)}
    confirmLabel="Delete"
    isDestructive
  />
</Modal>


*/