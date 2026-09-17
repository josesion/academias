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
  // id_usuario: number;
  //escuela: number | null;
  rol: string;
  usuario: string;
  razon_social: string;
  tipo: string;
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
          rol: "visita",
          usuario: "visita",
        };
  });
  const [usuarioEscuela, setUsuarioEscuela] =
    useState<UsuarioEscuelaInfo | null>(null);

  useEffect(() => {
    if (autenticado && rol) {
      localStorage.setItem("usuarioEscuela", JSON.stringify(rol));
    } else {
      localStorage.removeItem("usuarioEscuela");
    }
  }, [rol, autenticado]);

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
