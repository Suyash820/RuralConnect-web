// src/navigation/OfficerNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import officer screens
import OfficerDashboard from '../screens/officer/Dashboard';
import OfficerComplaints from '../screens/officer/Complaints';
import ComplaintDetail from '../screens/officer/ComplaintDetail';
import AssignedTasks from '../screens/officer/AssignedTasks';
import Reports from '../screens/officer/Reports';
import OfficerProfile from '../screens/officer/Profile';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
function CustomDrawerContent(props) {
  const { navigation } = props;
  
  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'view-dashboard',
      screen: 'OfficerDashboard',
    },
    {
      label: 'Complaints',
      icon: 'alert-circle',
      screen: 'OfficerComplaints',
    },
    {
      label: 'Assigned Tasks',
      icon: 'clipboard-check',
      screen: 'AssignedTasks',
    },
    {
      label: 'Reports',
      icon: 'chart-bar',
      screen: 'Reports',
    },
    {
      label: 'Profile',
      icon: 'account',
      screen: 'OfficerProfile',
    },
    {
      label: 'Logout',
      icon: 'logout',
      action: 'logout',
    },
  ];

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Avatar.Text 
          size={60} 
          label="O" 
          style={styles.avatar}
        />
        <Title style={styles.drawerTitle}>Officer Portal</Title>
        <Caption style={styles.drawerSubtitle}>Manage citizen complaints</Caption>
      </View>
      
      <Divider style={styles.divider} />
      
      <Drawer.Section>
        {menuItems.map((item, index) => (
          <DrawerItem
            key={index}
            label={item.label}
            icon={({ color, size }) => (
              <Icon name={item.icon} color={color} size={size} />
            )}
            onPress={() => {
              if (item.action === 'logout') {
                // Handle logout
                navigation.navigate('Auth');
              } else {
                navigation.navigate(item.screen);
              }
            }}
          />
        ))}
      </Drawer.Section>
    </DrawerContentScrollView>
  );
}

// Main Drawer Navigator
function OfficerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="OfficerDashboard" 
        component={OfficerDashboard} 
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="OfficerComplaints" 
        component={OfficerComplaintsStack} 
        options={{
          drawerLabel: 'Complaints',
          drawerIcon: ({ color, size }) => (
            <Icon name="alert-circle" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AssignedTasks" 
        component={AssignedTasks} 
        options={{
          drawerLabel: 'Assigned Tasks',
          drawerIcon: ({ color, size }) => (
            <Icon name="clipboard-check" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={Reports} 
        options={{
          drawerLabel: 'Reports',
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-bar" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="OfficerProfile" 
        component={OfficerProfile} 
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

// Complaints Stack Navigator for Officer
function OfficerComplaintsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ComplaintsList" 
        component={OfficerComplaints} 
        options={{ title: 'Manage Complaints' }}
      />
      <Stack.Screen 
        name="ComplaintDetail" 
        component={ComplaintDetail} 
        options={{ title: 'Complaint Details' }}
      />
    </Stack.Navigator>
  );
}

// Main Officer Navigator
export default function OfficerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="OfficerDrawer" 
        component={OfficerDrawer} 
      />
    </Stack.Navigator>
  );
}

// Styles
const styles = {
  drawerHeader: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    marginVertical: 10,
  },
};