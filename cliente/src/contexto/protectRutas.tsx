import { type ReactNode, createContext, useState, useEffect } from "react";

interface AuthContextType {
  autenticado: boolean;
  setAutenticado: (value: boolean) => void;

  usuarioInfo: UsuarioInfo | null;
  setUsuarioInfo: (value: UsuarioInfo | null) => void;

  rol: UsuarioEscuelaInfo | null;
  setRol: (value: UsuarioEscuelaInfo | null) => void;
}

interface ProtectRutasProvProps {
  children: ReactNode;
}

type UsuarioInfo = {
  usuario: string;
  error: boolean;
};

type UsuarioEscuelaInfo = {
  id_usuario: number;
  escuela: number | null;
  rol: string;
};

export const RutasProtegidasContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const ProtectRutasProv = ({ children }: ProtectRutasProvProps) => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);
  const [rol, setRol] = useState<UsuarioEscuelaInfo | null>(() => {
    const estadoGuardado = localStorage.getItem("usuarioEscuela");
    return estadoGuardado
      ? JSON.parse(estadoGuardado)
      : {
          id_usuario: 0,
          escuela: null,
          rol: "visita",
          usuario: "visita",
        };
  });
  const [usuarioEscuela, setUsuarioEscuela] =
    useState<UsuarioEscuelaInfo | null>(null);

  useEffect(() => {
    localStorage.setItem("usuarioEscuela", JSON.stringify(rol));
  }, [rol]);

  const contextValue = {
    autenticado,
    setAutenticado,
    usuarioInfo,
    setUsuarioInfo,
    rol,
    setRol,
    usuarioEscuela,
    setUsuarioEscuela,
  };

  return (
    <RutasProtegidasContext.Provider value={contextValue}>
      {children}
    </RutasProtegidasContext.Provider>
  );
};

export default ProtectRutasProv;
