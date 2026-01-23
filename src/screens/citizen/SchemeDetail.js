// src/screens/citizen/SchemeDetail.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Share,
  Clipboard
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  List,
  IconButton,
  Dialog,
  Portal,
  Paragraph
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { checkEligibility } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

const schemeData = {
  'pm_kisan': {
    id: 'pm_kisan',
    title: 'PM-KISAN Scheme',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'A central sector scheme to provide income support to all landholding farmers\' families in the country.',
    benefits: [
      '₹6,000 per year in three equal installments',
      'Direct bank transfer',
      'No intermediary involved',
      'Covers all landholding farmer families'
    ],
    eligibility: [
      'Must be a landholding farmer family',
      'Landholding size: Up to 2 hectares',
      'Annual income limit: None specified',
      'All small and marginal farmers',
      'Includes tenant farmers'
    ],
    documents: [
      'Aadhar Card',
      'Land ownership papers',
      'Bank account details',
      'Passport size photo',
      'Mobile number linked with Aadhar'
    ],
    applicationProcess: [
      'Visit nearest Common Service Centre (CSC)',
      'Fill PM-KISAN registration form',
      'Submit required documents',
      'Get application ID',
      'Status can be tracked online'
    ],
    department: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: '2018',
    website: 'https://pmkisan.gov.in',
    helpline: '155261',
    lastUpdated: '2024-01-15',
    category: 'Agriculture',
    icon: 'sprout'
  },
  'pm_awas_yojana': {
    id: 'pm_awas_yojana',
    title: 'Pradhan Mantri Awas Yojana',
    fullName: 'Pradhan Mantri Awas Yojana (Urban & Rural)',
    description: 'Housing for All mission aimed at providing affordable housing to urban and rural poor.',
    benefits: [
      'Subsidy up to ₹2.67 lakh for EWS/LIG',
      'Interest subsidy of 6.5%',
      'Construction assistance',
      'Toilet construction support'
    ],
    eligibility: [
      'Annual family income below ₹3 lakh',
      'No existing pucca house',
      'Must be first-time home buyer',
      'Women ownership (preference)',
      'Belongs to EWS/LIG category'
    ],
    documents: [
      'Aadhar Card',
      'Income certificate',
      'Bank account details',
      'Address proof',
      'Caste certificate (if applicable)'
    ],
    applicationProcess: [
      'Apply online through official portal',
      'Or visit local municipal office',
      'Submit application with documents',
      'Get beneficiary ID',
      'Wait for approval and subsidy'
    ],
    department: 'Ministry of Housing and Urban Affairs',
    launchYear: '2015',
    website: 'https://pmaymis.gov.in',
    helpline: '1800116444',
    lastUpdated: '2024-01-10',
    category: 'Housing',
    icon: 'home'
  },
  'ayushman_bharat': {
    id: 'ayushman_bharat',
    title: 'Ayushman Bharat Yojana',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    description: 'World\'s largest health insurance scheme providing coverage up to ₹5 lakh per family per year.',
    benefits: [
      'Health coverage up to ₹5 lakh per family',
      'Covers secondary and tertiary hospitalization',
      'Pre-existing diseases covered',
      'Cashless treatment',
      'No restrictions on family size'
    ],
    eligibility: [
      'Socio-Economic Caste Census (SECC) 2011 data',
      'Automatically included families',
      'Rural: 10 pre-defined occupational categories',
      'Urban: 11 occupational categories',
      'No income certificate required'
    ],
    documents: [
      'Aadhar Card',
      'Ration Card',
      'Mobile number',
      'Bank account details (for cashless)',
      'Address proof'
    ],
    applicationProcess: [
      'Check eligibility on official website',
      'Visit empanelled hospital',
      'Produce Aadhar card',
      'Get e-card issued',
      'Avail cashless treatment'
    ],
    department: 'Ministry of Health & Family Welfare',
    launchYear: '2018',
    website: 'https://pmjay.gov.in',
    helpline: '14555',
    lastUpdated: '2024-01-20',
    category: 'Health',
    icon: 'hospital-box'
  }
};

