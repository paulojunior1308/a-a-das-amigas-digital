import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ComandaContextType {
  comandaNumber: number | null;
  setComandaNumber: (number: number | null) => void;
  isComandaValid: boolean;
}

const ComandaContext = createContext<ComandaContextType | undefined>(undefined);

export function ComandaProvider({ children }: { children: ReactNode }) {
  const [comandaNumber, setComandaNumber] = useState<number | null>(() => {
    // Recuperar do sessionStorage ao iniciar
    const stored = sessionStorage.getItem("comandaNumber");
    return stored ? parseInt(stored, 10) : null;
  });

  // Salvar no sessionStorage sempre que mudar
  useEffect(() => {
    if (comandaNumber !== null) {
      sessionStorage.setItem("comandaNumber", comandaNumber.toString());
    } else {
      sessionStorage.removeItem("comandaNumber");
    }
  }, [comandaNumber]);

  const isComandaValid = comandaNumber !== null && comandaNumber > 0;

  return (
    <ComandaContext.Provider
      value={{
        comandaNumber,
        setComandaNumber,
        isComandaValid,
      }}
    >
      {children}
    </ComandaContext.Provider>
  );
}

export function useComanda() {
  const context = useContext(ComandaContext);
  if (context === undefined) {
    throw new Error("useComanda must be used within a ComandaProvider");
  }
  return context;
}
