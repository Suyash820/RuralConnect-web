// src/screens/officer/Reports.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Share
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  SegmentedButtons,
  ActivityIndicator,
  Divider,
  Chip,
  Menu,
  Portal
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { executeSql } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function Reports() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [reportData, setReportData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Calculate date ranges
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Load complaint statistics
      const statsResult = await executeSql(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
        FROM complaints
        WHERE assigned_to = ? AND created_at >= ?`,
        [user?.id, startDate.toISOString()]
      );

      // Load category breakdown
      const categoryResult = await executeSql(
        `SELECT 
          category,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE assigned_to = ? AND created_at >= ?), 1) as percentage
        FROM complaints
        WHERE assigned_to = ? AND created_at >= ?
        GROUP BY category
        ORDER BY count DESC`,
        [user?.id, startDate.toISOString(), user?.id, startDate.toISOString()]
      );

      // Load resolution time data
      const resolutionResult = await executeSql(
        `SELECT 
          status,
          AVG(julianday('now') - julianday(created_at)) as avg_days
        FROM complaints
        WHERE assigned_to = ? AND status IN ('resolved', 'rejected')
        GROUP BY status`,
        [user?.id]
      );

      setReportData({
        stats: statsResult.rows._array[0],
        categories: categoryResult.rows._array,
        resolution: resolutionResult.rows._array,
        period: getPeriodLabel(timeRange),
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (range) => {
    const now = new Date();
    switch (range) {
      case 'today':
        return `Today (${now.toLocaleDateString()})`;
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last Month';
      case 'year':
        return 'Last Year';
      default:
        return 'Last 7 Days';
    }
  };

  const generateReport = async (format) => {
    setGeneratingReport(true);
    try {
      const reportContent = generateReportContent(format);
      
      if (format === 'csv') {
        const csvContent = generateCSV();
        const fileUri = `${FileSystem.documentDirectory}officer_report_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Report as CSV',
          });
        } else {
          Alert.alert('Sharing not available', 'Cannot share file on this device');
        }
      } else {
        // For PDF, we would use a PDF generation library
        Alert.alert('PDF Export', 'PDF export would be implemented with a PDF library');
      }
      
      Alert.alert('Success', `Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
      setShowExportMenu(false);
    }
  };

  const generateCSV = () => {
    let csv = 'Officer Performance Report\n\n';
    csv += `Period: ${reportData.period}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Statistics
    csv += 'Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Complaints,${reportData.stats.total}\n`;
    csv += `Pending,${reportData.stats.pending}\n`;
    csv += `In Progress,${reportData.stats.in_progress}\n`;
    csv += `Resolved,${reportData.stats.resolved}\n`;
    csv += `Rejected,${reportData.stats.rejected}\n`;
    csv += `High Priority,${reportData.stats.high_priority}\n`;
    csv += `Medium Priority,${reportData.stats.medium_priority}\n`;
    csv += `Low Priority,${reportData.stats.low_priority}\n\n`;
    
    // Categories
    csv += 'Category Breakdown\n';
    csv += 'Category,Count,Percentage\n';
    reportData.categories.forEach(cat => {
      csv += `${cat.category},${cat.count},${cat.percentage}%\n`;
    });
    
    return csv;
  };

  const generateReportContent = (format) => {
    // This would generate the actual report content
    return `Report for Officer ${user?.name}`;
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getResolutionTime = () => {
    const resolved = reportData.resolution.find(r => r.status === 'resolved');
    if (!resolved || !resolved.avg_days) return 'N/A';
    return `${Math.round(resolved.avg_days)} days`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading report data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Officer Reports</Title>
        <Text style={styles.headerSubtitle}>
          Performance analytics and insights
        </Text>
      </View>

      {/* Time Range Selector */}
      <Card style={styles.controlCard}>
        <Card.Content>
          <Text style={styles.sectionLabel}>Select Time Period:</Text>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'today', label: 'Today', icon: 'calendar-today' },
              { value: 'week', label: 'Week', icon: 'calendar-week' },
              { value: 'month', label: 'Month', icon: 'calendar-month' },
              { value: 'year', label: 'Year', icon: 'calendar' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      {/* Export Button */}
      <Card style={styles.exportCard}>
        <Card.Content style={styles.exportContent}>
          <View>
            <Text style={styles.periodText}>{reportData.period}</Text>
            <Text style={styles.generatedText}>
              Generated: {new Date().toLocaleDateString()}
            </Text>
          </View>
          
          <Portal>
            <Menu
              visible={showExportMenu}
              onDismiss={() => setShowExportMenu(false)}
              anchor={{ x: 0, y: 0 }}
            >
              <Menu.Item
                onPress={() => generateReport('csv')}
                title="Export as CSV"
                leadingIcon="file-delimited"
                disabled={generatingReport}
              />
              <Menu.Item
                onPress={() => generateReport('pdf')}
                title="Export as PDF"
                leadingIcon="file-pdf-box"
                disabled={generatingReport}
              />
            </Menu>
          </Portal>
          
          <Button
            mode="contained"
            onPress={() => setShowExportMenu(true)}
            loading={generatingReport}
            disabled={generatingReport}
            icon="export"
          >
            Export Report
          </Button>
        </Card.Content>
      </Card>

      {/* Summary Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Summary Statistics</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reportData.stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statSubtitle}>Complaints</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                {reportData.stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statSubtitle}>
                {getPercentage(reportData.stats.pending, reportData.stats.total)}%
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>
                {reportData.stats.in_progress}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
              <Text style={styles.statSubtitle}>
                {getPercentage(reportData.stats.in_progress, reportData.stats.total)}%
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {reportData.stats.resolved}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
              <Text style={styles.statSubtitle}>
                {getPercentage(reportData.stats.resolved, reportData.stats.total)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Priority Breakdown */}
      <Card style={styles.priorityCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Priority Breakdown</Title>
          <View style={styles.priorityBars}>
            <View style={styles.priorityBar}>
              <View style={styles.barLabel}>
                <Icon name="flag" size={16} color="#F44336" />
                <Text style={styles.barText}>High</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(reportData.stats.high_priority, reportData.stats.total)}%`,
                      backgroundColor: '#F44336'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>{reportData.stats.high_priority}</Text>
            </View>
            
            <View style={styles.priorityBar}>
              <View style={styles.barLabel}>
                <Icon name="flag" size={16} color="#FF9800" />
                <Text style={styles.barText}>Medium</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(reportData.stats.medium_priority, reportData.stats.total)}%`,
                      backgroundColor: '#FF9800'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>{reportData.stats.medium_priority}</Text>
            </View>
            
            <View style={styles.priorityBar}>
              <View style={styles.barLabel}>
                <Icon name="flag" size={16} color="#4CAF50" />
                <Text style={styles.barText}>Low</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(reportData.stats.low_priority, reportData.stats.total)}%`,
                      backgroundColor: '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>{reportData.stats.low_priority}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Category Breakdown</Title>
          {reportData.categories.length > 0 ? (
            reportData.categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Chip mode="outlined" style={styles.categoryChip}>
                    {category.category}
                  </Chip>
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
                <Text style={styles.categoryCount}>{category.count} complaints</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No data available for selected period</Text>
          )}
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Performance Metrics</Title>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Icon name="clock-fast" size={30} color="#2196F3" />
              <Text style={styles.metricValue}>{getResolutionTime()}</Text>
              <Text style={styles.metricLabel}>Avg. Resolution Time</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="check-circle" size={30} color="#4CAF50" />
              <Text style={styles.metricValue}>
                {getPercentage(reportData.stats.resolved, reportData.stats.total)}%
              </Text>
              <Text style={styles.metricLabel}>Resolution Rate</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="trending-up" size={30} color="#FF9800" />
              <Text style={styles.metricValue}>
                {reportData.stats.resolved}
              </Text>
              <Text style={styles.metricLabel}>Complaints Resolved</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Insights */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Insights</Title>
          <View style={styles.insightItem}>
            <Icon name="lightbulb" size={20} color="#FFD600" />
            <Text style={styles.insightText}>
              {reportData.stats.pending > 0 
                ? `You have ${reportData.stats.pending} pending complaints that need attention`
                : 'Great job! No pending complaints'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.insightItem}>
            <Icon name="chart-line" size={20} color="#2196F3" />
            <Text style={styles.insightText}>
              {reportData.categories[0] 
                ? `Most common issue: ${reportData.categories[0].category} (${reportData.categories[0].count})`
                : 'No category data available'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.insightItem}>
            <Icon name="trophy" size={20} color="#FF9800" />
            <Text style={styles.insightText}>
              Your resolution rate is {getPercentage(reportData.stats.resolved, reportData.stats.total)}%
            </Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  controlCard: {
    margin: 10,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  segmentedButtons: {
    marginTop: 5,
  },
  exportCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  exportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  generatedText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  priorityCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  priorityBars: {
    marginTop: 10,
  },
  priorityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  barText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    marginRight: 10,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  metricsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '32%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  insightsCard: {
    marginHorizontal: 10,
    marginBottom: 30,
    elevation: 2,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  divider: {
    marginVertical: 8,
  },
});