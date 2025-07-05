import React, { createContext, useContext, useState } from "react";

const HoveredBoardContext = createContext();

export const HoveredBoardProvider = ({ children }) => {
  const [hoveredBoardId, setHoveredBoardId] = useState(null);

  return (
    <HoveredBoardContext.Provider value={{ hoveredBoardId, setHoveredBoardId }}>
      {children}
    </HoveredBoardContext.Provider>
  );
};

export const useHoveredBoard = () => useContext(HoveredBoardContext);