export default function SchemeDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const { schemeId } = route.params || {};
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    loadSchemeDetails();
    checkIfSaved();
  }, [schemeId]);

  const loadSchemeDetails = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const schemeDetails = schemeData[schemeId] || schemeData.pm_kisan;
      setScheme(schemeDetails);
      setLoading(false);
    }, 500);
  };

  const checkIfSaved = async () => {
    // In real app, check database
    setSaved(false);
  };

  const handleCheckEligibility = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to check eligibility',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    
    // Prepare user data for eligibility check
    const userData = {
      occupation: user.occupation || 'farmer',
      land_ownership: 'yes',
      annual_income: user.annual_income || 100000,
      category: user.category || 'General',
      family_size: user.family_size || 4
    };
    
    const result = checkEligibility(userData, schemeId);
    setEligibilityResult(result);
    setShowEligibilityDialog(true);
  };

  const handleSaveScheme = async () => {
    try {
      // Save to database
      setSaved(!saved);
      Alert.alert(
        saved ? 'Removed' : 'Saved',
        saved ? 'Scheme removed from saved list' : 'Scheme saved for offline access'
      );
    } catch (error) {
      console.error('Error saving scheme:', error);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Check out this government scheme: ${scheme.title}\n\n${scheme.description}\n\nMore info: ${scheme.website}`;
      await Share.share({
        message,
        title: scheme.title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openWebsite = () => {
    if (scheme.website) {
      Linking.openURL(scheme.website);
    }
  };

  const callHelpline = () => {
    if (scheme.helpline) {
      Linking.openURL(`tel:${scheme.helpline}`);
    }
  };

  const copyHelpline = () => {
    if (scheme.helpline) {
      Clipboard.setString(scheme.helpline);
      Alert.alert('Copied', 'Helpline number copied to clipboard');
    }
  };

  if (loading || !scheme) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading scheme details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <View style={styles.schemeIconContainer}>
                <Icon name={scheme.icon} size={30} color="#2196F3" />
              </View>
              <View style={styles.titleTextContainer}>
                <Title style={styles.title}>{scheme.title}</Title>
                <Text style={styles.fullName}>{scheme.fullName}</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <IconButton
                icon={saved ? 'bookmark' : 'bookmark-outline'}
                iconColor={saved ? '#FF9800' : '#666'}
                size={24}
                onPress={handleSaveScheme}
              />
              <IconButton
                icon="share-variant"
                iconColor="#666"
                size={24}
                onPress={handleShare}
              />
            </View>
          </View>
          
          <Chip mode="outlined" style={styles.categoryChip}>
            {scheme.category}
          </Chip>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.description}>{scheme.description}</Text>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleCheckEligibility}
          style={styles.actionButton}
          icon="checkbox-marked-circle"
        >
          Check Eligibility
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Chatbot', { scheme: scheme.title })}
          style={styles.actionButton}
          icon="robot"
        >
          Ask AI Assistant
        </Button>
      </View>

      {/* Benefits Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="gift" size={24} color="#4CAF50" />
            <Title style={styles.sectionTitle}>Benefits</Title>
          </View>
          
          {scheme.benefits.map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Eligibility Criteria */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="account-check" size={24} color="#2196F3" />
            <Title style={styles.sectionTitle}>Eligibility Criteria</Title>
          </View>
          
          {scheme.eligibility.map((criteria, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="checkbox-marked-circle-outline" size={20} color="#2196F3" />
              <Text style={styles.listText}>{criteria}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Required Documents */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="file-document" size={24} color="#FF9800" />
            <Title style={styles.sectionTitle}>Required Documents</Title>
          </View>
          
          {scheme.documents.map((doc, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="file" size={20} color="#FF9800" />
              <Text style={styles.listText}>{doc}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Application Process */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-check" size={24} color="#9C27B0" />
            <Title style={styles.sectionTitle}>How to Apply</Title>
          </View>
          
          {scheme.applicationProcess.map((step, index) => (
            <View key={index} style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Scheme Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitle}>Scheme Information</Title>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="office-building" size={20} color="#666" />
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{scheme.department}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.infoLabel}>Launched</Text>
              <Text style={styles.infoValue}>{scheme.launchYear}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="update" size={20} color="#666" />
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{scheme.lastUpdated}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Contact & Links */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Title style={styles.contactTitle}>Contact & Official Links</Title>
          
          <View style={styles.contactButtons}>
            <Button
              mode="outlined"
              onPress={openWebsite}
              style={styles.contactButton}
              icon="web"
            >
              Official Website
            </Button>
            
            <Button
              mode="outlined"
              onPress={callHelpline}
              style={styles.contactButton}
              icon="phone"
            >
              Call Helpline
            </Button>
            
            <Button
              mode="outlined"
              onPress={copyHelpline}
              style={styles.contactButton}
              icon="content-copy"
            >
              Copy Helpline
            </Button>
          </View>
          
          <Text style={styles.helplineText}>Helpline: {scheme.helpline}</Text>
        </Card.Content>
      </Card>

      {/* Eligibility Result Dialog */}
      <Portal>
        <Dialog
          visible={showEligibilityDialog}
          onDismiss={() => setShowEligibilityDialog(false)}
        >
          <Dialog.Title>
            {eligibilityResult?.eligible ? '🎉 You are Eligible!' : '⚠️ Not Eligible'}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.eligibilityResult}>
              <Icon 
                name={eligibilityResult?.eligible ? "check-circle" : "close-circle"}
                size={50}
                color={eligibilityResult?.eligible ? "#4CAF50" : "#F44336"}
                style={styles.eligibilityIcon}
              />
              
              <Title style={styles.eligibilityTitle}>
                {eligibilityResult?.scheme}
              </Title>
              
              <Text style={styles.eligibilityDescription}>
                {eligibilityResult?.description}
              </Text>
              
              {eligibilityResult?.reasons && eligibilityResult.reasons.length > 0 && (
                <>
                  <Text style={styles.reasonsTitle}>Reasons:</Text>
                  {eligibilityResult.reasons.map((reason, index) => (
                    <View key={index} style={styles.reasonItem}>
                      <Icon name="alert-circle" size={16} color="#FF9800" />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEligibilityDialog(false)}>
              Close
            </Button>
            {eligibilityResult?.eligible && (
              <Button
                mode="contained"
                onPress={() => {
                  setShowEligibilityDialog(false);
                  openWebsite();
                }}
              >
                Apply Now
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
  headerCard: {
    margin: 10,
    elevation: 4,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schemeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  infoCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  contactCard: {
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  contactButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  helplineText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 10,
  },
  eligibilityResult: {
    alignItems: 'center',
  },
  eligibilityIcon: {
    marginBottom: 15,
  },
  eligibilityTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  eligibilityDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reasonText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});