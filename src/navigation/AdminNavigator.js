// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import admin screens
import AdminDashboard from '../screens/admin/Dashboard';
import ManageUsers from '../screens/admin/ManageUsers';
import AllComplaints from '../screens/admin/AllComplaints';
import Analytics from '../screens/admin/Analytics';
import ContentManagement from '../screens/admin/ContentManagement';
import SystemSettings from '../screens/admin/SystemSettings';
import AdminProfile from '../screens/admin/Profile';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main Drawer Navigator for Admin
function AdminDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 300,
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ManageUsers" 
        component={ManageUsersStack} 
        options={{
          drawerLabel: 'Manage Users',
          drawerIcon: ({ color, size }) => (
            <Icon name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AllComplaints" 
        component={AllComplaintsStack} 
        options={{
          drawerLabel: 'All Complaints',
          drawerIcon: ({ color, size }) => (
            <Icon name="alert-circle" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Analytics" 
        component={Analytics} 
        options={{
          drawerLabel: 'Analytics',
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ContentManagement" 
        component={ContentManagementStack} 
        options={{
          drawerLabel: 'Content',
          drawerIcon: ({ color, size }) => (
            <Icon name="file-document" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="SystemSettings" 
        component={SystemSettings} 
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="cog" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminProfile" 
        component={AdminProfile} 
        options={{
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Stack Navigators for Admin
function ManageUsersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="UsersList" 
        component={ManageUsers} 
        options={{ title: 'Manage Users' }}
      />
    </Stack.Navigator>
  );
}

function AllComplaintsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF9800',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ComplaintsOverview" 
        component={AllComplaints} 
        options={{ title: 'All Complaints' }}
      />
    </Stack.Navigator>
  );
}

function ContentManagementStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9C27B0',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ContentMain" 
        component={ContentManagement} 
        options={{ title: 'Content Management' }}
      />
    </Stack.Navigator>
  );
}

// Main Admin Navigator
export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="AdminMain" 
        component={AdminDrawer} 
      />
    </Stack.Navigator>
  );
}