// src/screens/citizen/JobDetail.js
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
  ProgressBar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeSql } from '../../services/database';

const jobData = {
  1: {
    id: 1,
    title: 'Agriculture Development Officer',
    company: 'State Agriculture Department',
    location: 'Rural Areas, Maharashtra',
    salary: '₹25,000 - ₹35,000 per month',
    type: 'Government Job',
    experience: '1-3 years',
    education: 'B.Sc Agriculture or equivalent',
    description: 'Responsible for implementing agricultural development programs, providing technical guidance to farmers, and monitoring field activities.',
    responsibilities: [
      'Implement government agriculture schemes',
      'Conduct farmer training programs',
      'Monitor crop health and suggest improvements',
      'Collect field data and prepare reports',
      'Coordinate with local authorities'
    ],
    requirements: [
      'B.Sc in Agriculture or related field',
      'Knowledge of local farming practices',
      'Valid driving license',
      'Good communication skills',
      'Willingness to work in rural areas'
    ],
    benefits: [
      'Government pension benefits',
      'Health insurance',
      'Travel allowance',
      'Accommodation in rural areas',
      'Career growth opportunities'
    ],
    applyUrl: 'https://maharashtra.gov.in/jobs',
    contactEmail: 'recruitment@agri.maharashtra.gov.in',
    contactPhone: '022-23456789',
    deadline: '2024-02-28',
    postedDate: '2024-01-15',
    category: 'Agriculture',
    icon: 'sprout'
  },
  2: {
    id: 2,
    title: 'Rural Health Worker',
    company: 'National Health Mission',
    location: 'Primary Health Centers, Gujarat',
    salary: '₹18,000 - ₹25,000 per month',
    type: 'Contract Basis',
    experience: 'Freshers welcome',
    education: '12th Pass with ANM/GNM certification',
    description: 'Provide basic healthcare services in rural areas, conduct health camps, and assist in immunization programs.',
    responsibilities: [
      'Provide first aid and basic treatment',
      'Conduct health awareness camps',
      'Assist in vaccination drives',
      'Maintain health records',
      'Refer patients to hospitals when needed'
    ],
    requirements: [
      'ANM/GNM certification',
      'Basic computer knowledge',
      'Good health and fitness',
      'Patience and empathy',
      'Knowledge of local language'
    ],
    benefits: [
      'Training provided',
      'Performance incentives',
      'Health coverage',
      'Flexible working hours',
      'Community service recognition'
    ],
    applyUrl: 'https://nhm.gov.in/careers',
    contactEmail: 'nhm.recruitment@gujarat.gov.in',
    contactPhone: '079-26543210',
    deadline: '2024-03-15',
    postedDate: '2024-01-20',
    category: 'Healthcare',
    icon: 'hospital-box'
  },
  3: {
    id: 3,
    title: 'Village Development Officer',
    company: 'Rural Development Department',
    location: 'Various Villages, Rajasthan',
    salary: '₹30,000 - ₹40,000 per month',
    type: 'Permanent Position',
    experience: '2-5 years',
    education: 'Graduate in any discipline',
    description: 'Coordinate rural development activities, implement government schemes, and work closely with village panchayats.',
    responsibilities: [
      'Implement rural development schemes',
      'Coordinate with panchayat members',
      'Monitor infrastructure projects',
      'Conduct surveys and collect data',
      'Facilitate community meetings'
    ],
    requirements: [
      'Graduate in any discipline',
      'Experience in rural development',
      'Knowledge of government schemes',
      'Leadership skills',
      'Fluency in local language'
    ],
    benefits: [
      'Government accommodation',
      'Vehicle allowance',
      'Medical benefits',
      'Leave travel concession',
      'Pension benefits'
    ],
    applyUrl: 'https://rajasthan.gov.in/jobs',
    contactEmail: 'rdd.recruitment@rajasthan.gov.in',
    contactPhone: '0141-25678901',
    deadline: '2024-03-10',
    postedDate: '2024-01-18',
    category: 'Government',
    icon: 'office-building'
  }
};

