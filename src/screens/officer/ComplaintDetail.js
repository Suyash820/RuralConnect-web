// src/screens/officer/ComplaintDetail.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking,
  Share
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  TextInput,
  Menu,
  Portal,
  Dialog
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { executeSql } from '../../services/database';

const statusOptions = [
  { label: 'Pending', value: 'pending', color: '#FF9800', icon: 'clock' },
  { label: 'In Progress', value: 'in_progress', color: '#2196F3', icon: 'progress-wrench' },
  { label: 'Resolved', value: 'resolved', color: '#4CAF50', icon: 'check-circle' },
  { label: 'Rejected', value: 'rejected', color: '#F44336', icon: 'close-circle' },
];

const priorityOptions = [
  { label: 'High', value: 'high', color: '#F44336' },
  { label: 'Medium', value: 'medium', color: '#FF9800' },
  { label: 'Low', value: 'low', color: '#4CAF50' },
];

export default function ComplaintDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { complaint: initialComplaint } = route.params || {};
  
  const [complaint, setComplaint] = useState(initialComplaint);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    if (complaint?.id) {
      loadComplaintDetails();
    }
  }, [complaint?.id]);

  const loadComplaintDetails = async () => {
    try {
      const result = await executeSql(
        `SELECT c.*, u.name as user_name, u.phone as user_phone 
         FROM complaints c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [complaint.id]
      );
      
      if (result.rows.length > 0) {
        setComplaint(result.rows._array[0]);
      }
    } catch (error) {
      console.error('Error loading complaint:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await executeSql(
        'UPDATE complaints SET status = ? WHERE id = ?',
        [newStatus, complaint.id]
      );
      
      setComplaint(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePriority = async (newPriority) => {
    setUpdating(true);
    try {
      await executeSql(
        'UPDATE complaints SET priority = ? WHERE id = ?',
        [newPriority, complaint.id]
      );
      
      setComplaint(prev => ({ ...prev, priority: newPriority }));
      Alert.alert('Success', `Priority updated to ${newPriority}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update priority');
    } finally {
      setUpdating(false);
    }
  };

  const addActionNotes = async () => {
    if (!actionNotes.trim()) {
      Alert.alert('Error', 'Please enter action notes');
      return;
    }

    setUpdating(true);
    try {
      // In real app, you would save notes to database
      Alert.alert('Success', 'Action notes added');
      setActionNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getPriorityInfo = (priority) => {
    return priorityOptions.find(opt => opt.value === priority) || priorityOptions[1];
  };

  const callCitizen = () => {
    if (complaint.user_phone) {
      Linking.openURL(`tel:${complaint.user_phone}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const shareComplaint = async () => {
    try {
      await Share.share({
        message: `Complaint #${complaint.id}: ${complaint.title}\nStatus: ${complaint.status}\nPriority: ${complaint.priority}`,
        title: 'Complaint Details'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const parseLocation = (locationString) => {
    if (!locationString) return null;
    const [lat, lng] = locationString.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  if (!complaint) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading complaint details...</Text>
      </View>
    );
  }

  const location = parseLocation(complaint.location);
  const statusInfo = getStatusInfo(complaint.status);
  const priorityInfo = getPriorityInfo(complaint.priority);

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{complaint.title}</Title>
              <Text style={styles.complaintId}>#{complaint.id}</Text>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusInfo.color }]}
              textStyle={styles.chipText}
              icon={statusInfo.icon}
            >
              {statusInfo.label}
            </Chip>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.metaText}>
                {new Date(complaint.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="account" size={16} color="#666" />
              <Text style={styles.metaText}>{complaint.user_name || 'Citizen'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowStatusMenu(true)}
              style={styles.actionButton}
              icon="update"
              loading={updating}
            >
              Change Status
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => setShowPriorityMenu(true)}
              style={styles.actionButton}
              icon="flag"
              loading={updating}
            >
              Change Priority
            </Button>
            
            <Button
              mode="contained"
              onPress={() => setShowNotesDialog(true)}
              style={styles.actionButton}
              icon="note-plus"
            >
              Add Notes
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Complaint Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Details</Title>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{complaint.description}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Chip mode="outlined" style={styles.categoryChip}>
              {complaint.category}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority:</Text>
            <Chip
              style={[styles.priorityChip, { backgroundColor: priorityInfo.color }]}
              textStyle={styles.chipText}
            >
              {priorityInfo.label}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(complaint.created_at).toLocaleString()}
            </Text>
          </View>
          
          {complaint.photo_uri && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Photo:</Text>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Photo', 'View photo')}
                  icon="image"
                >
                  View Photo
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Location Map */}
      {location && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Location</Title>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={location}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={location} />
              </MapView>
              <Button
                mode="text"
                onPress={() => {
                  const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
                  Linking.openURL(url);
                }}
                icon="map-marker"
              >
                Open in Maps
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Citizen Contact */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Citizen Contact</Title>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="account" size={20} color="#666" />
              <Text style={styles.contactText}>{complaint.user_name || 'Not specified'}</Text>
            </View>
            {complaint.user_phone && (
              <View style={styles.contactItem}>
                <Icon name="phone" size={20} color="#666" />
                <Text style={styles.contactText}>{complaint.user_phone}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.contactActions}>
            <Button
              mode="outlined"
              onPress={callCitizen}
              style={styles.contactButton}
              icon="phone"
            >
              Call Citizen
            </Button>
            <Button
              mode="outlined"
              onPress={shareComplaint}
              style={styles.contactButton}
              icon="share"
            >
              Share
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Status Menu */}
      <Portal>
        <Menu
          visible={showStatusMenu}
          onDismiss={() => setShowStatusMenu(false)}
          anchor={{ x: 0, y: 0 }}
        >
          {statusOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                updateStatus(option.value);
                setShowStatusMenu(false);
              }}
              title={option.label}
              leadingIcon={option.icon}
            />
          ))}
        </Menu>
      </Portal>

      {/* Priority Menu */}
      <Portal>
        <Menu
          visible={showPriorityMenu}
          onDismiss={() => setShowPriorityMenu(false)}
          anchor={{ x: 0, y: 0 }}
        >
          {priorityOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                updatePriority(option.value);
                setShowPriorityMenu(false);
              }}
              title={option.label}
            />
          ))}
        </Menu>
      </Portal>

      {/* Notes Dialog */}
      <Portal>
        <Dialog
          visible={showNotesDialog}
          onDismiss={() => setShowNotesDialog(false)}
        >
          <Dialog.Title>Add Action Notes</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Notes"
              value={actionNotes}
              onChangeText={setActionNotes}
              multiline
              numberOfLines={4}
              mode="outlined"
            />
            <Text style={styles.notesHint}>
              Add notes about actions taken or observations
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNotesDialog(false)}>Cancel</Button>
            <Button
              onPress={() => {
                addActionNotes();
                setShowNotesDialog(false);
              }}
              loading={updating}
            >
              Save Notes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  complaintId: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginVertical: 4,
  },
  metaText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  actionsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  priorityChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 8,
  },
  mapCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    height: 200,
    width: '100%',
  },
  contactCard: {
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  notesHint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
    fontStyle: 'italic',
  },
});