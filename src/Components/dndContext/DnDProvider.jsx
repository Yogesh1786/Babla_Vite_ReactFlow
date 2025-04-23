import { useState, useContext } from "react";
import DnDContext from "../dndContext/DnDContext";

export const DnDProvider = ({ children }) => {
  const [type, setType] = useState(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = () => useContext(DnDContext);