export default function JobDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { jobId } = route.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    resume: null,
    coverLetter: ''
  });

  useEffect(() => {
    loadJobDetails();
    checkApplicationStatus();
    checkIfSaved();
  }, [jobId]);

  const loadJobDetails = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const jobDetails = jobData[jobId] || jobData[1];
      setJob(jobDetails);
      setLoading(false);
    }, 500);
  };

  const checkApplicationStatus = async () => {
    try {
      const appliedJobs = await AsyncStorage.getItem('applied_jobs');
      if (appliedJobs) {
        const appliedJobsArray = JSON.parse(appliedJobs);
        setApplied(appliedJobsArray.includes(jobId));
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedJobs = await AsyncStorage.getItem('saved_jobs');
      if (savedJobs) {
        const savedJobsArray = JSON.parse(savedJobs);
        setSaved(savedJobsArray.includes(jobId));
      }
    } catch (error) {
      console.error('Error checking saved jobs:', error);
    }
  };

  const handleSaveJob = async () => {
    try {
      let savedJobs = await AsyncStorage.getItem('saved_jobs');
      let savedJobsArray = savedJobs ? JSON.parse(savedJobs) : [];
      
      if (saved) {
        savedJobsArray = savedJobsArray.filter(id => id !== jobId);
        await executeSql('UPDATE jobs SET saved = 0 WHERE id = ?', [jobId]);
      } else {
        savedJobsArray.push(jobId);
        await executeSql('UPDATE jobs SET saved = 1 WHERE id = ?', [jobId]);
      }
      
      await AsyncStorage.setItem('saved_jobs', JSON.stringify(savedJobsArray));
      setSaved(!saved);
      
      Alert.alert(
        saved ? 'Removed' : 'Saved',
        saved ? 'Job removed from saved list' : 'Job saved for later'
      );
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Error', 'Failed to save job');
    }
  };

  const handleShareJob = async () => {
    try {
      const message = `Check out this job opportunity: ${job.title}\n\nCompany: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}\n\nApply here: ${job.applyUrl}`;
      
      await Share.share({
        message,
        title: `Job Opportunity: ${job.title}`
      });
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };

  const startApplication = () => {
    if (applied) {
      Alert.alert(
        'Already Applied',
        'You have already applied for this position.'
      );
      return;
    }
    setShowApplyDialog(true);
    setApplicationStep(1);
    setApplicationProgress(0.25);
  };

  const handleApplicationSubmit = async () => {
    // Validate application data
    if (!applicationData.name || !applicationData.email || !applicationData.phone) {
      Alert.alert('Incomplete Application', 'Please fill in all required fields');
      return;
    }

    // Simulate application submission
    setTimeout(async () => {
      try {
        // Save application to database
        await executeSql(
          `INSERT INTO job_applications (job_id, name, email, phone, experience, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [jobId, applicationData.name, applicationData.email, applicationData.phone, 
           applicationData.experience, 'submitted']
        );

        // Mark job as applied
        let appliedJobs = await AsyncStorage.getItem('applied_jobs');
        let appliedJobsArray = appliedJobs ? JSON.parse(appliedJobs) : [];
        appliedJobsArray.push(jobId);
        await AsyncStorage.setItem('applied_jobs', JSON.stringify(appliedJobsArray));

        setApplied(true);
        setShowApplyDialog(false);
        
        Alert.alert(
          'Application Submitted!',
          'Your application has been submitted successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Jobs')
            }
          ]
        );
      } catch (error) {
        console.error('Error submitting application:', error);
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    }, 2000);
  };

  const calculateDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const openWebsite = () => {
    if (job?.applyUrl) {
      Linking.openURL(job.applyUrl);
    }
  };

  const callContact = () => {
    if (job?.contactPhone) {
      Linking.openURL(`tel:${job.contactPhone}`);
    }
  };

  const copyEmail = () => {
    if (job?.contactEmail) {
      Clipboard.setString(job.contactEmail);
      Alert.alert('Copied', 'Email address copied to clipboard');
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading job details...</Text>
      </View>
    );
  }

  const daysLeft = calculateDaysLeft(job.deadline);
  const isDeadlineNear = daysLeft <= 7;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <View style={[styles.jobIcon, { backgroundColor: '#E3F2FD' }]}>
                <Icon name={job.icon} size={24} color="#2196F3" />
              </View>
              <View style={styles.titleTextContainer}>
                <Title style={styles.title}>{job.title}</Title>
                <Text style={styles.company}>{job.company}</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <IconButton
                icon={saved ? 'bookmark' : 'bookmark-outline'}
                iconColor={saved ? '#FF9800' : '#666'}
                size={24}
                onPress={handleSaveJob}
              />
              <IconButton
                icon="share-variant"
                iconColor="#666"
                size={24}
                onPress={handleShareJob}
              />
            </View>
          </View>
          
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="currency-inr" size={16} color="#666" />
              <Text style={styles.metaText}>{job.salary}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Quick Apply Button */}
          <Button
            mode="contained"
            onPress={startApplication}
            style={styles.applyButton}
            icon={applied ? "check-circle" : "send"}
            disabled={applied}
          >
            {applied ? 'Already Applied' : 'Apply Now'}
          </Button>
        </Card.Content>
      </Card>

      {/* Job Status Card */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Job Type</Text>
              <Chip mode="outlined" style={styles.statusChip}>
                {job.type}
              </Chip>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Experience</Text>
              <Chip mode="outlined" style={styles.statusChip}>
                {job.experience}
              </Chip>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Deadline</Text>
              <Chip 
                mode="outlined" 
                style={[
                  styles.statusChip, 
                  isDeadlineNear && styles.urgentChip
                ]}
                icon={isDeadlineNear ? "alert-circle" : "calendar"}
              >
                {daysLeft} days left
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Job Description */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="file-document" size={20} color="#2196F3" />
            <Text style={{ marginLeft: 10 }}>Job Description</Text>
          </Title>
          
          <Text style={styles.description}>{job.description}</Text>
        </Card.Content>
      </Card>

      {/* Responsibilities */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="clipboard-check" size={20} color="#4CAF50" />
            <Text style={{ marginLeft: 10 }}>Key Responsibilities</Text>
          </Title>
          
          {job.responsibilities.map((responsibility, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="checkbox-marked-circle-outline" size={20} color="#4CAF50" />
              <Text style={styles.listText}>{responsibility}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Requirements */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="account-check" size={20} color="#FF9800" />
            <Text style={{ marginLeft: 10 }}>Requirements</Text>
          </Title>
          
          {job.requirements.map((requirement, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="check" size={20} color="#FF9800" />
              <Text style={styles.listText}>{requirement}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Benefits */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="gift" size={20} color="#9C27B0" />
            <Text style={{ marginLeft: 10 }}>Benefits & Perks</Text>
          </Title>
          
          {job.benefits.map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="star-circle" size={20} color="#9C27B0" />
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="phone" size={20} color="#F44336" />
            <Text style={{ marginLeft: 10 }}>Contact Information</Text>
          </Title>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color="#666" />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{job.contactEmail}</Text>
              </View>
              <Button
                mode="text"
                onPress={copyEmail}
                icon="content-copy"
                compact
              >
                Copy
              </Button>
            </View>
            
            <Divider style={styles.contactDivider} />
            
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#666" />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{job.contactPhone}</Text>
              </View>
              <Button
                mode="text"
                onPress={callContact}
                icon="phone"
                compact
              >
                Call
              </Button>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Button
            mode="outlined"
            onPress={openWebsite}
            style={styles.websiteButton}
            icon="web"
          >
            Visit Official Website
          </Button>
        </Card.Content>
      </Card>

      {/* Application Dialog */}
      <Portal>
        <Dialog
          visible={showApplyDialog}
          onDismiss={() => setShowApplyDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            Apply for {job.title}
          </Dialog.Title>
          
          <Dialog.Content>
            {/* Application Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {applicationStep} of 4
              </Text>
              <ProgressBar 
                progress={applicationProgress} 
                style={styles.progressBar}
                color="#2196F3"
              />
            </View>
            
            {/* Step 1: Personal Information */}
            {applicationStep === 1 && (
              <View style={styles.applicationStep}>
                <Text style={styles.stepTitle}>Personal Information</Text>
                
                <TextInput
                  label="Full Name *"
                  value={applicationData.name}
                  onChangeText={(text) => setApplicationData({...applicationData, name: text})}
                  style={styles.applicationInput}
                  mode="outlined"
                />
                
                <TextInput
                  label="Email Address *"
                  value={applicationData.email}
                  onChangeText={(text) => setApplicationData({...applicationData, email: text})}
                  style={styles.applicationInput}
                  mode="outlined"
                  keyboardType="email-address"
                />
                
                <TextInput
                  label="Phone Number *"
                  value={applicationData.phone}
                  onChangeText={(text) => setApplicationData({...applicationData, phone: text})}
                  style={styles.applicationInput}
                  mode="outlined"
                  keyboardType="phone-pad"
                />
              </View>
            )}
            
            {/* Step 2: Experience */}
            {applicationStep === 2 && (
              <View style={styles.applicationStep}>
                <Text style={styles.stepTitle}>Experience Details</Text>
                
                <TextInput
                  label="Years of Experience"
                  value={applicationData.experience}
                  onChangeText={(text) => setApplicationData({...applicationData, experience: text})}
                  style={styles.applicationInput}
                  mode="outlined"
                  keyboardType="numeric"
                />
                
                <Text style={styles.stepHint}>
                  Please mention your relevant experience for this position
                </Text>
              </View>
            )}
            
            {/* Step 3: Documents */}
            {applicationStep === 3 && (
              <View style={styles.applicationStep}>
                <Text style={styles.stepTitle}>Upload Documents</Text>
                
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Upload', 'Select resume file')}
                  style={styles.uploadButton}
                  icon="file-upload"
                >
                  Upload Resume (PDF/DOC)
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Upload', 'Select cover letter')}
                  style={styles.uploadButton}
                  icon="file-document"
                >
                  Upload Cover Letter
                </Button>
                
                <Text style={styles.stepHint}>
                  Max file size: 5MB each
                </Text>
              </View>
            )}
            
            {/* Step 4: Review */}
            {applicationStep === 4 && (
              <View style={styles.applicationStep}>
                <Text style={styles.stepTitle}>Review Application</Text>
                
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Name:</Text>
                  <Text style={styles.reviewValue}>{applicationData.name}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Email:</Text>
                  <Text style={styles.reviewValue}>{applicationData.email}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Phone:</Text>
                  <Text style={styles.reviewValue}>{applicationData.phone}</Text>
                </View>
                
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Experience:</Text>
                  <Text style={styles.reviewValue}>
                    {applicationData.experience || 'Not specified'}
                  </Text>
                </View>
                
                <Text style={styles.reviewNote}>
                  By submitting, you agree to share your information with {job.company}
                </Text>
              </View>
            )}
          </Dialog.Content>
          
          <Dialog.Actions>
            {applicationStep > 1 && (
              <Button
                onPress={() => {
                  setApplicationStep(applicationStep - 1);
                  setApplicationProgress(applicationProgress - 0.25);
                }}
              >
                Back
              </Button>
            )}
            
            {applicationStep < 4 ? (
              <Button
                mode="contained"
                onPress={() => {
                  setApplicationStep(applicationStep + 1);
                  setApplicationProgress(applicationProgress + 0.25);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleApplicationSubmit}
              >
                Submit Application
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

// Import TextInput
import { TextInput } from 'react-native';

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
  jobIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  company: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 15,
  },
  applyButton: {
    marginTop: 10,
  },
  statusCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusItem: {
    width: '30%',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'center',
  },
  urgentChip: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
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
  contactCard: {
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
    borderRadius: 8,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactDetails: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  contactDivider: {
    marginHorizontal: 0,
  },
  websiteButton: {
    marginTop: 10,
  },
  dialog: {
    borderRadius: 12,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  applicationStep: {
    minHeight: 200,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  applicationInput: {
    marginBottom: 15,
  },
  stepHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  uploadButton: {
    marginBottom: 10,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    width: 100,
  },
  reviewValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  reviewNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});