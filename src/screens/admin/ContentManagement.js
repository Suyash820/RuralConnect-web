// src/screens/admin/ContentManagement.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
  Image,
  TouchableOpacity,
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
  Dialog,
  Portal,
  TextInput,
  Switch,
  Divider,
  List,
  IconButton,
  ProgressBar,
  Avatar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { executeSql } from '../../services/database';

const { width } = Dimensions.get('window');

const contentTypes = [
  { label: 'All', value: 'all', icon: 'view-list' },
  { label: 'Videos', value: 'video', icon: 'video' },
  { label: 'PDFs', value: 'pdf', icon: 'file-pdf' },
  { label: 'Images', value: 'image', icon: 'image' },
  { label: 'Documents', value: 'document', icon: 'file-document' },
];

const categories = [
  'Agriculture',
  'Healthcare',
  'Education',
  'Financial Literacy',
  'Government Schemes',
  'Skill Development',
  'Technology',
  'Environment'
];

const statusFilters = [
  { label: 'All', value: 'all', icon: 'view-list' },
  { label: 'Published', value: 'published', icon: 'check-circle' },
  { label: 'Draft', value: 'draft', icon: 'pencil' },
  { label: 'Archived', value: 'archived', icon: 'archive' },
];

const mockContent = [
  {
    id: 1,
    title: 'Modern Farming Techniques',
    description: 'Learn about modern agricultural practices for better yield',
    type: 'video',
    category: 'Agriculture',
    size: '45 MB',
    duration: '15:30',
    views: 1250,
    downloads: 450,
    uploadDate: '2024-01-15',
    status: 'published',
    offlineAvailable: true,
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
  },
  {
    id: 2,
    title: 'Health & Hygiene Guide',
    description: 'Basic health practices for rural communities',
    type: 'pdf',
    category: 'Healthcare',
    size: '8 MB',
    pages: 24,
    views: 890,
    downloads: 320,
    uploadDate: '2024-01-18',
    status: 'published',
    offlineAvailable: true
  },
  {
    id: 3,
    title: 'Digital Literacy Basics',
    description: 'Introduction to smartphones and internet',
    type: 'video',
    category: 'Technology',
    size: '60 MB',
    duration: '20:15',
    views: 2100,
    downloads: 780,
    uploadDate: '2024-01-10',
    status: 'published',
    offlineAvailable: true
  },
  {
    id: 4,
    title: 'Government Schemes Handbook',
    description: 'Complete guide to available government schemes',
    type: 'document',
    category: 'Government Schemes',
    size: '12 MB',
    pages: 48,
    views: 1560,
    downloads: 540,
    uploadDate: '2024-01-20',
    status: 'draft',
    offlineAvailable: false
  },
  {
    id: 5,
    title: 'Financial Planning Guide',
    description: 'Basic financial literacy and planning',
    type: 'pdf',
    category: 'Financial Literacy',
    size: '10 MB',
    pages: 32,
    views: 980,
    downloads: 310,
    uploadDate: '2024-01-12',
    status: 'published',
    offlineAvailable: true
  },
  {
    id: 6,
    title: 'Organic Farming Methods',
    description: 'Sustainable farming practices',
    type: 'image',
    category: 'Agriculture',
    size: '5 MB',
    views: 670,
    downloads: 210,
    uploadDate: '2024-01-22',
    status: 'published',
    offlineAvailable: true
  }
];

