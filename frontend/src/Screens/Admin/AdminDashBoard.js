import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import StatCard from '../../components/StatCard';
import AdminActionCard from '../../components/AdminActionCard';
import { AdminService } from '../../services/AdminService';

export default function AdminDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalVoters: 1250,
    totalCandidates: 8,
    votescast: 0,
    activeElections: 1,
  });
  
  const [electionStatus, setElectionStatus] = useState('STOPPED'); // RUNNING, PAUSED, STOPPED
  const [refreshing, setRefreshing] = useState(false);
  const [adminName] = useState('Admin Name'); // TODO: Get from login

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await AdminService.getDashboardStats();
      // setStats(data);
      
      // Mock data for now
      setStats({
        totalVoters: 1250,
        totalCandidates: 8,
        votesCast: 847,
        activeElections: 1,
      });
      
      // Mock election status
      setElectionStatus('STOPPED');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    switch (electionStatus) {
      case 'RUNNING':
        return '#34C759';
      case 'PAUSED':
        return '#FF9500';
      case 'STOPPED':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {adminName}</Text>
      </View>

      {/* Election Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Election Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{electionStatus}</Text>
          </View>
        </View>
      </View>

      {/* Statistics Section */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsContainer}>
        <StatCard
          label="Total Voters"
          value={stats.totalVoters}
          color="#007AFF"
        />
        <StatCard
          label="Candidates"
          value={stats.totalCandidates}
          color="#34C759"
        />
      </View>
      
      <View style={styles.statsContainer}>
        <StatCard
          label="Votes Cast"
          value={stats.votesCast}
          color="#FF9500"
        />
        <StatCard
          label="Completion"
          value={`${Math.round((stats.votesCast / stats.totalVoters) * 100)}%`}
          color="#AF52DE"
        />
      </View>

      {/* Quick Actions Section */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <AdminActionCard
        icon="🔔"
        title="Send Notifications"
        onPress={() => navigation.navigate('NotificationScreen')}
      />

      <AdminActionCard
        icon="👥"
        title="Manage Voters"
        onPress={() => navigation.navigate('ManageVotersScreen')}
      />

      <AdminActionCard
        icon="📋"
        title="Manage Candidates"
        onPress={() => navigation.navigate('ManageCandidatesScreen')}
      />

      <AdminActionCard
        icon="🎛️"
        title="Election Control"
        onPress={() => navigation.navigate('ElectionControlScreen')}
      />

      <AdminActionCard
        icon="📊"
        title="View Results"
        onPress={() => Alert.alert('Results', 'Results screen - to be implemented by Developer 5')}
      />

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => {
                // TODO: Clear session and navigate to login
                Alert.alert('Logged Out', 'You have been logged out successfully');
              }},
            ]
          );
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 30,
  },
});