// src/screens/citizen/Learning.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import { useNetwork } from '../../contexts/NetworkContext';
import { executeSql } from '../../services/database';

const learningMaterials = [
  {
    id: '1',
    title: 'Agricultural Techniques',
    description: 'Modern farming methods',
    category: 'agriculture',
    duration: '15 min',
    size: '25 MB',
    url: 'https://example.com/videos/agriculture.mp4'
  },
  {
    id: '2',
    title: 'Financial Literacy',
    description: 'Banking and savings',
    category: 'finance',
    duration: '20 min',
    size: '30 MB',
    url: 'https://example.com/videos/finance.mp4'
  },
  {
    id: '3',
    title: 'Health and Hygiene',
    description: 'Basic health practices',
    category: 'health',
    duration: '10 min',
    size: '15 MB',
    url: 'https://example.com/videos/health.mp4'
  },
  {
    id: '4',
    title: 'Digital Literacy',
    description: 'Using smartphones and apps',
    category: 'technology',
    duration: '25 min',
    size: '40 MB',
    url: 'https://example.com/videos/digital.mp4'
  }
];

export default function Learning({ navigation }) {
  const { t } = useTranslation();
  const { isConnected, isLowBandwidth } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState({});
  const [downloadedVideos, setDownloadedVideos] = useState({});

  useEffect(() => {
    loadDownloadedVideos();
  }, []);

  const loadDownloadedVideos = async () => {
    try {
      const result = await executeSql(
        'SELECT file_uri FROM learning_materials WHERE downloaded = 1'
      );
      const downloaded = {};
      result.rows._array.forEach(item => {
        downloaded[item.file_uri] = true;
      });
      setDownloadedVideos(downloaded);
    } catch (error) {
      console.error('Error loading downloaded videos:', error);
    }
  };

  const downloadVideo = async (video) => {
    if (!isConnected) {
      Alert.alert('Error', 'Need internet connection to download');
      return;
    }

    if (isLowBandwidth()) {
      Alert.alert(
        'Low Bandwidth',
        'You are on mobile data. Download may use significant data.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => startDownload(video) }
        ]
      );
      return;
    }

    startDownload(video);
  };

  const startDownload = async (video) => {
    setDownloading(prev => ({ ...prev, [video.id]: true }));

    try {
      const fileUri = `${FileSystem.documentDirectory}${video.id}.mp4`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        video.url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        // Save to database
        await executeSql(
          `INSERT OR REPLACE INTO learning_materials 
           (id, title, description, file_uri, file_type, category, downloaded, size) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [video.id, video.title, video.description, result.uri, 'video', video.category, 1, video.size]
        );

        setDownloadedVideos(prev => ({ ...prev, [result.uri]: true }));
        Alert.alert('Success', 'Video downloaded for offline viewing');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download video');
    } finally {
      setDownloading(prev => ({ ...prev, [video.id]: false }));
    }
  };

  const playVideo = (video) => {
    if (downloadedVideos[video.url] || !isConnected) {
      // Play offline video
      navigation.navigate('VideoPlayer', { video });
    } else {
      Alert.alert(
        'Video Not Downloaded',
        'This video requires internet connection. Would you like to download it for offline viewing?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: () => downloadVideo(video) },
          { text: 'Stream Online', onPress: () => navigation.navigate('VideoPlayer', { video }) }
        ]
      );
    }
  };

  const renderVideoItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>{item.duration}</Text>
          <Text style={styles.metaText}>{item.size}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => downloadVideo(item)}
          loading={downloading[item.id]}
          disabled={downloading[item.id] || downloadedVideos[item.url]}
        >
          {downloadedVideos[item.url] ? 'Downloaded' : 'Download'}
        </Button>
        <Button
          mode="contained"
          onPress={() => playVideo(item)}
        >
          Play
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search learning materials"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={learningMaterials.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchbar: {
    margin: 10,
    elevation: 2
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  metaText: {
    fontSize: 12,
    color: '#888'
  },
  category: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: 'bold'
  },
  listContent: {
    paddingBottom: 20
  }
});