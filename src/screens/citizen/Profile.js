// src/screens/citizen/Profile.js
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Text,
  List,
  Switch,
  Divider
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

export default function Profile({ navigation }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { 
          text: t('profile.logout'), 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const menuItems = [
    {
      title: t('profile.personalInfo'),
      icon: 'account-outline',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: t('profile.myComplaints'),
      icon: 'alert-circle-outline',
      onPress: () => navigation.navigate('MyComplaints'),
    },
    {
      title: t('profile.savedSchemes'),
      icon: 'bookmark-outline',
      onPress: () => console.log('Saved Schemes'),
    },
    {
      title: t('profile.downloadedContent'),
      icon: 'download-outline',
      onPress: () => navigation.navigate('OfflineContent'),
    },
    {
      title: t('profile.changeLanguage'),
      icon: 'translate',
      onPress: () => showLanguageSelector(),
    },
    {
      title: t('profile.settings'),
      icon: 'cog-outline',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: t('profile.helpSupport'),
      icon: 'help-circle-outline',
      onPress: () => console.log('Help & Support'),
    },
    {
      title: t('profile.aboutApp'),
      icon: 'information-outline',
      onPress: () => console.log('About App'),
    },
  ];

  const showLanguageSelector = () => {
    Alert.alert(
      t('profile.selectLanguage'),
      '',
      [
        { text: 'English', onPress: () => changeLanguage('en') },
        { text: 'हिंदी', onPress: () => changeLanguage('hi') },
        { text: 'தமிழ்', onPress: () => changeLanguage('ta') },
        { text: 'తెలుగు', onPress: () => changeLanguage('te') },
        { text: 'বাংলা', onPress: () => changeLanguage('bn') },
        { text: t('profile.cancel'), style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Title style={styles.name}>{user?.name || 'Citizen User'}</Title>
            <Paragraph style={styles.phone}>{user?.phone || 'Not provided'}</Paragraph>
            <Paragraph style={styles.email}>{user?.email || 'No email'}</Paragraph>
            <Text style={styles.userId}>User ID: {user?.id || 'N/A'}</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="outlined" 
            icon="pencil"
            onPress={() => navigation.navigate('EditProfile')}
          >
            {t('profile.editProfile')}
          </Button>
        </Card.Actions>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>{t('profile.complaints')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>{t('profile.resolved')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>{t('profile.schemes')}</Text>
        </View>
      </View>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.settingsTitle}>{t('profile.settings')}</Title>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="bell-outline" size={24} color="#757575" />
              <Text style={styles.settingText}>{t('profile.notifications')}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color="#2196F3"
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cloud-off-outline" size={24} color="#757575" />
              <Text style={styles.settingText}>{t('profile.offlineMode')}</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              color="#2196F3"
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="translate" size={24} color="#757575" />
              <Text style={styles.settingText}>{t('profile.language')}</Text>
            </View>
            <Button
              mode="text"
              onPress={showLanguageSelector}
              icon="chevron-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              {i18n.language === 'en' ? 'English' :
               i18n.language === 'hi' ? 'हिंदी' :
               i18n.language === 'ta' ? 'தமிழ்' :
               i18n.language === 'te' ? 'తెలుగు' :
               i18n.language === 'bn' ? 'বাংলা' : 'English'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.title}
                left={props => <List.Icon {...props} icon={item.icon} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={item.onPress}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        style={styles.logoutButton}
        textColor="#F44336"
      >
        {t('profile.logout')}
      </Button>

      {/* App Version */}
      <Text style={styles.versionText}>Rural e-Governance v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 10,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 16,
    color: '#757575',
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 2,
  },
  userId: {
    fontSize: 12,
    color: '#bdbdbd',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
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
  settingsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  divider: {
    marginVertical: 4,
  },
  menuCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 12,
  },
  logoutButton: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderColor: '#F44336',
  },
  versionText: {
    textAlign: 'center',
    color: '#9e9e9e',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
  },
});