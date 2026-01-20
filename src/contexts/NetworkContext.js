// src/contexts/NetworkContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

const NetworkContext = createContext({});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('wifi');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      
      // Show alert when going offline
      if (!state.isConnected) {
        Alert.alert(
          'Offline Mode',
          'You are offline. App will work in offline mode and sync when connected.',
          [{ text: 'OK' }]
        );
      }
    });

    return unsubscribe;
  }, []);

  const isLowBandwidth = () => {
    return connectionType === 'cellular' || connectionType === '2g' || connectionType === '3g';
  };

  return (
    <NetworkContext.Provider value={{
      isConnected,
      connectionType,
      isLowBandwidth
    }}>
      {children}
    </NetworkContext.Provider>
  );
};