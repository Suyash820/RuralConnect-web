// src/screens/citizen/MyComplaints.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Searchbar,
  Chip,
  FAB,
  ActivityIndicator
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { executeSql } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

export default function MyComplaints({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchQuery, selectedFilter, complaints]);

  const loadComplaints = async () => {
    try {
      const result = await executeSql(
        'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
        [user?.id || 1]
      );
      setComplaints(result.rows._array);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.category.toLowerCase().includes(query)
      );
    }

    setFilteredComplaints(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
    setRefreshing(false);
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
      case 'in_progress': return 'progress-clock';
      case 'resolved': return 'check-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderComplaintItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.complaintTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.chipText}
              icon={getStatusIcon(item.status)}
            >
              {item.status.replace('_', ' ')}
            </Chip>
          </View>
          <Text style={styles.complaintId}>#{item.id}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.categoryContainer}>
            <Icon name="tag-outline" size={16} color="#757575" />
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {item.sync_status === 0 && (
          <View style={styles.offlineIndicator}>
            <Icon name="cloud-off-outline" size={14} color="#757575" />
            <Text style={styles.offlineText}>Pending sync</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search complaints"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <Chip
              selected={selectedFilter === item.key}
              onPress={() => setSelectedFilter(item.key)}
              style={styles.filterChip}
              mode="outlined"
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredComplaints}
        renderItem={renderComplaintItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={60} color="#bdbdbd" />
            <Text style={styles.emptyText}>No complaints found</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('FileComplaint')}
              style={styles.emptyButton}
            >
              File Your First Complaint
            </Button>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('FileComplaint')}
        label="New Complaint"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 10,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  complaintId: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    marginLeft: 4,
    fontSize: 12,
    color: '#757575',
  },
  date: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  offlineText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#757575',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#bdbdbd',
    marginVertical: 20,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});