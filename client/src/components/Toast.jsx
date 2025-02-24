import { XMarkIcon } from '@heroicons/react/24/outline';

export function Toast({ type, message, onClose }) {
  const types = {
    success: {
      bg: 'bg-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const { bg, icon } = types[type] || types.success;

  return (
    <div className={`fixed top-4 right-4 flex items-center ${bg} text-white px-4 py-3 rounded-lg shadow-lg
                    animate-slide-in z-50`}>
      <div className="mr-2">
        {icon}
      </div>
      <div className="mr-8">{message}</div>
      <button onClick={onClose} className="absolute right-2">
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
} 