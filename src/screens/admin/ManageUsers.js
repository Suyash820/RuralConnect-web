// src/screens/admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  TextInput as RNTextInput
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Searchbar,
  Chip,
  Avatar,
  Dialog,
  Portal,
  Menu,
  TextInput,
  ActivityIndicator,
  List,
  Divider,
  IconButton,
  FAB
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { executeSql } from '../../services/database';

const userRoles = [
  { label: 'Citizen', value: 'citizen', color: '#4CAF50', icon: 'account' },
  { label: 'Officer', value: 'officer', color: '#2196F3', icon: 'badge-account' },
  { label: 'Admin', value: 'admin', color: '#FF9800', icon: 'shield-account' },
  { label: 'Blocked', value: 'blocked', color: '#F44336', icon: 'block-helper' },
];

const initialUsers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    role: 'citizen',
    createdAt: '2024-01-15',
    complaints: 5,
    status: 'active',
    location: 'Village A'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543211',
    role: 'officer',
    createdAt: '2024-01-10',
    complaints: 12,
    status: 'active',
    designation: 'Field Officer',
    department: 'Rural Development'
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '9876543212',
    role: 'admin',
    createdAt: '2024-01-05',
    complaints: 0,
    status: 'active',
    accessLevel: 'Super Admin'
  },
  {
    id: 4,
    name: 'Suresh Reddy',
    email: 'suresh@example.com',
    phone: '9876543213',
    role: 'citizen',
    createdAt: '2024-01-20',
    complaints: 2,
    status: 'inactive',
    location: 'Village B'
  },
  {
    id: 5,
    name: 'Meena Singh',
    email: 'meena@example.com',
    phone: '9876543214',
    role: 'officer',
    createdAt: '2024-01-12',
    complaints: 8,
    status: 'active',
    designation: 'Agriculture Officer',
    department: 'Agriculture'
  },
];

