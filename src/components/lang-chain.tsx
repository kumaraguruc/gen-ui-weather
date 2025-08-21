import React, { ReactNode, createContext, useContext } from 'react';
import { getWeatherData, getWeatherNews } from '../services/langChainService';

// Define the context type
interface LangChainContextType {
  getWeatherData: (latitude: number, longitude: number) => Promise<any>;
  getWeatherNews: () => Promise<any>;
}

// Create the context with default values
const LangChainContext = createContext<LangChainContextType>({
  getWeatherData: async () => ({}),
  getWeatherNews: async () => ({}),
});

// Custom hook to use the LangChain context
export const useLangChain = () => useContext(LangChainContext);

interface LangChainProps {
  children: ReactNode;
}

/**
 * LangChain component
 * This component serves as a wrapper/provider for LangChain functionality
 */
const LangChain: React.FC<LangChainProps> = ({ children }) => {
  // The value to be provided by the context
  const contextValue: LangChainContextType = {
    getWeatherData,
    getWeatherNews,
  };

  return (
    <LangChainContext.Provider value={contextValue}>
      {children}
    </LangChainContext.Provider>
  );
};

export default LangChain;
