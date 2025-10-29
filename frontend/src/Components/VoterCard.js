import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function VoterCard({ voter, onVerify, onRemove }) {
  const getStatusColor = () => {
    switch (voter.status) {
      case 'VERIFIED':
        return '#34C759';
      case 'PENDING':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{voter.name}</Text>
          <Text style={styles.detail}>{voter.rollNumber}</Text>
          <Text style={styles.detail}>{voter.email}</Text>
          <Text style={styles.detail}>
            {voter.year} • {voter.department}
          </Text>
          
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{voter.status}</Text>
            </View>
            {voter.hasVoted && (
              <View style={[styles.statusBadge, { backgroundColor: '#007AFF' }]}>
                <Text style={styles.badgeText}>VOTED</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {voter.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={onVerify}
          >
            <Text style={styles.actionButtonText}>✓ Verify</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={onRemove}
          >
            <Text style={styles.actionButtonText}>✕ Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#34C759',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});