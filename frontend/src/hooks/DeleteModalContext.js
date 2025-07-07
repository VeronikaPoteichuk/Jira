import React, { createContext, useContext, useState, useCallback } from "react";

const DeleteModalContext = createContext();

export const DeleteModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [item, setItem] = useState(null);
  const [onConfirm, setOnConfirm] = useState(null);
  const [getTitle, setGetTitle] = useState(() => () => "this item");

  const openModal = useCallback((itemToDelete, confirmCallback, titleFn) => {
    setItem(itemToDelete);
    setOnConfirm(() => confirmCallback);
    setGetTitle(() => titleFn || (() => "this item"));
    setIsVisible(true);
  }, []);

  const closeModal = () => {
    setIsVisible(false);
    setItem(null);
    setOnConfirm(null);
  };

  const DeleteModal = () => {
    if (!isVisible || !item) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-contentt" onClick={e => e.stopPropagation()}>
          <h3 className="modal-title">Delete {getTitle(item)}?</h3>
          <p className="modal-description">
            Are you sure you want to delete {getTitle(item)}? This action cannot be undone.
          </p>
          <div className="modal-buttons">
            <button className="cancel-button" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="delete-button"
              onClick={() => {
                if (onConfirm) onConfirm(item);
                closeModal();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DeleteModalContext.Provider value={{ openModal }}>
      {children}
      <DeleteModal />
    </DeleteModalContext.Provider>
  );
};

export const useDeleteModal = () => {
  const context = useContext(DeleteModalContext);
  if (!context) {
    throw new Error("useDeleteModal must be used within a DeleteModalProvider");
  }
  return context;
};
