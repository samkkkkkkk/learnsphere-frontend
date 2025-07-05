import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface FocusManagerContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openModal: () => void;
  closeModal: () => void;
  minimizeModal: () => void;
  restoreModal: () => void;
}

const FocusManagerContext = createContext<FocusManagerContextType | undefined>(undefined);

export const useFocusManager = () => {
  const context = useContext(FocusManagerContext);
  if (context === undefined) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  return context;
};

interface FocusManagerProviderProps {
  children: ReactNode;
}

export const FocusManagerProvider: React.FC<FocusManagerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeModal = () => {
    setIsMinimized(true);
  };

  const restoreModal = () => {
    setIsMinimized(false);
  };

  return (
    <FocusManagerContext.Provider
      value={{
        isOpen,
        isMinimized,
        openModal,
        closeModal,
        minimizeModal,
        restoreModal,
      }}
    >
      {children}
    </FocusManagerContext.Provider>
  );
}; 