import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { AdminService } from '../../services/AdminService';

export default function ManageCandidatesScreen() {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, APPROVED, PENDING, REJECTED
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await AdminService.getAllCandidates();
      // setCandidates(data);
      
      // Mock data
      const mockCandidates = [
        {
          id: '1',
          name: 'John Doe',
          rollNumber: '23CSB0A01',
          position: 'President',
          year: '3rd Year',
          department: 'CSE',
          manifesto: 'I will work towards better campus facilities and more student events.',
          photo: 'https://via.placeholder.com/150',
          status: 'PENDING',
          appliedDate: '25 Oct 2025',
        },
        {
          id: '2',
          name: 'Jane Smith',
          rollNumber: '23CSB0A15',
          position: 'Secretary',
          year: '3rd Year',
          department: 'CSE',
          manifesto: 'Focus on improving communication between students and administration.',
          photo: 'https://via.placeholder.com/150',
          status: 'APPROVED',
          appliedDate: '24 Oct 2025',
        },
        {
          id: '3',
          name: 'Mike Johnson',
          rollNumber: '23CSB0A28',
          position: 'President',
          year: '3rd Year',
          department: 'ECE',
          manifesto: 'Bringing innovation and transparency to student governance.',
          photo: 'https://via.placeholder.com/150',
          status: 'APPROVED',
          appliedDate: '23 Oct 2025',
        },
      ];
      
      setCandidates(mockCandidates);
      setLoading(false);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load candidates');
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const approveCandidate = async (candidateId) => {
    Alert.alert(
      'Approve Candidate',
      'Approve this candidate application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.approveCandidate(candidateId);
              
              setCandidates(candidates.map(c =>
                c.id === candidateId ? { ...c, status: 'APPROVED' } : c
              ));
              setModalVisible(false);
              Alert.alert('Success', 'Candidate approved successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve candidate');
            }
          },
        },
      ]
    );
  };

 const rejectCandidate = async (candidateId) => {
    Alert.alert(
      'Reject Candidate',
      'Are you sure you want to reject this candidate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.rejectCandidate(candidateId);
              
              setCandidates(candidates.map(c =>
                c.id === candidateId ? { ...c, status: 'REJECTED' } : c
              ));
              setModalVisible(false);
              Alert.alert('Success', 'Candidate rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject candidate');
            }
          },
        },
      ]
    );
  };

  const viewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#34C759';
      case 'PENDING':
        return '#FF9500';
      case 'REJECTED':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const renderCandidate = ({ item }) => (
    <TouchableOpacity
      style={styles.candidateCard}
      onPress={() => viewDetails(item)}
    >
      <Image
        source={{ uri: item.photo }}
        style={styles.candidatePhoto}
      />
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName}>{item.name}</Text>
        <Text style={styles.candidateDetail}>{item.position}</Text>
        <Text style={styles.candidateDetail}>
          {item.rollNumber} • {item.year}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({candidates.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'PENDING' && styles.filterTabActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Pending ({candidates.filter(c => c.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'APPROVED' && styles.filterTabActive]}
          onPress={() => setFilter('APPROVED')}
        >
          <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>
            Approved ({candidates.filter(c => c.status === 'APPROVED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Candidates List */}
      <FlatList
        data={filteredCandidates}
        renderItem={renderCandidate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No candidates found</Text>
          </View>
        }
      />

      {/* Candidate Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedCandidate && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Candidate Details</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Image
                    source={{ uri: selectedCandidate.photo }}
                    style={styles.modalPhoto}
                  />

                  <Text style={styles.modalName}>{selectedCandidate.name}</Text>
                  <Text style={styles.modalPosition}>{selectedCandidate.position}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Roll Number:</Text>
                    <Text style={styles.detailValue}>{selectedCandidate.rollNumber}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Year:</Text>
                    <Text style={styles.detailValue}>{selectedCandidate.year}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Department:</Text>
                    <Text style={styles.detailValue}>{selectedCandidate.department}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied:</Text>
                    <Text style={styles.detailValue}>{selectedCandidate.appliedDate}</Text>
                  </View>

                  <Text style={styles.manifestoTitle}>Manifesto</Text>
                  <Text style={styles.manifestoText}>{selectedCandidate.manifesto}</Text>

                  {selectedCandidate.status === 'PENDING' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => approveCandidate(selectedCandidate.id)}
                      >
                        <Text style={styles.actionButtonText}>✓ Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => rejectCandidate(selectedCandidate.id)}
                      >
                        <Text style={styles.actionButtonText}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
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
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidatePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  candidateInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  candidateDetail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '300',
  },
  modalPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalPosition: {
    fontSize: 18,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  manifestoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 8,
  },
  manifestoText: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});