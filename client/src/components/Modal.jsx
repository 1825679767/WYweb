import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">{message}</h3>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black rounded px-4 py-2 hover:bg-gray-400"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 