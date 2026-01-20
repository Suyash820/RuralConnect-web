// src/screens/citizen/FileComplaint.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  RadioButton,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { insertComplaint } from '../../services/database';
import { useTranslation } from 'react-i18next';

const categories = [
  { label: 'Pothole', value: 'pothole' },
  { label: 'Garbage', value: 'garbage' },
  { label: 'Water Supply', value: 'water' },
  { label: 'Electricity', value: 'electricity' },
  { label: 'Road Repair', value: 'road_repair' },
  { label: 'Drainage', value: 'drainage' },
  { label: 'Street Light', value: 'street_light' },
  { label: 'Other', value: 'other' }
];

const priorities = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

export default function FileComplaint({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    priority: 'medium',
    location: ''
  });

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Lower quality for low bandwidth
        base64: true
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low // Lower accuracy for faster response
      });
      
      setLocation(location.coords);
      setFormData(prev => ({
        ...prev,
        location: `${location.coords.latitude}, ${location.coords.longitude}`
      }));
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const complaint = {
        userId: user?.id || 1,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        photoUri: photo?.uri || null,
        location: formData.location,
        priority: formData.priority
      };

      await insertComplaint(complaint);
      
      Alert.alert(
        'Success',
        'Complaint filed successfully. It will be synced when online.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={t('fileComplaint.title')} />
        <Card.Content>
          <TextInput
            label={t('fileComplaint.titleLabel')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t('fileComplaint.description')}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.sectionTitle}>{t('fileComplaint.category')}</Text>
          <RadioButton.Group
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            {categories.map((cat) => (
              <View key={cat.value} style={styles.radioOption}>
                <RadioButton value={cat.value} />
                <Text>{cat.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <Text style={styles.sectionTitle}>{t('fileComplaint.priority')}</Text>
          <RadioButton.Group
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            {priorities.map((pri) => (
              <View key={pri.value} style={styles.radioOption}>
                <RadioButton value={pri.value} />
                <Text>{pri.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={takePhoto}
              style={styles.button}
              icon="camera"
            >
              {photo ? t('fileComplaint.retakePhoto') : t('fileComplaint.takePhoto')}
            </Button>

            <Button
              mode="outlined"
              onPress={getCurrentLocation}
              style={styles.button}
              icon="map-marker"
            >
              {t('fileComplaint.getLocation')}
            </Button>
          </View>

          {photo && (
            <View style={styles.photoPreview}>
              <Text>{t('fileComplaint.photoTaken')}</Text>
            </View>
          )}

          {formData.location && (
            <Text style={styles.locationText}>
              Location: {formData.location}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            icon="send"
          >
            {t('fileComplaint.submit')}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  card: {
    margin: 10,
    elevation: 4
  },
  input: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16
  },
  button: {
    flex: 1,
    marginHorizontal: 4
  },
  photoPreview: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10
  },
  locationText: {
    marginVertical: 10,
    fontStyle: 'italic'
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30
  }
});