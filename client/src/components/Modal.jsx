import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-surface-100">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-800 transition-colors text-surface-200">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
