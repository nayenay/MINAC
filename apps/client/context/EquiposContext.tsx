import { createContext, useContext, useState, ReactNode } from "react";
import { getEquipos, createEquipo as createEquipoApi } from "../pages/api/equipos";
import React from "react";


interface EquiposContextType {
    equipos: any[];
    setEquipos: React.Dispatch<React.SetStateAction<any[]>>;
    createEquipo: (equipo: any) => Promise<any>;
    fetchEquipos: () => Promise<void>;
}

const EquiposContext = createContext<EquiposContextType>({
    equipos: [],
    setEquipos: () => {},
    createEquipo: async () => ({}),
    fetchEquipos: async () => {},
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

export const EquiposProvider: React.FC<EquiposContextProps> = ({children}) => {
    const [equipos, setEquipos] = useState<any[]>([]);

    const fetchEquipos = async () => {
        try {
            const response = await getEquipos();
            setEquipos(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const createEquipo = async (equipo: any): Promise<any> => {
        const response = await createEquipoApi(equipo);
        return response;
    };

    return (
        <EquiposContext.Provider value={{ equipos, createEquipo, fetchEquipos, setEquipos }}>
            {children}
        </EquiposContext.Provider>
    );
}
