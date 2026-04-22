// src/screens/citizen/ComplaintDetail.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking,
  Share,
  Clipboard
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  ProgressBar,
  List,
  IconButton,
  Dialog,
  Portal
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { executeSql } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

export default function ComplaintDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const { complaint: initialComplaint } = route.params || {};
  const [complaint, setComplaint] = useState(initialComplaint);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [assignedOfficer, setAssignedOfficer] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (complaint?.id) {
      loadComplaintDetails();
      loadUpdates();
      loadOfficerInfo();
    }
  }, [complaint?.id]);

  const loadComplaintDetails = async () => {
    try {
      const result = await executeSql(
        `SELECT c.*, 
                (SELECT name FROM users WHERE id = c.assigned_to) as officer_name,
                (SELECT phone FROM users WHERE id = c.assigned_to) as officer_phone
         FROM complaints c
         WHERE c.id = ?`,
        [complaint.id]
      );
      
      if (result.rows.length > 0) {
        const updatedComplaint = result.rows._array[0];
        setComplaint(updatedComplaint);
        
        if (updatedComplaint.officer_name) {
          setAssignedOfficer({
            name: updatedComplaint.officer_name,
            phone: updatedComplaint.officer_phone
          });
        }
      }
    } catch (error) {
      console.error('Error loading complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpdates = async () => {
    try {
      // Simulate loading updates
      const mockUpdates = [
        {
          id: 1,
          type: 'status',
          message: 'Complaint has been assigned to Officer Sharma',
          timestamp: '2024-01-20 10:30 AM',
          icon: 'account-check'
        },
        {
          id: 2,
          type: 'action',
          message: 'Officer visited the site for inspection',
          timestamp: '2024-01-21 02:15 PM',
          icon: 'clipboard-check'
        },
        {
          id: 3,
          type: 'progress',
          message: 'Work has started on the issue',
          timestamp: '2024-01-22 09:45 AM',
          icon: 'progress-wrench'
        }
      ];
      setUpdates(mockUpdates);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const loadOfficerInfo = async () => {
    if (complaint.assigned_to) {
      try {
        const result = await executeSql(
          'SELECT name, phone, designation FROM users WHERE id = ?',
          [complaint.assigned_to]
        );
        
        if (result.rows.length > 0) {
          setAssignedOfficer(result.rows._array[0]);
        }
      } catch (error) {
        console.error('Error loading officer info:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'in_progress': return 'progress-wrench';
      case 'resolved': return 'check-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 0.25;
      case 'in_progress': return 0.5;
      case 'resolved': return 1.0;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  const handleShareComplaint = async () => {
    try {
      const message = `Complaint #${complaint.id}: ${complaint.title}\nStatus: ${complaint.status}\nCreated: ${new Date(complaint.created_at).toLocaleDateString()}`;
      
      await Share.share({
        message,
        title: 'Complaint Details'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactOfficer = () => {
    if (assignedOfficer?.phone) {
      Linking.openURL(`tel:${assignedOfficer.phone}`);
    } else {
      Alert.alert('No Contact', 'Officer contact information not available');
    }
  };

  const handleDeleteComplaint = async () => {
    try {
      await executeSql('DELETE FROM complaints WHERE id = ?', [complaint.id]);
      setShowDeleteDialog(false);
      Alert.alert('Success', 'Complaint deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      Alert.alert('Error', 'Failed to delete complaint');
    }
  };

  const handleAddUpdate = () => {
    Alert.alert(
      'Add Update',
      'This feature allows you to add additional information or photos to your complaint.',
      [{ text: 'OK' }]
    );
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading complaint details...</Text>
      </View>
    );
  }

  const location = parseLocation(complaint.location);
  const progress = getProgressPercentage(complaint.status);

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{complaint.title}</Title>
              <Text style={styles.complaintId}>Complaint ID: #{complaint.id}</Text>
            </View>
            
            <View style={styles.headerActions}>
              <IconButton
                icon="share-variant"
                iconColor="#666"
                size={20}
                onPress={() => setShowShareDialog(true)}
              />
              
              {complaint.user_id === user?.id && complaint.status === 'pending' && (
                <IconButton
                  icon="delete"
                  iconColor="#F44336"
                  size={20}
                  onPress={() => setShowDeleteDialog(true)}
                />
              )}
            </View>
          </View>
          
          <View style={styles.statusRow}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(complaint.status) }]}
              textStyle={styles.chipText}
              icon={getStatusIcon(complaint.status)}
            >
              {complaint.status.replace('_', ' ').toUpperCase()}
            </Chip>
            
            <Chip
              style={[styles.priorityChip, { borderColor: getPriorityColor(complaint.priority) }]}
              textStyle={{ color: getPriorityColor(complaint.priority) }}
              icon="flag"
            >
              {complaint.priority.toUpperCase()}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.description}>{complaint.description}</Text>
        </Card.Content>
      </Card>

      {/* Progress Tracking */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Progress Tracking</Title>
          
          <ProgressBar
            progress={progress}
            style={styles.progressBar}
            color={getStatusColor(complaint.status)}
          />
          
          <View style={styles.progressLabels}>
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                progress >= 0.25 && { backgroundColor: getStatusColor(complaint.status) }
              ]}>
                <Icon name="checkbox-marked-circle" size={16} color="white" />
              </View>
              <Text style={styles.progressText}>Filed</Text>
            </View>
            
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                progress >= 0.5 && { backgroundColor: getStatusColor(complaint.status) }
              ]}>
                <Icon name="clipboard-check" size={16} color="white" />
              </View>
              <Text style={styles.progressText}>In Progress</Text>
            </View>
            
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                progress >= 1 && { backgroundColor: getStatusColor(complaint.status) }
              ]}>
                <Icon name="check-circle" size={16} color="white" />
              </View>
              <Text style={styles.progressText}>Resolved</Text>
            </View>
          </View>
          
          <Text style={styles.progressStatus}>
            Current Status: {complaint.status.replace('_', ' ')}
          </Text>
        </Card.Content>
      </Card>

      {/* Complaint Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Complaint Details</Title>
          
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Icon name="tag-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{complaint.category}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="calendar" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Filed On</Text>
                <Text style={styles.detailValue}>{formatDate(complaint.created_at)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="update" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {complaint.updated_at ? formatDate(complaint.updated_at) : 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="sync" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Sync Status</Text>
                <Text style={styles.detailValue}>
                  {complaint.sync_status === 1 ? 'Synced' : 'Pending Sync'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Photo Evidence */}
      {complaint.photo_uri && (
        <Card style={styles.photoCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="camera" size={20} color="#2196F3" />
              <Text style={{ marginLeft: 10 }}>Photo Evidence</Text>
            </Title>
            
            <View style={styles.photoContainer}>
              {!imageLoaded && (
                <ActivityIndicator size="large" color="#2196F3" />
              )}
              <Image
                source={{ uri: complaint.photo_uri }}
                style={styles.photo}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
              
              <View style={styles.photoOverlay}>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('View Photo', 'Would open full screen photo')}
                  icon="magnify"
                  compact
                >
                  View Full Size
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Location Map */}
      {location && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="map-marker" size={20} color="#4CAF50" />
              <Text style={{ marginLeft: 10 }}>Location</Text>
            </Title>
            
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
                mode="outlined"
                onPress={() => {
                  const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
                  Linking.openURL(url);
                }}
                style={styles.mapButton}
                icon="google-maps"
              >
                Open in Google Maps
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Assigned Officer */}
      {assignedOfficer && (
        <Card style={styles.officerCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="badge-account" size={20} color="#FF9800" />
              <Text style={{ marginLeft: 10 }}>Assigned Officer</Text>
            </Title>
            
            <View style={styles.officerInfo}>
              <View style={styles.officerAvatar}>
                <Icon name="account" size={30} color="#666" />
              </View>
              
              <View style={styles.officerDetails}>
                <Text style={styles.officerName}>{assignedOfficer.name}</Text>
                {assignedOfficer.designation && (
                  <Text style={styles.officerDesignation}>
                    {assignedOfficer.designation}
                  </Text>
                )}
                {assignedOfficer.phone && (
                  <Text style={styles.officerPhone}>
                    <Icon name="phone" size={14} color="#666" /> {assignedOfficer.phone}
                  </Text>
                )}
              </View>
              
              <Button
                mode="contained"
                onPress={handleContactOfficer}
                style={styles.contactButton}
                icon="phone"
                compact
              >
                Contact
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Updates & Timeline */}
      <Card style={styles.updatesCard}>
        <Card.Content>
          <View style={styles.updatesHeader}>
            <Title style={styles.sectionTitle}>
              <Icon name="update" size={20} color="#9C27B0" />
              <Text style={{ marginLeft: 10 }}>Updates & Timeline</Text>
            </Title>
            
            <Button
              mode="text"
              onPress={handleAddUpdate}
              icon="plus"
              compact
            >
              Add Update
            </Button>
          </View>
          
          {updates.length > 0 ? (
            <View style={styles.timeline}>
              {updates.map((update, index) => (
                <View key={update.id} style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Icon name={update.icon} size={20} color="#9C27B0" />
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <Text style={styles.updateMessage}>{update.message}</Text>
                    <Text style={styles.updateTime}>{update.timestamp}</Text>
                  </View>
                  
                  {index < updates.length - 1 && (
                    <View style={styles.timelineConnector} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noUpdates}>
              <Icon name="update" size={40} color="#bdbdbd" />
              <Text style={styles.noUpdatesText}>No updates yet</Text>
              <Text style={styles.noUpdatesHint}>
                Updates will appear here as your complaint progresses
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('TrackComplaint', { complaintId: complaint.id })}
          style={styles.actionButton}
          icon="map-marker-path"
        >
          Track Complaint
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('FileComplaint', { editMode: true, complaint })}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Complaint
        </Button>
      </View>

      {/* Share Dialog */}
      <Portal>
        <Dialog
          visible={showShareDialog}
          onDismiss={() => setShowShareDialog(false)}
        >
          <Dialog.Title>Share Complaint</Dialog.Title>
          <Dialog.Content>
            <Text>Share complaint details via:</Text>
            
            <View style={styles.shareOptions}>
              <Button
                mode="outlined"
                onPress={handleShareComplaint}
                style={styles.shareOption}
                icon="share-variant"
              >
                Share Link
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {
                  const text = `Complaint ID: #${complaint.id}\nStatus: ${complaint.status}\nCreated: ${formatDate(complaint.created_at)}`;
                  Clipboard.setString(text);
                  Alert.alert('Copied', 'Complaint details copied to clipboard');
                  setShowShareDialog(false);
                }}
                style={styles.shareOption}
                icon="content-copy"
              >
                Copy Details
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowShareDialog(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>Delete Complaint</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </Text>
            <Text style={styles.deleteWarning}>
              Complaint #{complaint.id}: {complaint.title}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleDeleteComplaint}
              mode="contained"
              textColor="white"
              style={{ backgroundColor: '#F44336' }}
            >
              Delete
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
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  complaintId: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusChip: {
    marginRight: 10,
  },
  priorityChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  progressCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressStatus: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  photoCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  photoContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
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
  mapButton: {
    marginTop: 10,
  },
  officerCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  officerDetails: {
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  officerDesignation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  officerPhone: {
    fontSize: 14,
    color: '#2196F3',
  },
  contactButton: {
    marginLeft: 10,
  },
  updatesCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  updatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  updateMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  updateTime: {
    fontSize: 12,
    color: '#999',
  },
  timelineConnector: {
    position: 'absolute',
    left: 29,
    top: 40,
    bottom: -20,
    width: 2,
    backgroundColor: '#E1BEE7',
  },
  noUpdates: {
    alignItems: 'center',
    padding: 30,
  },
  noUpdatesText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 15,
    marginBottom: 8,
  },
  noUpdatesHint: {
    textAlign: 'center',
    color: '#bdbdbd',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  shareOption: {
    flex: 1,
    marginHorizontal: 5,
  },
  deleteWarning: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#F44336',
  },
});