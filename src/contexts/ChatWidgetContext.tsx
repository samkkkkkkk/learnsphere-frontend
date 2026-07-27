import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChatWidgetContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (context === undefined) {
    throw new Error('useChatWidget must be used within a ChatWidgetProvider');
  }
  return context;
};

interface ChatWidgetProviderProps {
  children: ReactNode;
}

export const ChatWidgetProvider: React.FC<ChatWidgetProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <ChatWidgetContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
      {children}
    </ChatWidgetContext.Provider>
  );
};
