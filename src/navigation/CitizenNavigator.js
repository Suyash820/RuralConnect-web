// src/navigation/CitizenNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import Dashboard from '../screens/citizen/Dashboard';
import FileComplaint from '../screens/citizen/FileComplaint';
import MyComplaints from '../screens/citizen/MyComplaints';
import Schemes from '../screens/citizen/Schemes';
import SchemeDetail from '../screens/citizen/SchemeDetail';
import EligibilityChecker from '../screens/citizen/EligibilityChecker';
import Learning from '../screens/citizen/Learning';
import VideoPlayer from '../screens/citizen/VideoPlayer';
import Jobs from '../screens/citizen/Jobs';
import JobDetail from '../screens/citizen/JobDetail';
import Profile from '../screens/citizen/Profile';
import Settings from '../screens/citizen/Settings';
import ComplaintDetail from '../screens/citizen/ComplaintDetail';
import TrackComplaint from '../screens/citizen/TrackComplaint';
import Chatbot from '../screens/citizen/Chatbot';
import OfflineContent from '../screens/citizen/OfflineContent';

const Stack = createStackNavigator();
const Tab = Platform.OS === 'ios' 
  ? createBottomTabNavigator() 
  : createMaterialBottomTabNavigator();

// Tab Navigator Component
function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Complaints':
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              break;
            case 'Schemes':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Learning':
              iconName = focused ? 'book-open' : 'book-open-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
      barStyle={{ backgroundColor: '#ffffff' }}
      activeColor="#2196F3"
      inactiveColor="#95a5a6"
      labeled={true}
    >
      <Tab.Screen 
        name="Home" 
        component={Dashboard} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Complaints" 
        component={ComplaintsStack} 
        options={{ tabBarLabel: 'Complaints' }}
      />
      <Tab.Screen 
        name="Schemes" 
        component={SchemesStack} 
        options={{ tabBarLabel: 'Schemes' }}
      />
      <Tab.Screen 
        name="Learning" 
        component={LearningStack} 
        options={{ tabBarLabel: 'Learning' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobsStack} 
        options={{ tabBarLabel: 'Jobs' }}
      />
    </Tab.Navigator>
  );
}

// Complaints Stack Navigator
function ComplaintsStack() {
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
        name="MyComplaints" 
        component={MyComplaints} 
        options={{ title: 'My Complaints' }}
      />
      <Stack.Screen 
        name="FileComplaint" 
        component={FileComplaint} 
        options={{ title: 'File Complaint' }}
      />
      <Stack.Screen 
        name="ComplaintDetail" 
        component={ComplaintDetail} 
        options={{ title: 'Complaint Details' }}
      />
      <Stack.Screen 
        name="TrackComplaint" 
        component={TrackComplaint} 
        options={{ title: 'Track Complaint' }}
      />
    </Stack.Navigator>
  );
}

// Schemes Stack Navigator
function SchemesStack() {
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
        name="SchemesList" 
        component={Schemes} 
        options={{ title: 'Government Schemes' }}
      />
      <Stack.Screen 
        name="SchemeDetail" 
        component={SchemeDetail} 
        options={{ title: 'Scheme Details' }}
      />
      <Stack.Screen 
        name="EligibilityChecker" 
        component={EligibilityChecker} 
        options={{ title: 'Check Eligibility' }}
      />
      <Stack.Screen 
        name="Chatbot" 
        component={Chatbot} 
        options={{ title: 'AI Assistant' }}
      />
    </Stack.Navigator>
  );
}

// Learning Stack Navigator
function LearningStack() {
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
        name="LearningHome" 
        component={Learning} 
        options={{ title: 'Learning Resources' }}
      />
      <Stack.Screen 
        name="VideoPlayer" 
        component={VideoPlayer} 
        options={{ title: 'Video Player' }}
      />
      <Stack.Screen 
        name="OfflineContent" 
        component={OfflineContent} 
        options={{ title: 'Offline Content' }}
      />
    </Stack.Navigator>
  );
}

// Jobs Stack Navigator
function JobsStack() {
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
        name="JobsList" 
        component={Jobs} 
        options={{ title: 'Job Portal' }}
      />
      <Stack.Screen 
        name="JobDetail" 
        component={JobDetail} 
        options={{ title: 'Job Details' }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#607D8B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileHome" 
        component={Profile} 
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings} 
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

// Main Citizen Navigator
export default function CitizenNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CitizenTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="CitizenTabs" 
        component={CitizenTabs} 
      />
      <Stack.Screen 
        name="ProfileStack" 
        component={ProfileStack} 
      />
      <Stack.Screen 
        name="ComplaintDetailModal" 
        component={ComplaintDetail}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Complaint Details'
        }}
      />
    </Stack.Navigator>
  );
}

// Also export the stack navigators for use in other parts of the app
export { ComplaintsStack, SchemesStack, LearningStack, JobsStack, ProfileStack };