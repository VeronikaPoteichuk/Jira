import React, { createContext, useContext, useState } from "react";

const HoveredEntityContext = createContext();

export const HoveredEntityProvider = ({ children }) => {
  const [hoveredEntity, setHoveredEntity] = useState({
    type: null, // 'project' | 'board'
    id: null,
  });

  const setHoveredProjectId = id => {
    setHoveredEntity(id ? { type: "project", id } : { type: null, id: null });
  };

  const setHoveredBoardId = id => {
    setHoveredEntity(id ? { type: "board", id } : { type: null, id: null });
  };

  return (
    <HoveredEntityContext.Provider
      value={{
        hoveredEntity,
        setHoveredBoardId,
        setHoveredProjectId,
      }}
    >
      {children}
    </HoveredEntityContext.Provider>
  );
};

export const useHoveredEntity = () => useContext(HoveredEntityContext);
