import React from "react";
import "./style.css";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="settings-modal" onClick={onClose}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
