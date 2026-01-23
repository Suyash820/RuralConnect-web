// src/screens/officer/Profile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Avatar,
  Divider,
  List,
  Switch,
  TextInput,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { executeSql } from '../../services/database';

export default function OfficerProfile({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    address: '',
    badgeNumber: '',
  });
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolved: 0,
    pending: 0,
    avgResolutionTime: 0,
  });
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const result = await executeSql(
        'SELECT * FROM users WHERE id = ?',
        [user?.id]
      );
      
      if (result.rows.length > 0) {
        const userData = result.rows._array[0];
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || 'Rural Development',
          designation: userData.designation || 'Field Officer',
          address: userData.address || '',
          badgeNumber: userData.badge_number || `OFF${user?.id.toString().padStart(4, '0')}`,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsResult = await executeSql(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM complaints
        WHERE assigned_to = ?`,
        [user?.id]
      );
      
      const resolutionResult = await executeSql(
        `SELECT AVG(julianday('now') - julianday(created_at)) as avg_days
         FROM complaints
         WHERE assigned_to = ? AND status = 'resolved'`,
        [user?.id]
      );
      
      if (statsResult.rows.length > 0) {
        const statsData = statsResult.rows._array[0];
        const avgDays = resolutionResult.rows._array[0]?.avg_days || 0;
        
        setStats({
          totalComplaints: statsData.total,
          resolved: statsData.resolved,
          pending: statsData.pending,
          avgResolutionTime: Math.round(avgDays),
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Change Password',
      icon: 'lock-reset',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      title: 'Notifications Settings',
      icon: 'bell-cog',
      onPress: () => console.log('Notifications Settings'),
    },
    {
      title: 'Privacy Settings',
      icon: 'shield-lock',
      onPress: () => console.log('Privacy Settings'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => console.log('Help & Support'),
    },
    {
      title: 'About App',
      icon: 'information',
      onPress: () => console.log('About App'),
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'O';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileHeader}>
        <Card.Content>
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Avatar.Text 
                  size={80} 
                  label={getInitials(profileData.name)} 
                  style={styles.avatar}
                />
              )}
              <View style={styles.editPhotoButton}>
                <Icon name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileDetails}>
              {editing ? (
                <TextInput
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({...profileData, name: text})}
                  style={styles.editInput}
                  mode="outlined"
                  dense
                />
              ) : (
                <Title style={styles.profileName}>{profileData.name}</Title>
              )}
              
              <Text style={styles.profileRole}>{profileData.designation}</Text>
              <Text style={styles.profileDept}>{profileData.department}</Text>
              
              <Chip style={styles.badgeChip} icon="badge-account">
                {profileData.badgeNumber}
              </Chip>
            </View>
          </View>
          
          <View style={styles.profileActions}>
            {editing ? (
              <>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEditing(false);
                    loadProfileData();
                  }}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setEditing(true)}
                style={styles.actionButton}
                icon="pencil"
              >
                Edit Profile
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Performance Statistics</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="clipboard-list" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
              <Text style={styles.statLabel}>Total Assigned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="clock" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="timer" size={24} color="#9C27B0" />
              <Text style={styles.statNumber}>
                {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}d` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Avg. Resolution</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          
          <List.Item
            title="Phone"
            description={profileData.phone || 'Not provided'}
            left={props => <List.Icon {...props} icon="phone" />}
            right={props => editing ? (
              <TextInput
                value={profileData.phone}
                onChangeText={(text) => setProfileData({...profileData, phone: text})}
                style={styles.fieldEdit}
                mode="outlined"
                dense
                keyboardType="phone-pad"
              />
            ) : null}
          />
          
          <Divider />
          
          <List.Item
            title="Email"
            description={profileData.email || 'Not provided'}
            left={props => <List.Icon {...props} icon="email" />}
            right={props => editing ? (
              <TextInput
                value={profileData.email}
                onChangeText={(text) => setProfileData({...profileData, email: text})}
                style={styles.fieldEdit}
                mode="outlined"
                dense
                keyboardType="email-address"
              />
            ) : null}
          />
          
          <Divider />
          
          <List.Item
            title="Address"
            description={profileData.address || 'Not provided'}
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => editing ? (
              <TextInput
                value={profileData.address}
                onChangeText={(text) => setProfileData({...profileData, address: text})}
                style={styles.fieldEdit}
                mode="outlined"
                dense
                multiline
              />
            ) : null}
          />
          
          <Divider />
          
          <List.Item
            title="Department"
            description={profileData.department}
            left={props => <List.Icon {...props} icon="office-building" />}
            right={props => editing ? (
              <TextInput
                value={profileData.department}
                onChangeText={(text) => setProfileData({...profileData, department: text})}
                style={styles.fieldEdit}
                mode="outlined"
                dense
              />
            ) : null}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Settings</Title>
          
          <List.Item
            title="Notifications"
            description="Receive complaint updates and alerts"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#2196F3"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark Mode"
            description="Use dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color="#2196F3"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Auto Sync"
            description="Automatically sync data when online"
            left={props => <List.Icon {...props} icon="cloud-sync" />}
            right={() => (
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                color="#2196F3"
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.title}
                left={props => <List.Icon {...props} icon={item.icon} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={item.onPress}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        style={styles.logoutButton}
        textColor="#F44336"
      >
        Logout
      </Button>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Rural e-Governance v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2024 Government Rural Department</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    margin: 10,
    elevation: 4,
    backgroundColor: '#2196F3',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatar: {
    backgroundColor: 'white',
    color: '#2196F3',
    borderWidth: 3,
    borderColor: 'white',
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  profileDept: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  badgeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editInput: {
    backgroundColor: 'white',
    fontSize: 18,
    marginBottom: 8,
  },
  fieldEdit: {
    width: 150,
    fontSize: 14,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    marginHorizontal: 8,
  },
  statsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  settingsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 12,
  },
  logoutButton: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderColor: '#F44336',
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});