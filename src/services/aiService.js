// src/services/aiService.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

// Simple rule-based eligibility checker for Indian government schemes
const SCHEME_RULES = {
  'pm_kisan': {
    name: 'PM-KISAN Scheme',
    description: 'Financial assistance to farmers',
    rules: [
      { field: 'occupation', value: 'farmer', required: true },
      { field: 'land_ownership', value: 'yes', required: true },
      { field: 'annual_income', max: 150000 }
    ]
  },
  'pm_awas_yojana': {
    name: 'Pradhan Mantri Awas Yojana',
    description: 'Housing for all',
    rules: [
      { field: 'annual_income', max: 300000 },
      { field: 'own_house', value: 'no', required: true },
      { field: 'family_size', min: 3 }
    ]
  },
  'ayushman_bharat': {
    name: 'Ayushman Bharat Yojana',
    description: 'Health insurance scheme',
    rules: [
      { field: 'annual_income', max: 500000 },
      { field: 'category', values: ['SC', 'ST', 'OBC', 'EWS'], required: true }
    ]
  }
};

export const checkEligibility = (userData, schemeId) => {
  const scheme = SCHEME_RULES[schemeId];
  if (!scheme) {
    return { eligible: false, reason: 'Scheme not found' };
  }

  const reasons = [];
  let eligible = true;

  scheme.rules.forEach(rule => {
    const userValue = userData[rule.field];
    
    if (rule.required && !userValue) {
      eligible = false;
      reasons.push(`${rule.field} is required`);
      return;
    }

    if (rule.value && userValue !== rule.value) {
      eligible = false;
      reasons.push(`${rule.field} must be ${rule.value}`);
    }

    if (rule.values && !rule.values.includes(userValue)) {
      eligible = false;
      reasons.push(`${rule.field} must be one of: ${rule.values.join(', ')}`);
    }

    if (rule.max !== undefined && userValue > rule.max) {
      eligible = false;
      reasons.push(`Annual income must be less than ₹${rule.max}`);
    }

    if (rule.min !== undefined && userValue < rule.min) {
      eligible = false;
      reasons.push(`Family size must be at least ${rule.min}`);
    }
  });

  return {
    eligible,
    reasons,
    scheme: scheme.name,
    description: scheme.description
  };
};

export const getChatResponse = async (message, userContext) => {
  // Simple keyword matching for chatbot
  const keywords = {
    'eligible': 'eligibility',
    'scheme': 'schemes',
    'apply': 'application',
    'document': 'documents',
    'benefit': 'benefits',
    'income': 'income_criteria'
  };

  const lowerMessage = message.toLowerCase();
  let response = "I can help you check eligibility for government schemes. " +
                 "Please provide information about your occupation, annual income, and category.";

  // Simple response logic
  if (lowerMessage.includes('farmer')) {
    response = "For farmers, you may be eligible for PM-KISAN scheme. " +
               "Do you own agricultural land?";
  } else if (lowerMessage.includes('house')) {
    response = "For housing, check Pradhan Mantri Awas Yojana. " +
               "What is your annual family income?";
  } else if (lowerMessage.includes('health')) {
    response = "For health insurance, check Ayushman Bharat. " +
               "Are you from SC/ST/OBC/EWS category?";
  }

  return response;
};

// Initialize TensorFlow for future ML enhancements
export const initTF = async () => {
  try {
    await tf.ready();
    console.log('TensorFlow.js ready');
    
    // Load a simple model (placeholder for future ML model)
    const modelJson = require('../assets/model/model.json');
    const modelWeights = require('../assets/model/weights.bin');
    
    const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    return model;
  } catch (error) {
    console.error('TensorFlow initialization error:', error);
    return null;
  }
};