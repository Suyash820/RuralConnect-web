// src/screens/citizen/Jobs.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Linking
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Searchbar,
  Chip,
  FAB
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../../contexts/NetworkContext';
import { executeSql } from '../../services/database';

const jobCategories = [
  'All', 'Government', 'Agriculture', 'Construction', 'Education', 'Healthcare'
];

export default function Jobs() {
  const { t } = useTranslation();
  const { isConnected } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      // Try to load from API if connected
      if (isConnected) {
        // Fetch from API
        const response = await fetch('https://your-api/jobs');
        const data = await response.json();
        setJobs(data);
        
        // Cache in local database
        for (const job of data) {
          await executeSql(
            `INSERT OR REPLACE INTO jobs (id, title, company, location, description, salary, deadline, category) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [job.id, job.title, job.company, job.location, job.description, job.salary, job.deadline, job.category]
          );
        }
      } else {
        // Load from local cache
        const result = await executeSql('SELECT * FROM jobs ORDER BY created_at DESC');
        setJobs(result.rows._array);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Load from local cache as fallback
      const result = await executeSql('SELECT * FROM jobs ORDER BY created_at DESC');
      setJobs(result.rows._array);
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId) => {
    try {
      await executeSql('UPDATE jobs SET saved = 1 WHERE id = ?', [jobId]);
      Alert.alert('Success', 'Job saved for offline viewing');
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const applyForJob = (job) => {
    if (job.applyUrl) {
      Linking.openURL(job.applyUrl);
    } else {
      Alert.alert('Application', 'Please contact the employer directly');
    }
  };

  const renderJobItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.company}>{item.company}</Text>
        <View style={styles.jobMeta}>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.salary}>{item.salary}</Text>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.deadlineContainer}>
          <Text style={styles.deadline}>Apply by: {item.deadline}</Text>
          <Chip style={styles.categoryChip}>{item.category}</Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => saveJob(item.id)}
          icon="bookmark-outline"
        >
          Save
        </Button>
        <Button
          mode="contained"
          onPress={() => applyForJob(item)}
          icon="send"
        >
          Apply
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search jobs by title, company, location"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.categories}>
        <FlatList
          horizontal
          data={jobCategories}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={styles.categoryChip}
              mode="outlined"
            >
              {item}
            </Chip>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={jobs.filter(job => {
          const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              job.location.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
          return matchesSearch && matchesCategory;
        })}
        renderItem={renderJobItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadJobs}
      />

      <FAB
        style={styles.fab}
        icon="filter"
        onPress={() => console.log('Filter pressed')}
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
  categories: {
    paddingHorizontal: 10,
    marginBottom: 10
  },
  categoryChip: {
    marginRight: 8
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 3
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  location: {
    fontSize: 14,
    color: '#888'
  },
  salary: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold'
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10
  },
  deadlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deadline: {
    fontSize: 12,
    color: '#f44336'
  },
  listContent: {
    paddingBottom: 80
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3'
  }
});