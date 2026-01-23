// src/screens/citizen/EligibilityChecker.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  RadioButton,
  Divider,
  Chip,
  ActivityIndicator,
  Dialog,
  Portal,
  HelperText
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { checkEligibility, getChatResponse } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

const schemesList = [
  {
    id: 'pm_kisan',
    title: 'PM-KISAN Scheme',
    icon: 'sprout',
    color: '#4CAF50',
    description: 'Financial assistance to farmers'
  },
  {
    id: 'pm_awas_yojana',
    title: 'Pradhan Mantri Awas Yojana',
    icon: 'home',
    color: '#2196F3',
    description: 'Housing for all'
  },
  {
    id: 'ayushman_bharat',
    title: 'Ayushman Bharat Yojana',
    icon: 'hospital-box',
    color: '#F44336',
    description: 'Health insurance scheme'
  },
  {
    id: 'mnrega',
    title: 'MGNREGA',
    icon: 'account-hard-hat',
    color: '#FF9800',
    description: 'Employment guarantee'
  },
  {
    id: 'pm_matru_vandana',
    title: 'PM Matru Vandana Yojana',
    icon: 'baby-face-outline',
    color: '#9C27B0',
    description: 'Maternity benefit'
  },
  {
    id: 'pm_ujwala',
    title: 'PM Ujjwala Yojana',
    icon: 'fire',
    color: '#FF5722',
    description: 'LPG connection for women'
  }
];

const occupations = [
  'Farmer',
  'Daily Wage Worker',
  'Small Business Owner',
  'Government Employee',
  'Private Employee',
  'Housewife',
  'Student',
  'Unemployed'
];

const categories = [
  'General',
  'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)',
  'OBC (Other Backward Class)',
  'EWS (Economically Weaker Section)'
];

