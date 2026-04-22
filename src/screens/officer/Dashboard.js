// src/screens/officer/Dashboard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function OfficerDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Officer Dashboard</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('OfficerComplaints')}
      >
        View Complaints
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});