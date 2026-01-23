// src/screens/admin/AllComplaints.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Searchbar,
  Chip,
  Menu,
  FAB,
  ActivityIndicator,
  SegmentedButtons,
  Dialog,
  Portal,
  DataTable,
  Divider,
  IconButton
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { executeSql } from '../../services/database';

const { width } = Dimensions.get('window');

const statusFilters = [
  { label: 'All', value: 'all', icon: 'view-list' },
  { label: 'Pending', value: 'pending', icon: 'clock' },
  { label: 'In Progress', value: 'in_progress', icon: 'progress-wrench' },
  { label: 'Resolved', value: 'resolved', icon: 'check-circle' },
  { label: 'Rejected', value: 'rejected', icon: 'close-circle' },
];

const priorityFilters = [
  { label: 'All', value: 'all', icon: 'flag' },
  { label: 'High', value: 'high', icon: 'flag', color: '#F44336' },
  { label: 'Medium', value: 'medium', icon: 'flag', color: '#FF9800' },
  { label: 'Low', value: 'low', icon: 'flag', color: '#4CAF50' },
];

const timeFilters = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

const mockComplaints = [
  {
    id: 1,
    title: 'Pothole on Main Road',
    description: 'Large pothole causing traffic issues',
    category: 'road_repair',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-20 10:30',
    citizenName: 'Rajesh Kumar',
    officerName: null,
    location: 'Village A, Main Road',
    syncStatus: 1
  },
  {
    id: 2,
    title: 'Garbage Accumulation',
    description: 'Garbage not collected for 5 days',
    category: 'garbage',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-19 14:20',
    citizenName: 'Priya Sharma',
    officerName: 'Amit Patel',
    location: 'Market Area',
    syncStatus: 1
  },
  {
    id: 3,
    title: 'Water Supply Issue',
    description: 'No water supply for 2 days',
    category: 'water',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-18 09:15',
    citizenName: 'Suresh Reddy',
    officerName: 'Meena Singh',
    location: 'Residential Area',
    syncStatus: 1
  },
  {
    id: 4,
    title: 'Street Light Not Working',
    description: 'Street light pole broken',
    category: 'street_light',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-01-20 18:45',
    citizenName: 'Ravi Verma',
    officerName: null,
    location: 'Park Street',
    syncStatus: 0
  },
  {
    id: 5,
    title: 'Drainage Blockage',
    description: 'Drainage blocked causing water logging',
    category: 'drainage',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-01-17 11:30',
    citizenName: 'Anita Gupta',
    officerName: 'Amit Patel',
    location: 'School Road',
    syncStatus: 1
  },
  {
    id: 6,
    title: 'Electricity Power Cut',
    description: 'Frequent power cuts in area',
    category: 'electricity',
    status: 'rejected',
    priority: 'high',
    createdAt: '2024-01-16 16:20',
    citizenName: 'Mohammed Khan',
    officerName: 'Meena Singh',
    location: 'Industrial Area',
    syncStatus: 1
  },
];

