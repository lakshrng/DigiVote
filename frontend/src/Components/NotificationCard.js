import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotificationCard({ notification, onDelete }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'ELECTION_ALERT':
        return '📅';
      case 'CANDIDATE_UPDATE':
        return '👤';
      case 'VOTING_REMINDER':
        return '⏰';
      case 'RESULTS':
        return '🏆';
      default:
        return '🔔';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getTypeIcon(notification.type)}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.sentInfo}>Sent to {notification.sentTo} students</Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.message}>{notification.message}</Text>
      
      <Text style={styles.timestamp}>{notification.timestamp}</Text>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  sentInfo: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
  },
  message: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
});