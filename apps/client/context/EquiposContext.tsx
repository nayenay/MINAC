import { createContext, useContext, useState, ReactNode } from "react";
import { getEquipos, createEquipo } from "../pages/api/equipos";

const EquiposContext = createContext({
    equipos: [],
    createEquipo: () => {},
});

interface EquiposContextProps {
    children: ReactNode;
}

export const useEquipos = () => {
    const context = useContext(EquiposContext);
  
    if (context === undefined) {
      throw new Error("useEquipos must be used within a EquiposProvider");
    }
    return context;
};
