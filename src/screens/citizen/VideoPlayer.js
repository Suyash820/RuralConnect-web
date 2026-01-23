// src/screens/citizen/VideoPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  BackHandler
} from 'react-native';
import {
  Text,
  Title,
  Button,
  IconButton,
  Card,
  Divider,
  Chip,
  ProgressBar,
  Menu
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Video } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useNetwork } from '../../contexts/NetworkContext';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 9 / 16; // 16:9 aspect ratio

export default function VideoPlayer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { isConnected, isLowBandwidth } = useNetwork();
  
  const { video } = route.params || {};
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Sample video data if not provided
  const defaultVideo = {
    id: '1',
    title: 'Modern Farming Techniques',
    description: 'Learn about modern agricultural practices for better yield',
    duration: '15:30',
    category: 'Agriculture',
    instructor: 'Dr. Rajesh Kumar',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    size: '45 MB',
    views: '1250',
    likes: '89',
    uploadDate: '2024-01-15',
    offlinePath: null
  };

  const currentVideo = video || defaultVideo;

  useEffect(() => {
    // Check if video is downloaded locally
    checkIfDownloaded();
    
    // Setup back handler
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => {
      backHandler.remove();
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const checkIfDownloaded = async () => {
    try {
      // Check if video exists in local storage
      const videoPath = `${FileSystem.documentDirectory}${currentVideo.id}.mp4`;
      const fileInfo = await FileSystem.getInfoAsync(videoPath);
      setIsDownloaded(fileInfo.exists);
    } catch (error) {
      console.error('Error checking download:', error);
    }
  };

  const handleBackPress = () => {
    if (status.isPlaying) {
      videoRef.current.pauseAsync();
    }
    return false;
  };

  const handlePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleSeek = async (seconds) => {
    await videoRef.current.setPositionAsync(
      Math.max(0, Math.min(status.positionMillis + seconds * 1000, status.durationMillis))
    );
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.setRateAsync(speed, true);
    }
    setShowSpeedMenu(false);
  };

  const handleDownload = async () => {
    if (!isConnected) {
      Alert.alert('No Internet', 'You need internet connection to download video');
      return;
    }

    if (isLowBandwidth()) {
      Alert.alert(
        'Low Bandwidth Warning',
        'You are on mobile data. Download may use significant data.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: startDownload }
        ]
      );
      return;
    }

    startDownload();
  };

  const startDownload = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    
    try {
      const videoUri = currentVideo.videoUrl;
      const videoPath = `${FileSystem.documentDirectory}${currentVideo.id}.mp4`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUri,
        videoPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        setIsDownloaded(true);
        Alert.alert('Success', 'Video downloaded for offline viewing');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download video. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = async () => {
    try {
      if (isDownloaded) {
        const videoPath = `${FileSystem.documentDirectory}${currentVideo.id}.mp4`;
        await Sharing.shareAsync(videoPath, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share Video',
        });
      } else {
        await Sharing.shareAsync(currentVideo.videoUrl, {
          dialogTitle: 'Share Video Link',
        });
      }
    } catch (error) {
      console.error('Sharing error:', error);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoSource = () => {
    if (isDownloaded) {
      return { uri: `${FileSystem.documentDirectory}${currentVideo.id}.mp4` };
    }
    return { uri: currentVideo.videoUrl };
  };

  const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2.0 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar hidden={showControls ? false : true} />
      
      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={getVideoSource()}
          useNativeControls={false}
          resizeMode="contain"
          onPlaybackStatusUpdate={setStatus}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={(error) => {
            console.error('Video error:', error);
            setVideoError(true);
            setLoading(false);
          }}
          rate={playbackSpeed}
          shouldPlay={false}
          isLooping={false}
        />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        
        {videoError && (
          <View style={styles.errorOverlay}>
            <Icon name="alert-circle" size={50} color="#F44336" />
            <Text style={styles.errorText}>Failed to load video</Text>
            <Button
              mode="contained"
              onPress={() => setVideoError(false)}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        )}
        
        {/* Custom Controls */}
        {showControls && !loading && !videoError && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <IconButton
                icon="arrow-left"
                iconColor="white"
                size={24}
                onPress={() => navigation.goBack()}
                style={styles.controlButton}
              />
              
              <View style={styles.titleContainer}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {currentVideo.title}
                </Text>
              </View>
              
              <IconButton
                icon="download"
                iconColor={isDownloaded ? '#4CAF50' : 'white'}
                size={24}
                onPress={handleDownload}
                style={styles.controlButton}
                disabled={downloading || isDownloaded}
              />
            </View>
            
            {/* Center Controls */}
            <View style={styles.centerControls}>
              <IconButton
                icon="rewind-10"
                iconColor="white"
                size={30}
                onPress={() => handleSeek(-10)}
                style={styles.centerControlButton}
              />
              
              <IconButton
                icon={status.isPlaying ? 'pause' : 'play'}
                iconColor="white"
                size={50}
                onPress={handlePlayPause}
                style={styles.playButton}
              />
              
              <IconButton
                icon="fast-forward-10"
                iconColor="white"
                size={30}
                onPress={() => handleSeek(10)}
                style={styles.centerControlButton}
              />
            </View>
            
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {formatTime(status.positionMillis || 0)}
              </Text>
              
              <ProgressBar
                progress={(status.positionMillis || 0) / (status.durationMillis || 1)}
                style={styles.progressBar}
                color="#2196F3"
              />
              
              <Text style={styles.timeText}>
                {formatTime(status.durationMillis || 0)}
              </Text>
              
              <Menu
                visible={showSpeedMenu}
                onDismiss={() => setShowSpeedMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.speedButton}
                    onPress={() => setShowSpeedMenu(true)}
                  >
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                  </TouchableOpacity>
                }
              >
                {speedOptions.map((option) => (
                  <Menu.Item
                    key={option.value}
                    onPress={() => handleSpeedChange(option.value)}
                    title={option.label}
                    style={option.value === playbackSpeed && styles.selectedSpeed}
                  />
                ))}
              </Menu>
              
              <IconButton
                icon="fullscreen"
                iconColor="white"
                size={20}
                onPress={() => {}}
                style={styles.controlButton}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Download Progress */}
      {downloading && (
        <Card style={styles.downloadCard}>
          <Card.Content>
            <View style={styles.downloadInfo}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.downloadText}>Downloading video...</Text>
              <Text style={styles.downloadPercent}>
                {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={downloadProgress}
              style={styles.downloadProgress}
              color="#2196F3"
            />
          </Card.Content>
        </Card>
      )}
      
      {/* Video Details */}
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailsContent}>
          <Title style={styles.detailTitle}>{currentVideo.title}</Title>
          
          <View style={styles.metaInfo}>
            <Chip mode="outlined" style={styles.categoryChip}>
              {currentVideo.category}
            </Chip>
            
            <View style={styles.metaItem}>
              <Icon name="eye" size={16} color="#666" />
              <Text style={styles.metaText}>{currentVideo.views} views</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{currentVideo.duration}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.instructorInfo}>
            <Icon name="account-circle" size={40} color="#666" />
            <View style={styles.instructorDetails}>
              <Text style={styles.instructorName}>{currentVideo.instructor}</Text>
              <Text style={styles.instructorRole}>Agriculture Expert</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{currentVideo.description}</Text>
          
          <Divider style={styles.divider} />
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleDownload}
              style={styles.actionButton}
              icon={isDownloaded ? 'check-circle' : 'download'}
              loading={downloading}
              disabled={downloading || isDownloaded}
            >
              {isDownloaded ? 'Downloaded' : 'Download'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleShare}
              style={styles.actionButton}
              icon="share-variant"
            >
              Share
            </Button>
          </View>
          
          {/* Related Videos */}
          <Title style={styles.relatedTitle}>Related Videos</Title>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.relatedVideo}
              onPress={() => Alert.alert('Video', 'Would play related video')}
            >
              <View style={styles.relatedThumbnail}>
                <Icon name="play-circle" size={30} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedTitleText} numberOfLines={2}>
                  Learn about {currentVideo.category.toLowerCase()} techniques
                </Text>
                <Text style={styles.relatedDuration}>8:45</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Offline Info */}
          {!isConnected && (
            <Card style={styles.offlineCard}>
              <Card.Content style={styles.offlineContent}>
                <Icon name="cloud-off-outline" size={30} color="#666" />
                <View style={styles.offlineText}>
                  <Text style={styles.offlineTitle}>Offline Mode</Text>
                  <Text style={styles.offlineMessage}>
                    You are offline. Only downloaded videos are available.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Import ScrollView
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  controlButton: {
    margin: 0,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerControlButton: {
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    marginHorizontal: 10,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginRight: 10,
  },
  speedText: {
    color: 'white',
    fontSize: 12,
  },
  selectedSpeed: {
    backgroundColor: '#E3F2FD',
  },
  downloadCard: {
    margin: 10,
    elevation: 4,
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  downloadPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  downloadProgress: {
    height: 6,
    borderRadius: 3,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detailsContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryChip: {
    marginRight: 10,
    marginBottom: 5,
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
  divider: {
    marginVertical: 15,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  instructorRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  relatedVideo: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  relatedThumbnail: {
    width: 120,
    height: 70,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  relatedTitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  relatedDuration: {
    fontSize: 12,
    color: '#666',
  },
  offlineCard: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#666',
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    flex: 1,
    marginLeft: 15,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  offlineMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});