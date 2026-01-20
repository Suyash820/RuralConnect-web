// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeSql } from '../services/database';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password, role = 'citizen') => {
    try {
      // In production, this would be API call
      // For demo, we'll create local user
      const userData = {
        id: 1,
        name: 'Demo User',
        phone,
        role,
        token: 'demo_token'
      };

      // Save to local database
      await executeSql(
        `INSERT OR REPLACE INTO users (id, name, phone, role, token) VALUES (?, ?, ?, ?, ?)`,
        [userData.id, userData.name, phone, role, 'demo_token']
      );

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Save to local database
      const result = await executeSql(
        `INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)`,
        [userData.name, userData.email, userData.phone, userData.role || 'citizen']
      );

      const newUser = {
        id: result.insertId,
        ...userData
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      await executeSql(
        `UPDATE users SET name = ?, email = ? WHERE id = ?`,
        [profileData.name, profileData.email, user.id]
      );
      
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};