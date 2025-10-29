import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import VoterCard from '../../components/VoterCard';
import { AdminService } from '../../services/AdminService';

export default function ManageVotersScreen() {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, VERIFIED, PENDING
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVoters();
  }, []);

  useEffect(() => {
    filterVoters();
  }, [searchQuery, filter, voters]);

  const loadVoters = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await AdminService.getAllVoters();
      // setVoters(data);
      
      // Mock data
      const mockVoters = [
        {
          id: '1',
          name: 'Rayna Verma',
          rollNumber: '24CSB0B57',
          email: 'rayna.verma@college.edu',
          year: '2nd Year',
          department: 'CSE',
          status: 'VERIFIED',
          hasVoted: false,
        },
        {
          id: '2',
          name: 'Siddanth Sarath',
          rollNumber: '24CSB0B71',
          email: 'siddanth.sarath@college.edu',
          year: '2nd Year',
          department: 'CSE',
          status: 'VERIFIED',
          hasVoted: true,
        },
        {
          id: '3',
          name: 'Laksh Rangnekar',
          rollNumber: '24CSB0B38',
          email: 'laksh.rangnekar@college.edu',
          year: '2nd Year',
          department: 'CSE',
          status: 'PENDING',
          hasVoted: false,
        },
        {
          id: '4',
          name: 'Sravya Sajja',
          rollNumber: '24CSB0B74',
          email: 'sravya.sajja@college.edu',
          year: '2nd Year',
          department: 'CSE',
          status: 'VERIFIED',
          hasVoted: true,
        },
      ];
      
      setVoters(mockVoters);
      setLoading(false);
    } catch (error) {
      console.error('Error loading voters:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load voters');
    }
  };

  const filterVoters = () => {
    let filtered = voters;

    // Apply status filter
    if (filter === 'VERIFIED') {
      filtered = filtered.filter(v => v.status === 'VERIFIED');
    } else if (filter === 'PENDING') {
      filtered = filtered.filter(v => v.status === 'PENDING');
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.name.toLowerCase().includes(query) ||
          v.rollNumber.toLowerCase().includes(query) ||
          v.email.toLowerCase().includes(query)
      );
    }

    setFilteredVoters(filtered);
  };

  const verifyVoter = async (voterId) => {
    Alert.alert(
      'Verify Voter',
      'Approve this voter registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.verifyVoter(voterId);
              
              setVoters(voters.map(v =>
                v.id === voterId ? { ...v, status: 'VERIFIED' } : v
              ));
              Alert.alert('Success', 'Voter verified successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to verify voter');
            }
          },
        },
      ]
    );
  };

  const removeVoter = async (voterId) => {
    Alert.alert(
      'Remove Voter',
      'Are you sure you want to remove this voter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.removeVoter(voterId);
              
              setVoters(voters.filter(v => v.id !== voterId));
              Alert.alert('Success', 'Voter removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove voter');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVoters();
    setRefreshing(false);
  };

  const renderVoter = ({ item }) => (
    <VoterCard
      voter={item}
      onVerify={() => verifyVoter(item.id)}
      onRemove={() => removeVoter(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading voters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, roll number, or email"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({voters.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'VERIFIED' && styles.filterTabActive]}
          onPress={() => setFilter('VERIFIED')}
        >
          <Text style={[styles.filterText, filter === 'VERIFIED' && styles.filterTextActive]}>
            Verified ({voters.filter(v => v.status === 'VERIFIED').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'PENDING' && styles.filterTabActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Pending ({voters.filter(v => v.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voters List */}
      <FlatList
        data={filteredVoters}
        renderItem={renderVoter}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No voters found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});