export default function EligibilityChecker() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    occupation: '',
    annualIncome: '',
    familySize: '',
    category: '',
    landOwnership: 'no',
    ownsHouse: 'no',
    isMarried: 'no',
    hasDisability: 'no',
    education: '',
    gender: 'male'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleCheckEligibility = () => {
    if (!selectedScheme) {
      Alert.alert('Select Scheme', 'Please select a scheme to check eligibility');
      return;
    }

    if (!formData.occupation || !formData.annualIncome) {
      Alert.alert('Incomplete Information', 'Please fill in your occupation and annual income');
      return;
    }

    setLoading(true);
    
    // Simulate API processing
    setTimeout(() => {
      const result = checkEligibility(formData, selectedScheme.id);
      setEligibilityResult(result);
      setShowResultDialog(true);
      setLoading(false);
    }, 1500);
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    // Add user message to history
    const newHistory = [...chatHistory, { type: 'user', text: userMessage }];
    setChatHistory(newHistory);

    try {
      const aiResponse = await getChatResponse(userMessage, formData);
      
      // Add AI response to history
      setChatHistory([
        ...newHistory,
        { type: 'ai', text: aiResponse }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory([
        ...newHistory,
        { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderSchemeCard = (scheme) => (
    <TouchableWithoutFeedback
      key={scheme.id}
      onPress={() => setSelectedScheme(scheme)}
    >
      <Card style={[
        styles.schemeCard,
        selectedScheme?.id === scheme.id && styles.selectedSchemeCard
      ]}>
        <Card.Content style={styles.schemeContent}>
          <View style={[styles.schemeIcon, { backgroundColor: scheme.color }]}>
            <Icon name={scheme.icon} size={24} color="white" />
          </View>
          <View style={styles.schemeInfo}>
            <Text style={styles.schemeTitle}>{scheme.title}</Text>
            <Text style={styles.schemeDescription}>{scheme.description}</Text>
          </View>
          {selectedScheme?.id === scheme.id && (
            <Icon name="check-circle" size={24} color={scheme.color} />
          )}
        </Card.Content>
      </Card>
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerIcon}>
              <Icon name="robot" size={40} color="#2196F3" />
            </View>
            <Title style={styles.headerTitle}>AI Eligibility Checker</Title>
            <Text style={styles.headerSubtitle}>
              Check your eligibility for various government schemes using AI
            </Text>
          </Card.Content>
        </Card>

        {/* Select Scheme */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="file-document" size={20} color="#2196F3" />
              <Text style={{ marginLeft: 10 }}>Select Scheme</Text>
            </Title>
            <Text style={styles.sectionDescription}>
              Choose a government scheme to check eligibility
            </Text>
            
            <View style={styles.schemesGrid}>
              {schemesList.map(renderSchemeCard)}
            </View>
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="account" size={20} color="#4CAF50" />
              <Text style={{ marginLeft: 10 }}>Personal Information</Text>
            </Title>
            
            <View style={styles.formRow}>
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
              
              <TextInput
                label="Age"
                value={formData.age}
                onChangeText={(text) => setFormData({...formData, age: text})}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
            </View>

            <TextInput
              label="Occupation"
              value={formData.occupation}
              onChangeText={(text) => setFormData({...formData, occupation: text})}
              style={styles.input}
              mode="outlined"
              right={<TextInput.Icon icon="chevron-down" />}
            />

            <TextInput
              label="Annual Income (₹)"
              value={formData.annualIncome}
              onChangeText={(text) => setFormData({...formData, annualIncome: text})}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="currency-inr" />}
            />

            <TextInput
              label="Family Size"
              value={formData.familySize}
              onChangeText={(text) => setFormData({...formData, familySize: text})}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Additional Details */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="clipboard-list" size={20} color="#FF9800" />
              <Text style={{ marginLeft: 10 }}>Additional Details</Text>
            </Title>

            <Text style={styles.radioGroupLabel}>Category:</Text>
            <RadioButton.Group
              value={formData.category}
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <View style={styles.radioGroup}>
                {categories.map((cat) => (
                  <View key={cat} style={styles.radioOption}>
                    <RadioButton value={cat.toLowerCase()} />
                    <Text>{cat}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            <Divider style={styles.divider} />

            <Text style={styles.radioGroupLabel}>Do you own agricultural land?</Text>
            <RadioButton.Group
              value={formData.landOwnership}
              onValueChange={(value) => setFormData({...formData, landOwnership: value})}
            >
              <View style={styles.radioGroup}>
                <View style={styles.radioOption}>
                  <RadioButton value="yes" />
                  <Text>Yes</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="no" />
                  <Text>No</Text>
                </View>
              </View>
            </RadioButton.Group>

            <Divider style={styles.divider} />

            <Text style={styles.radioGroupLabel}>Do you own a house?</Text>
            <RadioButton.Group
              value={formData.ownsHouse}
              onValueChange={(value) => setFormData({...formData, ownsHouse: value})}
            >
              <View style={styles.radioGroup}>
                <View style={styles.radioOption}>
                  <RadioButton value="yes" />
                  <Text>Yes</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="no" />
                  <Text>No</Text>
                </View>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* AI Chat Assistant */}
        <Card style={styles.chatCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              <Icon name="robot-happy" size={20} color="#9C27B0" />
              <Text style={{ marginLeft: 10 }}>AI Assistant</Text>
            </Title>
            <Text style={styles.sectionDescription}>
              Ask questions about schemes and eligibility
            </Text>

            {/* Chat History */}
            <View style={styles.chatContainer}>
              {chatHistory.length === 0 ? (
                <View style={styles.emptyChat}>
                  <Icon name="robot" size={40} color="#bdbdbd" />
                  <Text style={styles.emptyChatText}>
                    Ask me anything about government schemes!
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.chatHistory}>
                  {chatHistory.map((message, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chatMessage,
                        message.type === 'user' ? styles.userMessage : styles.aiMessage
                      ]}
                    >
                      <View style={styles.chatAvatar}>
                        <Icon
                          name={message.type === 'user' ? 'account' : 'robot'}
                          size={20}
                          color="white"
                        />
                      </View>
                      <View style={styles.chatBubble}>
                        <Text style={styles.chatText}>{message.text}</Text>
                      </View>
                    </View>
                  ))}
                  {chatLoading && (
                    <View style={styles.aiMessage}>
                      <View style={styles.chatAvatar}>
                        <Icon name="robot" size={20} color="white" />
                      </View>
                      <View style={styles.chatBubble}>
                        <ActivityIndicator size="small" color="#666" />
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Chat Input */}
              <View style={styles.chatInputContainer}>
                <TextInput
                  placeholder="Ask about schemes, eligibility, documents..."
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  style={styles.chatInput}
                  mode="outlined"
                  multiline
                  disabled={chatLoading}
                />
                <Button
                  mode="contained"
                  onPress={handleChatSubmit}
                  loading={chatLoading}
                  disabled={chatLoading || !chatMessage.trim()}
                  style={styles.chatButton}
                  icon="send"
                >
                  Send
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Check Eligibility Button */}
        <Button
          mode="contained"
          onPress={handleCheckEligibility}
          loading={loading}
          disabled={loading || !selectedScheme}
          style={styles.checkButton}
          icon="checkbox-marked-circle"
        >
          Check Eligibility
        </Button>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Title style={styles.tipsTitle}>
              <Icon name="lightbulb" size={20} color="#FFD600" />
              <Text style={{ marginLeft: 10 }}>Tips for Better Results</Text>
            </Title>
            
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Provide accurate income details</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Select correct category</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Update family size accurately</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Mention disabilities if any</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Eligibility Result Dialog */}
      <Portal>
        <Dialog
          visible={showResultDialog}
          onDismiss={() => setShowResultDialog(false)}
          style={styles.resultDialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {eligibilityResult?.eligible ? (
              <View style={styles.successHeader}>
                <Icon name="party-popper" size={30} color="#4CAF50" />
                <Text style={styles.successTitle}>You are Eligible!</Text>
              </View>
            ) : (
              <View style={styles.errorHeader}>
                <Icon name="alert-circle" size={30} color="#F44336" />
                <Text style={styles.errorTitle}>Not Eligible</Text>
              </View>
            )}
          </Dialog.Title>
          
          <Dialog.Content>
            {eligibilityResult && (
              <View style={styles.resultContent}>
                <View style={styles.resultScheme}>
                  <Icon 
                    name={schemesList.find(s => s.id === selectedScheme?.id)?.icon || 'file-document'}
                    size={40}
                    color={schemesList.find(s => s.id === selectedScheme?.id)?.color || '#2196F3'}
                  />
                  <Text style={styles.resultSchemeTitle}>
                    {selectedScheme?.title}
                  </Text>
                </View>
                
                <Text style={styles.resultDescription}>
                  {eligibilityResult.description}
                </Text>
                
                {eligibilityResult.reasons && eligibilityResult.reasons.length > 0 && (
                  <>
                    <Divider style={styles.resultDivider} />
                    
                    <Text style={styles.reasonsTitle}>
                      {eligibilityResult.eligible ? 'Requirements:' : 'Reasons:'}
                    </Text>
                    
                    {eligibilityResult.reasons.map((reason, index) => (
                      <View key={index} style={styles.reasonItem}>
                        <Icon
                          name={eligibilityResult.eligible ? 'check-circle' : 'close-circle'}
                          size={20}
                          color={eligibilityResult.eligible ? '#4CAF50' : '#F44336'}
                        />
                        <Text style={styles.reasonText}>{reason}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                <Divider style={styles.resultDivider} />
                
                <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                <View style={styles.nextStep}>
                  <Icon name="file-document" size={20} color="#2196F3" />
                  <Text style={styles.nextStepText}>
                    Gather required documents
                  </Text>
                </View>
                <View style={styles.nextStep}>
                  <Icon name="office-building" size={20} color="#2196F3" />
                  <Text style={styles.nextStepText}>
                    Visit nearest government office or CSC
                  </Text>
                </View>
                <View style={styles.nextStep}>
                  <Icon name="web" size={20} color="#2196F3" />
                  <Text style={styles.nextStepText}>
                    Apply online through official portal
                  </Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setShowResultDialog(false)}>
              Close
            </Button>
            {eligibilityResult?.eligible && (
              <Button
                mode="contained"
                onPress={() => {
                  setShowResultDialog(false);
                  navigation.navigate('SchemeDetail', { schemeId: selectedScheme.id });
                }}
              >
                View Scheme Details
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
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
    backgroundColor: '#E3F2FD',
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
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
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDescription: {
    color: '#666',
    marginBottom: 15,
    fontSize: 14,
  },
  schemesGrid: {
    marginTop: 10,
  },
  schemeCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSchemeCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#E3F2FD',
  },
  schemeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  radioGroupLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginVertical: 4,
  },
  divider: {
    marginVertical: 15,
  },
  chatCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
  },
  chatContainer: {
    height: 300,
    marginTop: 10,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChatText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  chatHistory: {
    flex: 1,
    padding: 10,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  // Fix the problematic styles
'userMessage.chatBubble': {
  backgroundColor: '#2196F3',
},
'userMessage.chatText': {
  color: 'white',
},
  chatText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  chatInput: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
  },
  chatButton: {
    minWidth: 60,
  },
  checkButton: {
    marginHorizontal: 10,
    marginVertical: 20,
    paddingVertical: 8,
  },
  tipsCard: {
    marginHorizontal: 10,
    marginBottom: 30,
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#FFFDE7',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#FF8F00',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  resultDialog: {
    borderRadius: 12,
  },
  dialogTitle: {
    padding: 0,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 10,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 10,
  },
  resultContent: {
    padding: 10,
  },
  resultScheme: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultSchemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  resultDescription: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  resultDivider: {
    marginVertical: 15,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextStepText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});