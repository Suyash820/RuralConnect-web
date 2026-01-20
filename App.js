import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

// Import contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import i18n
import './src/i18n';

// Import navigator
import AppNavigator from './src/navigation/AppNavigator';

// Import database
import { initDatabase } from './src/services/database';

export default function App() {
  useEffect(() => {
    // Initialize database
    initDatabase();
    
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <NetworkProvider>
            <AuthProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </AuthProvider>
          </NetworkProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// // App.js - SIMPLIFIED VERSION FOR TESTING
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Button,
//   Alert,
//   Image,
//   TouchableOpacity
// } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Create stack navigator
// const Stack = createNativeStackNavigator();

// // Simple screens for testing
// function HomeScreen({ navigation }) {
//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Rural e-Governance</Text>
//         <Text style={styles.subtitle}>Testing Mode</Text>
//       </View>
      
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>File Complaint</Text>
//         <Text>Report issues like potholes, garbage, etc.</Text>
//         <Button
//           title="Go to File Complaint"
//           onPress={() => navigation.navigate('FileComplaint')}
//         />
//       </View>
      
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Check Schemes</Text>
//         <Text>Check eligibility for government schemes</Text>
//         <Button
//           title="Go to Schemes"
//           onPress={() => navigation.navigate('Schemes')}
//         />
//       </View>
      
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Learning</Text>
//         <Text>Educational resources and videos</Text>
//         <Button
//           title="Go to Learning"
//           onPress={() => navigation.navigate('Learning')}
//         />
//       </View>
      
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Job Portal</Text>
//         <Text>Find job opportunities</Text>
//         <Button
//           title="Go to Jobs"
//           onPress={() => navigation.navigate('Jobs')}
//         />
//       </View>
      
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Role Testing</Text>
//         <View style={styles.buttonRow}>
//           <TouchableOpacity 
//             style={[styles.roleButton, {backgroundColor: '#4CAF50'}]}
//             onPress={() => Alert.alert('Role', 'Citizen Mode')}
//           >
//             <Text style={styles.buttonText}>Citizen</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.roleButton, {backgroundColor: '#2196F3'}]}
//             onPress={() => Alert.alert('Role', 'Officer Mode')}
//           >
//             <Text style={styles.buttonText}>Officer</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.roleButton, {backgroundColor: '#FF9800'}]}
//             onPress={() => Alert.alert('Role', 'Admin Mode')}
//           >
//             <Text style={styles.buttonText}>Admin</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// function FileComplaintScreen() {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');

//   const handleSubmit = () => {
//     Alert.alert(
//       'Success',
//       'Complaint filed successfully! (Offline mode)',
//       [{ text: 'OK' }]
//     );
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.screenTitle}>File Complaint</Text>
      
//       <View style={styles.inputContainer}>
//         <Text>Title:</Text>
//         <View style={styles.input}>
//           <TextInput
//             placeholder="Enter complaint title"
//             value={title}
//             onChangeText={setTitle}
//             style={styles.textInput}
//           />
//         </View>
//       </View>
      
//       <View style={styles.inputContainer}>
//         <Text>Description:</Text>
//         <View style={styles.input}>
//           <TextInput
//             placeholder="Describe the issue"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             numberOfLines={4}
//             style={[styles.textInput, styles.textArea]}
//           />
//         </View>
//       </View>
      
//       <Button
//         title="Take Photo"
//         onPress={() => Alert.alert('Camera', 'Camera would open here')}
//       />
      
//       <View style={styles.spacer} />
      
//       <Button
//         title="Submit Complaint"
//         onPress={handleSubmit}
//         color="#2196F3"
//       />
//     </ScrollView>
//   );
// }

// function SchemesScreen() {
//   const schemes = [
//     { id: 1, name: 'PM-KISAN', description: 'Financial help for farmers' },
//     { id: 2, name: 'PM Awas Yojana', description: 'Housing for all' },
//     { id: 3, name: 'Ayushman Bharat', description: 'Health insurance' },
//     { id: 4, name: 'MGNREGA', description: 'Employment guarantee' },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.screenTitle}>Government Schemes</Text>
      
//       {schemes.map((scheme) => (
//         <TouchableOpacity
//           key={scheme.id}
//           style={styles.schemeCard}
//           onPress={() => Alert.alert(scheme.name, `Check eligibility for ${scheme.description}`)}
//         >
//           <Text style={styles.schemeName}>{scheme.name}</Text>
//           <Text style={styles.schemeDesc}>{scheme.description}</Text>
//           <Text style={styles.checkText}>Tap to check eligibility →</Text>
//         </TouchableOpacity>
//       ))}
      
//       <View style={styles.chatbotCard}>
//         <Text style={styles.chatbotTitle}>AI Eligibility Checker</Text>
//         <Text>Ask if you're eligible for any scheme</Text>
//         <Button
//           title="Open Chatbot"
//           onPress={() => Alert.alert('Chatbot', 'AI Chatbot would open here')}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// function LearningScreen() {
//   const videos = [
//     { id: 1, title: 'Farming Techniques', duration: '15 min' },
//     { id: 2, title: 'Digital Literacy', duration: '20 min' },
//     { id: 3, title: 'Health Awareness', duration: '10 min' },
//     { id: 4, title: 'Financial Planning', duration: '25 min' },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.screenTitle}>Learning Resources</Text>
      
//       {videos.map((video) => (
//         <View key={video.id} style={styles.videoCard}>
//           <Text style={styles.videoTitle}>{video.title}</Text>
//           <Text>Duration: {video.duration}</Text>
//           <View style={styles.videoActions}>
//             <Button
//               title="Play"
//               onPress={() => Alert.alert('Video Player', `Playing ${video.title}`)}
//             />
//             <Button
//               title="Download"
//               onPress={() => Alert.alert('Download', `Downloading ${video.title} for offline`)}
//             />
//           </View>
//         </View>
//       ))}
      
//       <Text style={styles.offlineNote}>✓ Works offline - Download videos first</Text>
//     </ScrollView>
//   );
// }

// function JobsScreen() {
//   const jobs = [
//     { id: 1, title: 'Agriculture Officer', company: 'Govt Dept', location: 'Rural' },
//     { id: 2, title: 'Teacher', company: 'School', location: 'Village' },
//     { id: 3, title: 'Health Worker', company: 'Clinic', location: 'Rural' },
//     { id: 4, title: 'Electrician', company: 'Power Dept', location: 'District' },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.screenTitle}>Job Portal</Text>
      
//       {jobs.map((job) => (
//         <View key={job.id} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>{job.title}</Text>
//           <Text>Company: {job.company}</Text>
//           <Text>Location: {job.location}</Text>
//           <Button
//             title="Apply Now"
//             onPress={() => Alert.alert('Apply', `Applying for ${job.title}`)}
//           />
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// // Main App Component
// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen 
//           name="Home" 
//           component={HomeScreen}
//           options={{ title: 'Rural e-Governance' }}
//         />
//         <Stack.Screen 
//           name="FileComplaint" 
//           component={FileComplaintScreen}
//           options={{ title: 'File Complaint' }}
//         />
//         <Stack.Screen 
//           name="Schemes" 
//           component={SchemesScreen}
//           options={{ title: 'Government Schemes' }}
//         />
//         <Stack.Screen 
//           name="Learning" 
//           component={LearningScreen}
//           options={{ title: 'Learning' }}
//         />
//         <Stack.Screen 
//           name="Jobs" 
//           component={JobsScreen}
//           options={{ title: 'Job Portal' }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 16,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20,
//     padding: 20,
//     backgroundColor: '#2196F3',
//     borderRadius: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.8)',
//     marginTop: 5,
//   },
//   card: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   roleButton: {
//     flex: 1,
//     marginHorizontal: 4,
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   screenTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 6,
//     marginTop: 6,
//     paddingHorizontal: 10,
//   },
//   textInput: {
//     padding: 10,
//     fontSize: 16,
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   spacer: {
//     height: 20,
//   },
//   schemeCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   schemeName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//   },
//   schemeDesc: {
//     color: '#666',
//     marginVertical: 6,
//   },
//   checkText: {
//     color: '#2196F3',
//     fontStyle: 'italic',
//   },
//   chatbotCard: {
//     backgroundColor: '#E3F2FD',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: '#BBDEFB',
//   },
//   chatbotTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1976D2',
//     marginBottom: 8,
//   },
//   videoCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   videoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   videoActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   offlineNote: {
//     marginTop: 20,
//     textAlign: 'center',
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   jobCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FFE0B2',
//   },
//   jobTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#F57C00',
//     marginBottom: 8,
//   },
// });

// // Import TextInput
// import { TextInput } from 'react-native';