export default function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    password: '',
    confirmPassword: ''
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In real app, fetch from API
      const result = await executeSql(
        `SELECT u.*, 
                COUNT(c.id) as complaint_count
         FROM users u
         LEFT JOIN complaints c ON u.id = c.user_id
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      
      if (result.rows.length > 0) {
        // Use mock data for now
        setUsers(initialUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Add user to database
    const userToAdd = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: new Date().toISOString().split('T')[0],
      complaints: 0,
      status: 'active'
    };

    setUsers([userToAdd, ...users]);
    setShowAddUserDialog(false);
    resetNewUserForm();
    
    Alert.alert('Success', 'User added successfully');
  };

  const handleEditUser = () => {
    if (!editUser.name || !editUser.email || !editUser.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Update user in database
    const updatedUsers = users.map(user =>
      user.id === selectedUser.id ? { ...user, ...editUser } : user
    );

    setUsers(updatedUsers);
    setShowEditUserDialog(false);
    setSelectedUser(null);
    
    Alert.alert('Success', 'User updated successfully');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    // Delete user from database
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setShowDeleteDialog(false);
    setSelectedUser(null);
    
    Alert.alert('Success', 'User deleted successfully');
  };

  const handleBlockUser = (user) => {
    Alert.alert(
      user.status === 'active' ? 'Block User' : 'Unblock User',
      `Are you sure you want to ${user.status === 'active' ? 'block' : 'unblock'} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            const updatedUsers = users.map(u =>
              u.id === user.id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
            );
            setUsers(updatedUsers);
          }
        }
      ]
    );
  };

  const resetNewUserForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'citizen',
      password: '',
      confirmPassword: ''
    });
  };

  const getRoleInfo = (role) => {
    return userRoles.find(r => r.value === role) || userRoles[0];
  };

  const getUserStats = () => {
    const total = users.length;
    const citizens = users.filter(u => u.role === 'citizen').length;
    const officers = users.filter(u => u.role === 'officer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const active = users.filter(u => u.status === 'active').length;

    return { total, citizens, officers, admins, active };
  };

  const renderUserItem = ({ item }) => {
    const roleInfo = getRoleInfo(item.role);
    
    return (
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={40} 
                label={item.name.charAt(0)} 
                style={{ backgroundColor: roleInfo.color }}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userPhone}>{item.phone}</Text>
              </View>
            </View>
            
            <View style={styles.userActions}>
              <Chip
                style={[styles.roleChip, { backgroundColor: roleInfo.color }]}
                textStyle={styles.roleChipText}
                icon={roleInfo.icon}
              >
                {roleInfo.label}
              </Chip>
              
              <Menu
                visible={selectedUser?.id === item.id && showRoleMenu}
                onDismiss={() => {
                  setShowRoleMenu(false);
                  setSelectedUser(null);
                }}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => {
                      setSelectedUser(item);
                      setShowRoleMenu(true);
                    }}
                  />
                }
              >
                <Menu.Item
                  title="Edit User"
                  leadingIcon="pencil"
                  onPress={() => {
                    setShowRoleMenu(false);
                    setEditUser({
                      name: item.name,
                      email: item.email,
                      phone: item.phone,
                      role: item.role,
                      status: item.status
                    });
                    setSelectedUser(item);
                    setShowEditUserDialog(true);
                  }}
                />
                <Menu.Item
                  title={item.status === 'active' ? 'Block User' : 'Unblock User'}
                  leadingIcon={item.status === 'active' ? 'block-helper' : 'check'}
                  onPress={() => {
                    setShowRoleMenu(false);
                    handleBlockUser(item);
                  }}
                />
                <Menu.Item
                  title="Delete User"
                  leadingIcon="delete"
                  onPress={() => {
                    setShowRoleMenu(false);
                    setSelectedUser(item);
                    setShowDeleteDialog(true);
                  }}
                />
              </Menu>
            </View>
          </View>
          
          <Divider style={styles.userDivider} />
          
          <View style={styles.userMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={14} color="#666" />
              <Text style={styles.metaText}>Joined: {item.createdAt}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="alert-circle" size={14} color="#666" />
              <Text style={styles.metaText}>Complaints: {item.complaints}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="circle" size={14} color={item.status === 'active' ? '#4CAF50' : '#F44336'} />
              <Text style={[
                styles.metaText,
                { color: item.status === 'active' ? '#4CAF50' : '#F44336' }
              ]}>
                {item.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          {item.designation && (
            <View style={styles.userExtra}>
              <Chip mode="outlined" style={styles.designationChip}>
                {item.designation}
              </Chip>
              {item.department && (
                <Text style={styles.departmentText}>{item.department}</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const stats = getUserStats();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Overview */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>User Statistics</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.citizens}</Text>
              <Text style={styles.statLabel}>Citizens</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.officers}</Text>
              <Text style={styles.statLabel}>Officers</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.admins}</Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search users by name, email, or phone"
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
          <Menu.Item
            onPress={() => {
              setSelectedRole('all');
              setShowFilterMenu(false);
            }}
            title="All Users"
            leadingIcon="account-group"
          />
          {userRoles.map((role) => (
            <Menu.Item
              key={role.value}
              onPress={() => {
                setSelectedRole(role.value);
                setShowFilterMenu(false);
              }}
              title={role.label}
              leadingIcon={role.icon}
            />
          ))}
        </Menu>
      </View>

      {/* Active Filters */}
      {selectedRole !== 'all' && (
        <View style={styles.activeFilters}>
          <Chip
            onClose={() => setSelectedRole('all')}
            icon={getRoleInfo(selectedRole).icon}
            style={styles.activeFilterChip}
          >
            {getRoleInfo(selectedRole).label}
          </Chip>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-search" size={60} color="#bdbdbd" />
            <Title style={styles.emptyTitle}>No Users Found</Title>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No users match your search'
                : selectedRole !== 'all'
                  ? `No ${getRoleInfo(selectedRole).label.toLowerCase()}s found`
                  : 'No users available'
              }
            </Text>
          </View>
        }
      />

      {/* Add User FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddUserDialog(true)}
        label="Add User"
      />

      {/* Add User Dialog */}
      <Portal>
        <Dialog
          visible={showAddUserDialog}
          onDismiss={() => {
            setShowAddUserDialog(false);
            resetNewUserForm();
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Add New User</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              <TextInput
                label="Full Name *"
                value={newUser.name}
                onChangeText={(text) => setNewUser({...newUser, name: text})}
                style={styles.dialogInput}
                mode="outlined"
              />
              
              <TextInput
                label="Email Address *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({...newUser, email: text})}
                style={styles.dialogInput}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label="Phone Number *"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({...newUser, phone: text})}
                style={styles.dialogInput}
                mode="outlined"
                keyboardType="phone-pad"
              />
              
              <Text style={styles.dialogLabel}>Role *</Text>
              <View style={styles.roleSelection}>
                {userRoles.slice(0, 3).map((role) => (
                  <Chip
                    key={role.value}
                    selected={newUser.role === role.value}
                    onPress={() => setNewUser({...newUser, role: role.value})}
                    style={styles.roleOption}
                    mode="outlined"
                    icon={role.icon}
                  >
                    {role.label}
                  </Chip>
                ))}
              </View>
              
              <TextInput
                label="Password *"
                value={newUser.password}
                onChangeText={(text) => setNewUser({...newUser, password: text})}
                style={styles.dialogInput}
                mode="outlined"
                secureTextEntry
              />
              
              <TextInput
                label="Confirm Password *"
                value={newUser.confirmPassword}
                onChangeText={(text) => setNewUser({...newUser, confirmPassword: text})}
                style={styles.dialogInput}
                mode="outlined"
                secureTextEntry
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddUserDialog(false);
              resetNewUserForm();
            }}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAddUser}>
              Add User
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit User Dialog */}
      <Portal>
        <Dialog
          visible={showEditUserDialog}
          onDismiss={() => setShowEditUserDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Edit User</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Full Name *"
              value={editUser.name}
              onChangeText={(text) => setEditUser({...editUser, name: text})}
              style={styles.dialogInput}
              mode="outlined"
            />
            
            <TextInput
              label="Email Address *"
              value={editUser.email}
              onChangeText={(text) => setEditUser({...editUser, email: text})}
              style={styles.dialogInput}
              mode="outlined"
              keyboardType="email-address"
            />
            
            <TextInput
              label="Phone Number *"
              value={editUser.phone}
              onChangeText={(text) => setEditUser({...editUser, phone: text})}
              style={styles.dialogInput}
              mode="outlined"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.dialogLabel}>Role</Text>
            <View style={styles.roleSelection}>
              {userRoles.slice(0, 3).map((role) => (
                <Chip
                  key={role.value}
                  selected={editUser.role === role.value}
                  onPress={() => setEditUser({...editUser, role: role.value})}
                  style={styles.roleOption}
                  mode="outlined"
                  icon={role.icon}
                >
                  {role.label}
                </Chip>
              ))}
            </View>
            
            <Text style={styles.dialogLabel}>Status</Text>
            <View style={styles.roleSelection}>
              <Chip
                selected={editUser.status === 'active'}
                onPress={() => setEditUser({...editUser, status: 'active'})}
                style={styles.statusOption}
                mode="outlined"
                icon="check-circle"
              >
                Active
              </Chip>
              <Chip
                selected={editUser.status === 'inactive'}
                onPress={() => setEditUser({...editUser, status: 'inactive'})}
                style={styles.statusOption}
                mode="outlined"
                icon="block-helper"
              >
                Inactive
              </Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditUserDialog(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleEditUser}>
              Save Changes
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
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete user "{selectedUser?.name}"?
            </Text>
            <Text style={styles.deleteWarning}>
              This action cannot be undone. All associated data will be removed.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleDeleteUser}
              mode="contained"
              style={{ backgroundColor: '#F44336' }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
  },
  searchbar: {
    flex: 1,
    marginRight: 10,
    elevation: 0,
  },
  filterButton: {
    alignSelf: 'center',
  },
  activeFilters: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  activeFilterChip: {
    alignSelf: 'flex-start',
  },
  listContent: {
    paddingBottom: 80,
  },
  userCard: {
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleChip: {
    marginRight: 8,
  },
  roleChipText: {
    color: 'white',
    fontSize: 10,
  },
  userDivider: {
    marginVertical: 10,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  userExtra: {
    marginTop: 5,
  },
  designationChip: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  departmentText: {
    fontSize: 12,
    color: '#666',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  dialog: {
    borderRadius: 12,
  },
  dialogScroll: {
    maxHeight: 500,
  },
  dialogInput: {
    marginBottom: 15,
  },
  dialogLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  roleSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  roleOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusOption: {
    marginRight: 8,
  },
  deleteWarning: {
    marginTop: 10,
    color: '#F44336',
    fontSize: 14,
    fontStyle: 'italic',
  },
});