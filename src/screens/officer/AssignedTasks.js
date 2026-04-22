// src/screens/officer/AssignedTasks.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Searchbar,
  FAB,
  ActivityIndicator,
  Menu,
  Divider
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { executeSql } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

export default function AssignedTasks() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, selectedFilter, tasks]);

  const loadTasks = async () => {
    try {
      const result = await executeSql(
        `SELECT c.*, u.name as citizen_name 
         FROM complaints c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.assigned_to = ?
         ORDER BY 
           CASE c.priority 
             WHEN 'high' THEN 1
             WHEN 'medium' THEN 2
             WHEN 'low' THEN 3
             ELSE 4
           END,
           c.created_at DESC`,
        [user?.id]
      );
      
      setTasks(result.rows._array);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        (task.citizen_name && task.citizen_name.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getDaysAgo = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
  };

  const renderTaskItem = ({ item }) => (
    <Card
      style={styles.taskCard}
      onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
    >
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Chip
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) }]}
              textStyle={styles.chipText}
              icon="flag"
            >
              {item.priority}
            </Chip>
          </View>
          <Text style={styles.taskId}>#{item.id}</Text>
        </View>
        
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Icon name="account" size={14} color="#666" />
            <Text style={styles.metaText}>{item.citizen_name || 'Citizen'}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Icon name="tag" size={14} color="#666" />
            <Text style={styles.metaText}>{item.category}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="#666" />
            <Text style={styles.metaText}>{getDaysAgo(item.created_at)}</Text>
          </View>
        </View>
        
        <View style={styles.taskFooter}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}
            icon="circle"
          >
            {item.status.replace('_', ' ')}
          </Chip>
          
          <Button
            mode="text"
            onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
            icon="arrow-right"
            compact
          >
            View
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const filters = [
    { key: 'all', label: 'All Tasks', icon: 'view-list' },
    { key: 'pending', label: 'Pending', icon: 'clock' },
    { key: 'in_progress', label: 'In Progress', icon: 'progress-wrench' },
    { key: 'resolved', label: 'Resolved', icon: 'check-circle' },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading assigned tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Assigned Tasks</Title>
        <Text style={styles.headerSubtitle}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
        </Text>
      </View>
      
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
        />
        
        <Menu
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowFilterMenu(true)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Filter
            </Button>
          }
        >
          {filters.map((filter) => (
            <Menu.Item
              key={filter.key}
              onPress={() => {
                setSelectedFilter(filter.key);
                setShowFilterMenu(false);
              }}
              title={filter.label}
              leadingIcon={filter.icon}
            />
          ))}
        </Menu>
      </View>
      
      {/* Active Filters */}
      {selectedFilter !== 'all' && (
        <View style={styles.activeFilter}>
          <Chip
            onClose={() => setSelectedFilter('all')}
            icon={filters.find(f => f.key === selectedFilter)?.icon}
          >
            {filters.find(f => f.key === selectedFilter)?.label}
          </Chip>
        </View>
      )}
      
      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-check-outline" size={80} color="#bdbdbd" />
            <Title style={styles.emptyTitle}>No Tasks Assigned</Title>
            <Text style={styles.emptyText}>
              {selectedFilter !== 'all' 
                ? 'No tasks match the selected filter'
                : 'You have no tasks assigned to you'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('OfficerComplaints')}
              style={styles.emptyButton}
              icon="view-list"
            >
              View All Complaints
            </Button>
          </View>
        }
      />
      
      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Task Summary</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                {tasks.filter(t => t.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>
                {tasks.filter(t => t.status === 'in_progress').length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {tasks.filter(t => t.status === 'resolved').length}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={loadTasks}
        label="Refresh"
      />
    </View>
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
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 10,
    elevation: 0,
  },
  filterButton: {
    alignSelf: 'center',
  },
  activeFilter: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
  },
  listContent: {
    paddingBottom: 100,
  },
  taskCard: {
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    alignSelf: 'flex-start',
  },
  taskId: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  taskDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginVertical: 2,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#757575',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyButton: {
    marginTop: 20,
  },
  statsCard: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});