export default function ContentManagement() {
  const navigation = useNavigation();
  
  const [content, setContent] = useState(mockContent);
  const [filteredContent, setFilteredContent] = useState(mockContent);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'video',
    category: 'Agriculture',
    file: null,
    status: 'draft',
    offlineAvailable: true
  });

  const [editContent, setEditContent] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    offlineAvailable: true
  });

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [searchQuery, selectedType, selectedCategory, selectedStatus, content]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const result = await executeSql(
        `SELECT * FROM learning_materials 
         ORDER BY created_at DESC`
      );
      
      if (result.rows.length > 0) {
        // Use mock data for now
        setContent(mockContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    setFilteredContent(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileType = getFileType(file.name);
        
        setNewContent({
          ...newContent,
          file: file,
          type: fileType,
          title: file.name.replace(/\.[^/.]+$/, "") // Remove extension
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return 'video';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else {
      return 'document';
    }
  };

  const handleUploadContent = async () => {
    if (!newContent.title || !newContent.description || !newContent.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!newContent.file) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 300);

    try {
      // In real app, upload to server
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newItem = {
        id: content.length + 1,
        title: newContent.title,
        description: newContent.description,
        type: newContent.type,
        category: newContent.category,
        size: '15 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: newContent.status,
        offlineAvailable: newContent.offlineAvailable,
        views: 0,
        downloads: 0
      };

      setContent([newItem, ...content]);
      setShowUploadDialog(false);
      resetNewContentForm();
      
      Alert.alert('Success', 'Content uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload content');
    } finally {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditContent = () => {
    if (!editContent.title || !editContent.description || !editContent.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const updatedContent = content.map(item =>
      item.id === selectedItem.id ? { ...item, ...editContent } : item
    );

    setContent(updatedContent);
    setShowEditDialog(false);
    setSelectedItem(null);
    
    Alert.alert('Success', 'Content updated successfully');
  };

  const handleDeleteContent = () => {
    if (!selectedItem) return;

    const updatedContent = content.filter(item => item.id !== selectedItem.id);
    setContent(updatedContent);
    setShowDeleteDialog(false);
    setSelectedItem(null);
    
    Alert.alert('Success', 'Content deleted successfully');
  };

  const handleToggleStatus = (item) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    const updatedContent = content.map(c =>
      c.id === item.id ? { ...c, status: newStatus } : c
    );

    setContent(updatedContent);
    Alert.alert('Success', `Content ${newStatus === 'published' ? 'published' : 'unpublished'}`);
  };

  const handleToggleOffline = (item) => {
    const updatedContent = content.map(c =>
      c.id === item.id ? { ...c, offlineAvailable: !c.offlineAvailable } : c
    );

    setContent(updatedContent);
    Alert.alert('Success', `Content ${!item.offlineAvailable ? 'enabled' : 'disabled'} for offline`);
  };

  const resetNewContentForm = () => {
    setNewContent({
      title: '',
      description: '',
      type: 'video',
      category: 'Agriculture',
      file: null,
      status: 'draft',
      offlineAvailable: true
    });
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return 'video';
      case 'pdf': return 'file-pdf-box';
      case 'image': return 'image';
      case 'document': return 'file-document';
      default: return 'file';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return '#FF5252';
      case 'pdf': return '#F44336';
      case 'image': return '#4CAF50';
      case 'document': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#4CAF50';
      case 'draft': return '#FF9800';
      case 'archived': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getFileSizeInfo = (size) => {
    if (!size) return { value: 0, unit: 'MB' };
    const match = size.match(/(\d+\.?\d*)\s*(\w+)/);
    return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: 0, unit: 'MB' };
  };

  const getStats = () => {
    const total = content.length;
    const videos = content.filter(c => c.type === 'video').length;
    const pdfs = content.filter(c => c.type === 'pdf').length;
    const published = content.filter(c => c.status === 'published').length;
    const offline = content.filter(c => c.offlineAvailable).length;
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalDownloads = content.reduce((sum, c) => sum + (c.downloads || 0), 0);

    return { total, videos, pdfs, published, offline, totalViews, totalDownloads };
  };

  const renderContentItem = ({ item }) => {
    const typeColor = getTypeColor(item.type);
    const statusColor = getStatusColor(item.status);
    
    return (
      <Card style={styles.contentCard}>
        <Card.Content>
          <View style={styles.contentHeader}>
            <View style={styles.contentInfo}>
              <View style={styles.titleRow}>
                <Avatar.Icon 
                  size={40} 
                  icon={getContentIcon(item.type)} 
                  style={{ backgroundColor: typeColor }}
                />
                <View style={styles.titleContainer}>
                  <Text style={styles.contentTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.contentCategory}>{item.category}</Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <Chip
                  style={[styles.typeChip, { backgroundColor: typeColor }]}
                  textStyle={styles.typeChipText}
                  icon={getContentIcon(item.type)}
                >
                  {item.type}
                </Chip>
                
                <Chip
                  style={[styles.statusChip, { backgroundColor: statusColor }]}
                  textStyle={styles.statusChipText}
                  icon={item.status === 'published' ? 'check-circle' : 'pencil'}
                >
                  {item.status}
                </Chip>
              </View>
            </View>
            
            <Menu
              visible={selectedItem?.id === item.id && showStatusMenu}
              onDismiss={() => {
                setShowStatusMenu(false);
                setSelectedItem(null);
              }}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => {
                    setSelectedItem(item);
                    setShowStatusMenu(true);
                  }}
                />
              }
            >
              <Menu.Item
                title="Edit Content"
                leadingIcon="pencil"
                onPress={() => {
                  setShowStatusMenu(false);
                  setEditContent({
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    status: item.status,
                    offlineAvailable: item.offlineAvailable
                  });
                  setSelectedItem(item);
                  setShowEditDialog(true);
                }}
              />
              <Menu.Item
                title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                leadingIcon={item.status === 'published' ? 'eye-off' : 'eye'}
                onPress={() => {
                  setShowStatusMenu(false);
                  handleToggleStatus(item);
                }}
              />
              <Menu.Item
                title={item.offlineAvailable ? 'Disable Offline' : 'Enable Offline'}
                leadingIcon={item.offlineAvailable ? 'cloud-off' : 'cloud'}
                onPress={() => {
                  setShowStatusMenu(false);
                  handleToggleOffline(item);
                }}
              />
              <Menu.Item
                title="Delete Content"
                leadingIcon="delete"
                onPress={() => {
                  setShowStatusMenu(false);
                  setSelectedItem(item);
                  setShowDeleteDialog(true);
                }}
              />
            </Menu>
          </View>
          
          <Text style={styles.contentDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <Divider style={styles.contentDivider} />
          
          <View style={styles.contentMeta}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={14} color="#666" />
                <Text style={styles.metaText}>Uploaded: {item.uploadDate}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Icon name="download" size={14} color="#666" />
                <Text style={styles.metaText}>Size: {item.size}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="eye" size={14} color="#666" />
                <Text style={styles.metaText}>Views: {item.views}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Icon name="download" size={14} color="#666" />
                <Text style={styles.metaText}>Downloads: {item.downloads}</Text>
              </View>
            </View>
            
            {item.duration && (
              <View style={styles.metaItem}>
                <Icon name="clock" size={14} color="#666" />
                <Text style={styles.metaText}>Duration: {item.duration}</Text>
              </View>
            )}
            
            {item.pages && (
              <View style={styles.metaItem}>
                <Icon name="file-document" size={14} color="#666" />
                <Text style={styles.metaText}>Pages: {item.pages}</Text>
              </View>
            )}
            
            <View style={styles.offlineStatus}>
              <Icon 
                name={item.offlineAvailable ? "cloud-check" : "cloud-off"} 
                size={16} 
                color={item.offlineAvailable ? "#4CAF50" : "#F44336"} 
              />
              <Text style={[
                styles.offlineText,
                { color: item.offlineAvailable ? "#4CAF50" : "#F44336" }
              ]}>
                {item.offlineAvailable ? 'Available offline' : 'Online only'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const stats = getStats();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Overview */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Content Statistics</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF5252' }]}>{stats.videos}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.pdfs}</Text>
              <Text style={styles.statLabel}>PDFs</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.published}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.offline}</Text>
              <Text style={styles.statLabel}>Offline</Text>
            </View>
          </View>
          
          <View style={styles.engagementStats}>
            <View style={styles.engagementItem}>
              <Icon name="eye" size={20} color="#666" />
              <Text style={styles.engagementNumber}>{stats.totalViews}</Text>
              <Text style={styles.engagementLabel}>Total Views</Text>
            </View>
            
            <View style={styles.engagementItem}>
              <Icon name="download" size={20} color="#666" />
              <Text style={styles.engagementNumber}>{stats.totalDownloads}</Text>
              <Text style={styles.engagementLabel}>Total Downloads</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search content by title, description, or category"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
        />
      </View>

      <View style={styles.filterContainer}>
        <Menu
          visible={showTypeMenu}
          onDismiss={() => setShowTypeMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowTypeMenu(true)}
              style={styles.filterButton}
              icon="file"
            >
              Type: {contentTypes.find(t => t.value === selectedType)?.label || 'All'}
            </Button>
          }
        >
          {contentTypes.map((type) => (
            <Menu.Item
              key={type.value}
              onPress={() => {
                setSelectedType(type.value);
                setShowTypeMenu(false);
              }}
              title={type.label}
              leadingIcon={type.icon}
            />
          ))}
        </Menu>

        <Menu
          visible={showCategoryMenu}
          onDismiss={() => setShowCategoryMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowCategoryMenu(true)}
              style={styles.filterButton}
              icon="tag"
            >
              Category: {selectedCategory === 'all' ? 'All' : selectedCategory}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedCategory('all');
              setShowCategoryMenu(false);
            }}
            title="All Categories"
            leadingIcon="view-list"
          />
          {categories.map((category) => (
            <Menu.Item
              key={category}
              onPress={() => {
                setSelectedCategory(category);
                setShowCategoryMenu(false);
              }}
              title={category}
              leadingIcon="tag"
            />
          ))}
        </Menu>

        <Menu
          visible={showStatusMenu}
          onDismiss={() => setShowStatusMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowStatusMenu(true)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Status: {statusFilters.find(s => s.value === selectedStatus)?.label || 'All'}
            </Button>
          }
        >
          {statusFilters.map((status) => (
            <Menu.Item
              key={status.value}
              onPress={() => {
                setSelectedStatus(status.value);
                setShowStatusMenu(false);
              }}
              title={status.label}
              leadingIcon={status.icon}
            />
          ))}
        </Menu>
      </View>

      {/* Active Filters */}
      <View style={styles.activeFilters}>
        {selectedType !== 'all' && (
          <Chip
            onClose={() => setSelectedType('all')}
            icon={contentTypes.find(t => t.value === selectedType)?.icon}
            style={styles.activeFilterChip}
          >
            {contentTypes.find(t => t.value === selectedType)?.label}
          </Chip>
        )}
        
        {selectedCategory !== 'all' && (
          <Chip
            onClose={() => setSelectedCategory('all')}
            icon="tag"
            style={styles.activeFilterChip}
          >
            {selectedCategory}
          </Chip>
        )}
        
        {selectedStatus !== 'all' && (
          <Chip
            onClose={() => setSelectedStatus('all')}
            icon={statusFilters.find(s => s.value === selectedStatus)?.icon}
            style={styles.activeFilterChip}
          >
            {statusFilters.find(s => s.value === selectedStatus)?.label}
          </Chip>
        )}
      </View>

      {/* Content List */}
      <FlatList
        data={filteredContent}
        renderItem={renderContentItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file-document" size={60} color="#bdbdbd" />
            <Title style={styles.emptyTitle}>No Content Found</Title>
            <Text style={styles.emptyText}>
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'No content matches your filters'
                : 'No content available'
              }
            </Text>
          </View>
        }
      />

      {/* Add Content FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowUploadDialog(true)}
        label="Upload Content"
      />

      {/* Upload Content Dialog */}
      <Portal>
        <Dialog
          visible={showUploadDialog}
          onDismiss={() => {
            setShowUploadDialog(false);
            resetNewContentForm();
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Upload New Content</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              <Button
                mode="outlined"
                onPress={handleSelectFile}
                style={styles.fileButton}
                icon="file-upload"
              >
                {newContent.file ? newContent.file.name : 'Select File'}
              </Button>
              
              {uploading && (
                <View style={styles.progressContainer}>
                  <ProgressBar 
                    progress={uploadProgress} 
                    color="#2196F3"
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    Uploading... {Math.round(uploadProgress * 100)}%
                  </Text>
                </View>
              )}
              
              <TextInput
                label="Title *"
                value={newContent.title}
                onChangeText={(text) => setNewContent({...newContent, title: text})}
                style={styles.dialogInput}
                mode="outlined"
              />
              
              <TextInput
                label="Description *"
                value={newContent.description}
                onChangeText={(text) => setNewContent({...newContent, description: text})}
                style={styles.dialogInput}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.dialogLabel}>Content Type *</Text>
              <View style={styles.typeSelection}>
                {contentTypes.slice(1).map((type) => (
                  <Chip
                    key={type.value}
                    selected={newContent.type === type.value}
                    onPress={() => setNewContent({...newContent, type: type.value})}
                    style={styles.typeOption}
                    mode="outlined"
                    icon={type.icon}
                  >
                    {type.label}
                  </Chip>
                ))}
              </View>
              
              <Text style={styles.dialogLabel}>Category *</Text>
              <View style={styles.categorySelection}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    selected={newContent.category === category}
                    onPress={() => setNewContent({...newContent, category: category})}
                    style={styles.categoryOption}
                    mode="outlined"
                  >
                    {category}
                  </Chip>
                ))}
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Publish Immediately</Text>
                <Switch
                  value={newContent.status === 'published'}
                  onValueChange={(value) => 
                    setNewContent({...newContent, status: value ? 'published' : 'draft'})
                  }
                  color="#2196F3"
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Available Offline</Text>
                <Switch
                  value={newContent.offlineAvailable}
                  onValueChange={(value) => 
                    setNewContent({...newContent, offlineAvailable: value})
                  }
                  color="#2196F3"
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowUploadDialog(false);
              resetNewContentForm();
            }}>
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleUploadContent}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Content Dialog */}
      <Portal>
        <Dialog
          visible={showEditDialog}
          onDismiss={() => setShowEditDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Edit Content</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title *"
              value={editContent.title}
              onChangeText={(text) => setEditContent({...editContent, title: text})}
              style={styles.dialogInput}
              mode="outlined"
            />
            
            <TextInput
              label="Description *"
              value={editContent.description}
              onChangeText={(text) => setEditContent({...editContent, description: text})}
              style={styles.dialogInput}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.dialogLabel}>Category *</Text>
            <View style={styles.categorySelection}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={editContent.category === category}
                  onPress={() => setEditContent({...editContent, category: category})}
                  style={styles.categoryOption}
                  mode="outlined"
                >
                  {category}
                </Chip>
              ))}
            </View>
            
            <Text style={styles.dialogLabel}>Status</Text>
            <View style={styles.statusSelection}>
              <Chip
                selected={editContent.status === 'published'}
                onPress={() => setEditContent({...editContent, status: 'published'})}
                style={styles.statusOption}
                mode="outlined"
                icon="check-circle"
              >
                Published
              </Chip>
              <Chip
                selected={editContent.status === 'draft'}
                onPress={() => setEditContent({...editContent, status: 'draft'})}
                style={styles.statusOption}
                mode="outlined"
                icon="pencil"
              >
                Draft
              </Chip>
              <Chip
                selected={editContent.status === 'archived'}
                onPress={() => setEditContent({...editContent, status: 'archived'})}
                style={styles.statusOption}
                mode="outlined"
                icon="archive"
              >
                Archived
              </Chip>
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available Offline</Text>
              <Switch
                value={editContent.offlineAvailable}
                onValueChange={(value) => 
                  setEditContent({...editContent, offlineAvailable: value})
                }
                color="#2196F3"
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleEditContent}>
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
          <Dialog.Title>Delete Content</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{selectedItem?.title}"?
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
              onPress={handleDeleteContent}
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
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  engagementItem: {
    alignItems: 'center',
  },
  engagementNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  engagementLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  searchbar: {
    elevation: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeFilters: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeFilterChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 80,
  },
  contentCard: {
    marginHorizontal: 10,
    marginVertical: 6,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  contentInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contentCategory: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  typeChip: {
    marginRight: 8,
  },
  typeChipText: {
    color: 'white',
    fontSize: 10,
  },
  statusChip: {
    marginRight: 8,
  },
  statusChipText: {
    color: 'white',
    fontSize: 10,
  },
  contentDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  contentDivider: {
    marginVertical: 10,
  },
  contentMeta: {
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  offlineStatus: {
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
    fontSize: 12,
    fontWeight: '500',
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
  fileButton: {
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  typeSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  categorySelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  statusOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  deleteWarning: {
    marginTop: 10,
    color: '#F44336',
    fontSize: 14,
    fontStyle: 'italic',
  },
});