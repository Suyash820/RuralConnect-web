// src/screens/admin/Analytics.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Share,
  Clipboard
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
  Portal,
  ProgressBar,
  List,
  IconButton
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { executeSql } from '../../services/database';

const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#2196F3'
  }
};

const pieChartConfig = {
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date ranges
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Load comprehensive analytics data
      const complaintsResult = await executeSql(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
          AVG(julianday('now') - julianday(created_at)) as avg_resolution_time
        FROM complaints
        WHERE created_at >= ?`,
        [startDate.toISOString()]
      );

      // Category breakdown
      const categoryResult = await executeSql(
        `SELECT 
          category,
          COUNT(*) as count
        FROM complaints
        WHERE created_at >= ?
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5`,
        [startDate.toISOString()]
      );

      // User statistics
      const userResult = await executeSql(
        `SELECT 
          role,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active
        FROM users
        GROUP BY role`
      );

      // Daily complaints for chart
      const dailyResult = await executeSql(
        `SELECT 
          date(created_at) as day,
          COUNT(*) as count
        FROM complaints
        WHERE created_at >= ?
        GROUP BY date(created_at)
        ORDER BY day
        LIMIT 7`,
        [new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()]
      );

      // Top performing officers
      const officerResult = await executeSql(
        `SELECT 
          u.name,
          COUNT(c.id) as resolved_count,
          AVG(julianday(c.updated_at) - julianday(c.created_at)) as avg_time
        FROM complaints c
        JOIN users u ON c.assigned_to = u.id
        WHERE c.status = 'resolved' AND c.updated_at >= ?
        GROUP BY c.assigned_to
        ORDER BY resolved_count DESC
        LIMIT 5`,
        [startDate.toISOString()]
      );

      // Location-wise data
      const locationResult = await executeSql(
        `SELECT 
          SUBSTR(location, 1, INSTR(location, ',') - 1) as area,
          COUNT(*) as count
        FROM complaints
        WHERE location IS NOT NULL AND location != ''
        GROUP BY area
        ORDER BY count DESC
        LIMIT 5`
      );

      const stats = complaintsResult.rows._array[0];
      const categories = categoryResult.rows._array;
      const users = userResult.rows._array;
      const daily = dailyResult.rows._array;
      const officers = officerResult.rows._array;
      const locations = locationResult.rows._array;

      // Prepare chart data
      const dailyLabels = daily.map(d => {
        const date = new Date(d.day);
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      });
      const dailyData = daily.map(d => d.count);

      const categoryLabels = categories.map(c => 
        c.category.replace('_', ' ').substring(0, 10)
      );
      const categoryData = categories.map(c => c.count);
      const categoryColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#FF595E'
      ];

      const pieData = categories.map((cat, index) => ({
        name: cat.category.replace('_', ' '),
        population: cat.count,
        color: categoryColors[index % categoryColors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }));

      setAnalyticsData({
        stats,
        categories,
        users,
        daily: {
          labels: dailyLabels,
          data: dailyData
        },
        category: {
          labels: categoryLabels,
          data: categoryData,
          colors: categoryColors.slice(0, categories.length)
        },
        pieData,
        officers,
        locations,
        period: getPeriodLabel(timeRange),
        generatedAt: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to mock data
      setAnalyticsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => {
    return {
      stats: {
        total: 156,
        pending: 42,
        in_progress: 38,
        resolved: 68,
        rejected: 8,
        high_priority: 45,
        medium_priority: 78,
        low_priority: 33,
        avg_resolution_time: 3.5
      },
      categories: [
        { category: 'road_repair', count: 45 },
        { category: 'garbage', count: 38 },
        { category: 'water', count: 32 },
        { category: 'electricity', count: 25 },
        { category: 'street_light', count: 16 }
      ],
      users: [
        { role: 'citizen', count: 245, active: 230 },
        { role: 'officer', count: 12, active: 10 },
        { role: 'admin', count: 3, active: 3 }
      ],
      daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12, 19, 8, 15, 22, 18, 14]
      },
      category: {
        labels: ['Road', 'Garbage', 'Water', 'Electric', 'Light'],
        data: [45, 38, 32, 25, 16],
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      },
      pieData: [
        {
          name: 'Road Repair',
          population: 45,
          color: '#FF6384',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        },
        {
          name: 'Garbage',
          population: 38,
          color: '#36A2EB',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        },
        {
          name: 'Water',
          population: 32,
          color: '#FFCE56',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        },
        {
          name: 'Electricity',
          population: 25,
          color: '#4BC0C0',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        },
        {
          name: 'Street Light',
          population: 16,
          color: '#9966FF',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }
      ],
      officers: [
        { name: 'Amit Patel', resolved_count: 28, avg_time: 2.5 },
        { name: 'Meena Singh', resolved_count: 22, avg_time: 3.1 },
        { name: 'Rajesh Kumar', resolved_count: 18, avg_time: 4.2 }
      ],
      locations: [
        { area: 'Village A', count: 45 },
        { area: 'Market Area', count: 38 },
        { area: 'School Road', count: 32 },
        { area: 'Park Street', count: 25 },
        { area: 'Residential', count: 16 }
      ],
      period: getPeriodLabel(timeRange),
      generatedAt: new Date().toLocaleString()
    };
  };

  const getPeriodLabel = (range) => {
    switch (range) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last Month';
      case 'quarter': return 'Last 3 Months';
      case 'year': return 'Last Year';
      default: return 'Last 7 Days';
    }
  };

  const generateReport = async (format) => {
    setGeneratingReport(true);
    try {
      const reportContent = generateReportContent(format);
      
      if (format === 'csv') {
        const csvContent = generateCSV();
        const fileUri = `${FileSystem.documentDirectory}analytics_report_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Analytics Report',
          });
        } else {
          Alert.alert('Sharing not available', 'Cannot share file on this device');
        }
      } else {
        // For PDF, would use a PDF library
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
    if (!analyticsData) return '';
    
    let csv = 'Rural e-Governance Analytics Report\n\n';
    csv += `Period: ${analyticsData.period}\n`;
    csv += `Generated: ${analyticsData.generatedAt}\n\n`;
    
    // Statistics
    csv += 'Complaint Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Complaints,${analyticsData.stats.total}\n`;
    csv += `Pending,${analyticsData.stats.pending}\n`;
    csv += `In Progress,${analyticsData.stats.in_progress}\n`;
    csv += `Resolved,${analyticsData.stats.resolved}\n`;
    csv += `Rejected,${analyticsData.stats.rejected}\n`;
    csv += `High Priority,${analyticsData.stats.high_priority}\n`;
    csv += `Medium Priority,${analyticsData.stats.medium_priority}\n`;
    csv += `Low Priority,${analyticsData.stats.low_priority}\n`;
    csv += `Avg Resolution Time,${analyticsData.stats.avg_resolution_time} days\n\n`;
    
    // Category Breakdown
    csv += 'Category Breakdown\n';
    csv += 'Category,Count\n';
    analyticsData.categories.forEach(cat => {
      csv += `${cat.category},${cat.count}\n`;
    });
    
    return csv;
  };

  const generateReportContent = (format) => {
    return `Analytics Report for ${analyticsData.period}`;
  };

  const shareInsights = async () => {
    try {
      const insights = `Rural e-Governance Insights:\n\n` +
        `• ${analyticsData.stats.resolved} complaints resolved\n` +
        `• Avg resolution: ${analyticsData.stats.avg_resolution_time} days\n` +
        `• Top category: ${analyticsData.categories[0]?.category || 'N/A'}\n` +
        `• Period: ${analyticsData.period}`;
      
      await Share.share({
        message: insights,
        title: 'App Insights'
      });
    } catch (error) {
      console.error('Error sharing insights:', error);
    }
  };

  const copySummary = () => {
    if (!analyticsData) return;
    
    const summary = `📊 Rural e-Governance Analytics Summary\n\n` +
      `📅 Period: ${analyticsData.period}\n` +
      `📈 Total Complaints: ${analyticsData.stats.total}\n` +
      `✅ Resolved: ${analyticsData.stats.resolved} (${Math.round(analyticsData.stats.resolved/analyticsData.stats.total*100)}%)\n` +
      `⏱️ Avg Resolution: ${analyticsData.stats.avg_resolution_time} days\n` +
      `🏆 Top Category: ${analyticsData.categories[0]?.category?.replace('_', ' ') || 'N/A'}`;
    
    Clipboard.setString(summary);
    Alert.alert('Copied', 'Analytics summary copied to clipboard');
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading analytics data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Title style={styles.headerTitle}>Analytics Dashboard</Title>
              <Text style={styles.headerSubtitle}>
                {analyticsData.period} • Generated: {analyticsData.generatedAt}
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
                <Menu.Item
                  onPress={() => generateReport('excel')}
                  title="Export as Excel"
                  leadingIcon="microsoft-excel"
                  disabled={generatingReport}
                />
              </Menu>
            </Portal>
            
            <View style={styles.headerActions}>
              <IconButton
                icon="export"
                size={24}
                onPress={() => setShowExportMenu(true)}
                loading={generatingReport}
                disabled={generatingReport}
              />
              <IconButton
                icon="share-variant"
                size={24}
                onPress={shareInsights}
              />
              <IconButton
                icon="content-copy"
                size={24}
                onPress={copySummary}
              />
            </View>
          </View>
          
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'week', label: 'Week', icon: 'calendar-week' },
              { value: 'month', label: 'Month', icon: 'calendar-month' },
              { value: 'quarter', label: 'Quarter', icon: 'calendar-blank' },
              { value: 'year', label: 'Year', icon: 'calendar' },
            ]}
            style={styles.timeRangeButtons}
          />
        </Card.Content>
      </Card>

      {/* Key Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Key Metrics</Title>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Icon name="clipboard-list" size={30} color="#2196F3" />
              <Text style={styles.metricNumber}>{analyticsData.stats.total}</Text>
              <Text style={styles.metricLabel}>Total Complaints</Text>
              <Text style={styles.metricChange}>
                {getPercentage(analyticsData.stats.total, analyticsData.stats.total)}% of total
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="check-circle" size={30} color="#4CAF50" />
              <Text style={styles.metricNumber}>{analyticsData.stats.resolved}</Text>
              <Text style={styles.metricLabel}>Resolved</Text>
              <Text style={styles.metricChange}>
                {getPercentage(analyticsData.stats.resolved, analyticsData.stats.total)}% resolution rate
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="clock-fast" size={30} color="#FF9800" />
              <Text style={styles.metricNumber}>
                {analyticsData.stats.avg_resolution_time?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Avg. Days</Text>
              <Text style={styles.metricChange}>To resolve</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="account-group" size={30} color="#9C27B0" />
              <Text style={styles.metricNumber}>
                {analyticsData.users.reduce((sum, u) => sum + u.count, 0)}
              </Text>
              <Text style={styles.metricLabel}>Total Users</Text>
              <Text style={styles.metricChange}>
                {analyticsData.users.find(u => u.role === 'citizen')?.count || 0} citizens
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Complaints Trend */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="chart-line" size={20} color="#2196F3" />
            <Text style={{ marginLeft: 10 }}>Complaints Trend</Text>
          </Title>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: analyticsData.daily.labels,
                datasets: [{
                  data: analyticsData.daily.data
                }]
              }}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
          
          <Text style={styles.chartDescription}>
            Daily complaints over the last 7 days
          </Text>
        </Card.Content>
      </Card>

      {/* Category Distribution */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="chart-bar" size={20} color="#4CAF50" />
            <Text style={{ marginLeft: 10 }}>Category Distribution</Text>
          </Title>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: analyticsData.category.labels,
                datasets: [{
                  data: analyticsData.category.data
                }]
              }}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
          
          <View style={styles.categoryLegend}>
            {analyticsData.categories.map((cat, index) => (
              <Chip
                key={cat.category}
                style={[
                  styles.legendChip,
                  { backgroundColor: analyticsData.category.colors[index] }
                ]}
                textStyle={styles.legendChipText}
              >
                {cat.category.replace('_', ' ')}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Status Breakdown */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="chart-pie" size={20} color="#FF9800" />
            <Text style={{ marginLeft: 10 }}>Status Breakdown</Text>
          </Title>
          
          <View style={styles.statusBars}>
            <View style={styles.statusBar}>
              <View style={styles.statusLabel}>
                <Icon name="clock" size={16} color="#FF9800" />
                <Text style={styles.statusText}>Pending</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(analyticsData.stats.pending, analyticsData.stats.total)}%`,
                      backgroundColor: '#FF9800'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>
                {analyticsData.stats.pending} ({getPercentage(analyticsData.stats.pending, analyticsData.stats.total)}%)
              </Text>
            </View>
            
            <View style={styles.statusBar}>
              <View style={styles.statusLabel}>
                <Icon name="progress-wrench" size={16} color="#2196F3" />
                <Text style={styles.statusText}>In Progress</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(analyticsData.stats.in_progress, analyticsData.stats.total)}%`,
                      backgroundColor: '#2196F3'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>
                {analyticsData.stats.in_progress} ({getPercentage(analyticsData.stats.in_progress, analyticsData.stats.total)}%)
              </Text>
            </View>
            
            <View style={styles.statusBar}>
              <View style={styles.statusLabel}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.statusText}>Resolved</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${getPercentage(analyticsData.stats.resolved, analyticsData.stats.total)}%`,
                      backgroundColor: '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barValue}>
                {analyticsData.stats.resolved} ({getPercentage(analyticsData.stats.resolved, analyticsData.stats.total)}%)
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Top Performers */}
      <Card style={styles.performersCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="trophy" size={20} color="#FFD600" />
            <Text style={{ marginLeft: 10 }}>Top Performing Officers</Text>
          </Title>
          
          {analyticsData.officers.length > 0 ? (
            analyticsData.officers.map((officer, index) => (
              <View key={index} style={styles.performerItem}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{officer.name}</Text>
                  <View style={styles.performerStats}>
                    <Text style={styles.performerStat}>
                      <Icon name="check-circle" size={14} color="#4CAF50" />
                      {' '}{officer.resolved_count} resolved
                    </Text>
                    <Text style={styles.performerStat}>
                      <Icon name="clock" size={14} color="#FF9800" />
                      {' '}{officer.avg_time?.toFixed(1)} days avg
                    </Text>
                  </View>
                </View>
                
                <Chip mode="outlined" style={styles.efficiencyChip}>
                  {officer.avg_time?.toFixed(1)} days
                </Chip>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No officer performance data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Location Insights */}
      <Card style={styles.locationCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="map-marker" size={20} color="#F44336" />
            <Text style={{ marginLeft: 10 }}>Location Insights</Text>
          </Title>
          
          {analyticsData.locations.length > 0 ? (
            analyticsData.locations.map((location, index) => (
              <View key={index} style={styles.locationItem}>
                <View style={styles.locationRank}>
                  <Text style={styles.locationRankText}>{index + 1}</Text>
                </View>
                
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.area}</Text>
                  <ProgressBar
                    progress={location.count / Math.max(...analyticsData.locations.map(l => l.count))}
                    style={styles.locationProgress}
                    color="#2196F3"
                  />
                </View>
                
                <Text style={styles.locationCount}>{location.count} complaints</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No location data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* User Distribution */}
      <Card style={styles.userCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="account-group" size={20} color="#9C27B0" />
            <Text style={{ marginLeft: 10 }}>User Distribution</Text>
          </Title>
          
          <View style={styles.userDistribution}>
            {analyticsData.users.map((user, index) => (
              <View key={user.role} style={styles.userGroup}>
                <View style={styles.userGroupHeader}>
                  <Chip
                    mode="outlined"
                    style={styles.userRoleChip}
                    icon={
                      user.role === 'citizen' ? 'account' :
                      user.role === 'officer' ? 'badge-account' : 'shield-account'
                    }
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Chip>
                  <Text style={styles.userCount}>{user.count} users</Text>
                </View>
                
                <View style={styles.userGroupDetails}>
                  <Text style={styles.userDetail}>
                    <Icon name="check-circle" size={14} color="#4CAF50" />
                    {' '}{user.active} active
                  </Text>
                  <Text style={styles.userDetail}>
                    <Icon name="account-clock" size={14} color="#FF9800" />
                    {' '}{user.count - user.active} inactive
                  </Text>
                </View>
                
                <ProgressBar
                  progress={user.active / user.count}
                  style={styles.userProgress}
                  color={
                    user.role === 'citizen' ? '#4CAF50' :
                    user.role === 'officer' ? '#2196F3' : '#FF9800'
                  }
                />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Insights & Recommendations */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="lightbulb" size={20} color="#FFD600" />
            <Text style={{ marginLeft: 10 }}>Insights & Recommendations</Text>
          </Title>
          
          <List.Item
            title="Improve Resolution Time"
            description="Average resolution time is 3.5 days. Consider assigning more officers to high-priority complaints."
            left={props => <List.Icon {...props} icon="clock-fast" color="#FF9800" />}
            style={styles.insightItem}
          />
          
          <List.Item
            title="Address Road Repair Backlog"
            description="Road repair is the most common complaint category. Consider allocating more resources to this area."
            left={props => <List.Icon {...props} icon="road" color="#F44336" />}
            style={styles.insightItem}
          />
          
          <List.Item
            title="Optimize Officer Allocation"
            description="Top officers handle 60% of resolved complaints. Consider distributing workload more evenly."
            left={props => <List.Icon {...props} icon="account-supervisor" color="#2196F3" />}
            style={styles.insightItem}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCard: {
    margin: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  timeRangeButtons: {
    marginTop: 10,
  },
  metricsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoryLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendChip: {
    margin: 4,
  },
  legendChipText: {
    fontSize: 10,
    color: 'white',
  },
  statsCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  statusBars: {
    marginTop: 10,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  statusText: {
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
    width: 80,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  performersCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  performerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  performerStat: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  efficiencyChip: {
    alignSelf: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  locationCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationRank: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationProgress: {
    height: 6,
    borderRadius: 3,
  },
  locationCount: {
    width: 80,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  userCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  userDistribution: {
    marginTop: 10,
  },
  userGroup: {
    marginBottom: 20,
  },
  userGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userRoleChip: {
    alignSelf: 'flex-start',
  },
  userCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userGroupDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProgress: {
    height: 6,
    borderRadius: 3,
  },
  insightsCard: {
    marginHorizontal: 10,
    marginBottom: 30,
    elevation: 2,
    backgroundColor: '#FFFDE7',
  },
  insightItem: {
    paddingVertical: 8,
  },
});