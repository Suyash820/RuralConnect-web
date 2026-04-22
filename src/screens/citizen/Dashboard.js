// src/screens/citizen/Dashboard.js
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Text,
  IconButton
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Dashboard({ navigation }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('dashboard.fileComplaint'),
      icon: 'alert-circle',
      color: '#FF5722',
      screen: 'FileComplaint',
      stack: 'Complaints'
    },
    {
      title: t('dashboard.checkSchemes'),
      icon: 'file-document',
      color: '#4CAF50',
      screen: 'SchemesList',
      stack: 'Schemes'
    },
    {
      title: t('dashboard.learning'),
      icon: 'book-open',
      color: '#9C27B0',
      screen: 'LearningHome',
      stack: 'Learning'
    },
    {
      title: t('dashboard.jobs'),
      icon: 'briefcase',
      color: '#FF9800',
      screen: 'JobsList',
      stack: 'Jobs'
    },
    {
      title: t('dashboard.aiAssistant'),
      icon: 'robot',
      color: '#2196F3',
      screen: 'Chatbot',
      stack: 'Schemes'
    },
    {
      title: t('dashboard.profile'),
      icon: 'account',
      color: '#607D8B',
      screen: 'ProfileHome',
      stack: 'Profile'
    },
  ];

  const handleQuickAction = (action) => {
    // Navigate to the appropriate stack
    if (action.stack === 'Complaints') {
      navigation.navigate('Complaints', {
        screen: action.screen
      });
    } else if (action.stack === 'Schemes') {
      navigation.navigate('Schemes', {
        screen: action.screen
      });
    } else {
      navigation.navigate(action.screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with user info */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={50} 
              label={user?.name?.charAt(0) || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.userText}>
              <Title style={styles.welcomeText}>
                {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'User'}
              </Title>
              <Paragraph style={styles.userRole}>
                Citizen • {user?.phone || ''}
              </Paragraph>
            </View>
          </View>
          <IconButton
            icon="bell-outline"
            size={24}
            onPress={() => console.log('Notifications')}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>{t('dashboard.quickActions')}</Title>
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Icon name={action.icon} size={24} color="white" />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <Card style={styles.card}>
        <Card.Title
          title={t('dashboard.recentActivity')}
          right={(props) => (
            <Button onPress={() => navigation.navigate('MyComplaints')}>
              {t('dashboard.viewAll')}
            </Button>
          )}
        />
        <Card.Content>
          <View style={styles.activityItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.activityText}>Complaint #123 resolved</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="clock-outline" size={20} color="#FF9800" />
            <Text style={styles.activityText}>Scheme eligibility checked</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="download" size={20} color="#2196F3" />
            <Text style={styles.activityText}>Learning video downloaded</Text>
            <Text style={styles.activityTime}>2 days ago</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Offline Status */}
      <Card style={[styles.card, styles.offlineCard]}>
        <Card.Content style={styles.offlineContent}>
          <Icon name="cloud-off-outline" size={30} color="#757575" />
          <View style={styles.offlineText}>
            <Title style={styles.offlineTitle}>Offline Mode</Title>
            <Paragraph>You can still file complaints and access downloaded content</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 10,
    elevation: 4,
    backgroundColor: '#2196F3',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#fff',
    marginRight: 15,
  },
  userText: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: '#757575',
  },
  offlineCard: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#757575',
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
    color: '#424242',
  },
});