export default function AllComplaints() {
  const navigation = useNavigation();
  
  const [complaints, setComplaints] = useState(mockComplaints);
  const [filteredComplaints, setFilteredComplaints] = useState(mockComplaints);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchQuery, selectedStatus, selectedPriority, selectedTime, complaints]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const result = await executeSql(
        `SELECT c.*, 
                u.name as citizen_name,
                o.name as officer_name
         FROM complaints c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN users o ON c.assigned_to = o.id
         ORDER BY 
           CASE c.priority 
             WHEN 'high' THEN 1
             WHEN 'medium' THEN 2
             WHEN 'low' THEN 3
             ELSE 4
           END,
           c.created_at DESC`
      );
      
      if (result.rows.length > 0) {
        // Use mock data for now
        setComplaints(mockComplaints);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === selectedPriority);
    }

    // Filter by time
    if (selectedTime !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (selectedTime) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(complaint => {
          const complaintDate = new Date(complaint.createdAt);
          return complaintDate >= cutoffDate;
        });
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.citizenName.toLowerCase().includes(query) ||
        complaint.location.toLowerCase().includes(query)
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'road_repair': return 'road';
      case 'garbage': return 'delete';
      case 'water': return 'water';
      case 'electricity': return 'flash';
      case 'street_light': return 'lightbulb';
      case 'drainage': return 'pipe';
      default: return 'alert-circle';
    }
  };

  const handleExport = (format) => {
    Alert.alert(
      'Export Data',
      `Export complaints data as ${format.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            setShowExportMenu(false);
            Alert.alert('Success', `Data exported as ${format.toUpperCase()}`);
          }
        }
      ]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedComplaints.length === 0) {
      Alert.alert('No Selection', 'Please select complaints first');
      return;
    }

    switch (action) {
      case 'assign':
        navigation.navigate('AssignOfficer', { complaintIds: selectedComplaints });
        break;
      case 'delete':
        Alert.alert(
          'Delete Complaints',
          `Delete ${selectedComplaints.length} selected complaints?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                const updatedComplaints = complaints.filter(
                  c => !selectedComplaints.includes(c.id)
                );
                setComplaints(updatedComplaints);
                setSelectedComplaints([]);
                setShowBulkActions(false);
              }
            }
          ]
        );
        break;
      case 'status':
        navigation.navigate('BulkStatusUpdate', { complaintIds: selectedComplaints });
        break;
    }
  };

  const toggleComplaintSelection = (id) => {
    setSelectedComplaints(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const highPriority = complaints.filter(c => c.priority === 'high').length;

    return { total, pending, inProgress, resolved, highPriority };
  };

  const renderComplaintItem = ({ item }) => {
    const isSelected = selectedComplaints.includes(item.id);
    
    return (
      <Card 
        style={[
          styles.complaintCard,
          isSelected && styles.selectedCard
        ]}
        onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
        onLongPress={() => toggleComplaintSelection(item.id)}
      >
        <Card.Content>
          <View style={styles.complaintHeader}>
            <View style={styles.complaintInfo}>
              <View style={styles.titleRow}>
                <Icon 
                  name={getCategoryIcon(item.category)} 
                  size={20} 
                  color="#666"
                  style={styles.categoryIcon}
                />
                <Text style={styles.complaintTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.complaintId}>#{item.id}</Text>
            </View>
            
            {showBulkActions && (
              <IconButton
                icon={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                size={20}
                onPress={() => toggleComplaintSelection(item.id)}
              />
            )}
          </View>
          
          <Text style={styles.complaintDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.complaintMeta}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="account" size={14} color="#666" />
                <Text style={styles.metaText}>{item.citizenName}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Icon name="calendar" size={14} color="#666" />
                <Text style={styles.metaText}>{item.createdAt.split(' ')[0]}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.chipText}
                icon="circle"
              >
                {item.status.replace('_', ' ')}
              </Chip>
              
              <Chip
                style={[styles.priorityChip, { borderColor: getPriorityColor(item.priority) }]}
                textStyle={{ color: getPriorityColor(item.priority) }}
                icon="flag"
              >
                {item.priority}
              </Chip>
            </View>
            
            {item.officerName && (
              <View style={styles.officerInfo}>
                <Icon name="badge-account" size={14} color="#666" />
                <Text style={styles.officerText}>Assigned to: {item.officerName}</Text>
              </View>
            )}
            
            {item.syncStatus === 0 && (
              <View style={styles.offlineIndicator}>
                <Icon name="cloud-off-outline" size={14} color="#757575" />
                <Text style={styles.offlineText}>Pending sync</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTableRow = (item) => {
    const isSelected = selectedComplaints.includes(item.id);
    
    return (
      <DataTable.Row 
        key={item.id}
        onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
        style={isSelected && styles.selectedTableRow}
      >
        {showBulkActions && (
          <DataTable.Cell style={styles.tableCheckbox}>
            <IconButton
              icon={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
              size={16}
              onPress={() => toggleComplaintSelection(item.id)}
            />
          </DataTable.Cell>
        )}
        
        <DataTable.Cell>#{item.id}</DataTable.Cell>
        <DataTable.Cell>
          <Text numberOfLines={1} style={styles.tableTitle}>
            {item.title}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell>{item.citizenName}</DataTable.Cell>
        <DataTable.Cell>
          <Chip
            style={[styles.tableChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.tableChipText}
            compact
          >
            {item.status.charAt(0).toUpperCase()}
          </Chip>
        </DataTable.Cell>
        <DataTable.Cell>
          <Chip
            style={[styles.tableChip, { borderColor: getPriorityColor(item.priority) }]}
            textStyle={{ color: getPriorityColor(item.priority) }}
            compact
          >
            {item.priority.charAt(0).toUpperCase()}
          </Chip>
        </DataTable.Cell>
      </DataTable.Row>
    );
  };

  const stats = getStats();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Overview */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsHeader}>
            <Title style={styles.statsTitle}>Complaints Overview</Title>
            <IconButton
              icon={viewMode === 'list' ? 'table' : 'view-list'}
              size={20}
              onPress={() => setViewMode(viewMode === 'list' ? 'table' : 'list')}
            />
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.highPriority}</Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search and Filters */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search complaints..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="magnify"
          />
          
          <View style={styles.filterButtons}>
            <Button
              mode={showFilters ? "contained" : "outlined"}
              onPress={() => setShowFilters(!showFilters)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Filters
            </Button>
            
            <Menu
              visible={showExportMenu}
              onDismiss={() => setShowExportMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowExportMenu(true)}
                  style={styles.filterButton}
                  icon="export"
                >
                  Export
                </Button>
              }
            >
              <Menu.Item
                onPress={() => handleExport('csv')}
                title="Export as CSV"
                leadingIcon="file-delimited"
              />
              <Menu.Item
                onPress={() => handleExport('pdf')}
                title="Export as PDF"
                leadingIcon="file-pdf-box"
              />
              <Menu.Item
                onPress={() => handleExport('excel')}
                title="Export as Excel"
                leadingIcon="microsoft-excel"
              />
            </Menu>
            
            {showBulkActions ? (
              <Button
                mode="contained"
                onPress={() => {
                  setShowBulkActions(false);
                  setSelectedComplaints([]);
                }}
                style={styles.filterButton}
                icon="close"
              >
                Cancel
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setShowBulkActions(true)}
                style={styles.filterButton}
                icon="select-all"
              >
                Select
              </Button>
            )}
          </View>

          {/* Expanded Filters */}
          {showFilters && (
            <View style={styles.expandedFilters}>
              <Text style={styles.filterLabel}>Status:</Text>
              <SegmentedButtons
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                buttons={statusFilters}
                style={styles.segmentedButtons}
              />
              
              <Text style={styles.filterLabel}>Priority:</Text>
              <SegmentedButtons
                value={selectedPriority}
                onValueChange={setSelectedPriority}
                buttons={priorityFilters}
                style={styles.segmentedButtons}
              />
              
              <Text style={styles.filterLabel}>Time Period:</Text>
              <SegmentedButtons
                value={selectedTime}
                onValueChange={setSelectedTime}
                buttons={timeFilters}
                style={styles.segmentedButtons}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedComplaints.length > 0 && (
        <Card style={styles.bulkActionsCard}>
          <Card.Content style={styles.bulkActionsContent}>
            <Text style={styles.bulkSelectionText}>
              {selectedComplaints.length} selected
            </Text>
            
            <View style={styles.bulkActionButtons}>
              <Button
                mode="text"
                onPress={() => handleBulkAction('assign')}
                icon="account-arrow-right"
                compact
              >
                Assign
              </Button>
              
              <Button
                mode="text"
                onPress={() => handleBulkAction('status')}
                icon="update"
                compact
              >
                Status
              </Button>
              
              <Button
                mode="text"
                onPress={() => handleBulkAction('delete')}
                icon="delete"
                compact
                textColor="#F44336"
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Complaints List/Table */}
      {viewMode === 'list' ? (
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
              <Title style={styles.emptyTitle}>No Complaints Found</Title>
              <Text style={styles.emptyText}>
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'No complaints match your filters'
                  : 'No complaints available'
                }
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView horizontal>
          <DataTable style={styles.dataTable}>
            <DataTable.Header>
              {showBulkActions && (
                <DataTable.Title style={styles.tableCheckbox}>
                  <IconButton
                    icon={selectedComplaints.length === filteredComplaints.length ? 
                      "checkbox-marked" : "checkbox-blank-outline"}
                    size={16}
                    onPress={() => {
                      if (selectedComplaints.length === filteredComplaints.length) {
                        setSelectedComplaints([]);
                      } else {
                        setSelectedComplaints(filteredComplaints.map(c => c.id));
                      }
                    }}
                  />
                </DataTable.Title>
              )}
              
              <DataTable.Title>ID</DataTable.Title>
              <DataTable.Title>Title</DataTable.Title>
              <DataTable.Title>Citizen</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Priority</DataTable.Title>
            </DataTable.Header>

            {filteredComplaints.length > 0 ? (
              filteredComplaints.map(renderTableRow)
            ) : (
              <DataTable.Row>
                <DataTable.Cell colSpan={showBulkActions ? 6 : 5}>
                  <Text style={styles.emptyTableText}>No complaints found</Text>
                </DataTable.Cell>
              </DataTable.Row>
            )}
          </DataTable>
        </ScrollView>
      )}

      {/* FAB for New Actions */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateComplaint')}
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
  statsCard: {
    margin: 10,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 15,
    elevation: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  expandedFilters: {
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  segmentedButtons: {
    marginBottom: 15,
  },
  bulkActionsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#E3F2FD',
  },
  bulkActionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkSelectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
  },
  bulkActionButtons: {
    flexDirection: 'row',
  },
  listContent: {
    paddingBottom: 80,
  },
  complaintCard: {
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    marginRight: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  complaintId: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  complaintMeta: {
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  priorityChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  officerText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    padding: 2,
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
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#757575',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
  },
  dataTable: {
    margin: 10,
    backgroundColor: 'white',
    elevation: 2,
  },
  tableCheckbox: {
    width: 40,
  },
  selectedTableRow: {
    backgroundColor: '#E3F2FD',
  },
  tableTitle: {
    maxWidth: 150,
  },
  tableChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  tableChipText: {
    fontSize: 10,
  },
  emptyTableText: {
    textAlign: 'center',
    color: '#bdbdbd',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});