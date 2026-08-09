import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import React from "react";
import {
  getEquipos as getEquiposApi,
  createEquipo as createEquipoApi,
} from "../services/equipos";
import type { CreateEquipoPayload, Equipo } from "../types/equipo";

interface EquiposContextType {
  equipos: Equipo[];
  setEquipos: React.Dispatch<React.SetStateAction<Equipo[]>>;
  loading: boolean;
  error: string | null;
  createEquipo: (equipo: CreateEquipoPayload) => Promise<Equipo>;
  fetchEquipos: () => Promise<void>;
}

const EquiposContext = createContext<EquiposContextType | undefined>(
  undefined,
);

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

export const EquiposProvider: React.FC<EquiposContextProps> = ({
  children,
}) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEquiposApi();
      setEquipos(data);
    } catch {
      setError("No se pudieron cargar los equipos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createEquipo = useCallback(
    async (equipo: CreateEquipoPayload): Promise<Equipo> => {
      const created = await createEquipoApi(equipo);
      setEquipos((prev) => {
        const exists = prev.some((item) => item._id === created._id);
        if (exists) {
          return prev.map((item) =>
            item._id === created._id ? created : item,
          );
        }
        return [...prev, created];
      });
      return created;
    },
    [],
  );

  return (
    <EquiposContext.Provider
      value={{
        equipos,
        createEquipo,
        fetchEquipos,
        setEquipos,
        loading,
        error,
      }}
    >
      {children}
    </EquiposContext.Provider>
  );
};
