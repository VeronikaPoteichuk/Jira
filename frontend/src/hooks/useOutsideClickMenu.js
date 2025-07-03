import { useEffect, useRef, useState } from "react";

export const useOutsideClickMenu = () => {
  const [activeId, setActiveId] = useState(null);
  const menuRefs = useRef({});

  const toggleMenu = id => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const registerRef = (id, ref) => {
    if (ref) {
      menuRefs.current[id] = ref;
    }
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        activeId &&
        menuRefs.current[activeId] &&
        !menuRefs.current[activeId].contains(e.target)
      ) {
        setActiveId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeId]);

  return {
    activeId,
    toggleMenu,
    registerRef,
    closeMenu: () => setActiveId(null),
  };
};
