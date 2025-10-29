import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import NotificationCard from '../../components/NotificationCard';
import { NotificationService } from '../../services/NotificationService';

export default function NotificationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await NotificationService.getAll();
      // setNotifications(data);
      
      // Mock data for now
      setNotifications([
        {
          id: '1',
          title: 'Election Alert',
          message: 'Voting starts tomorrow at 9:00 AM',
          timestamp: '28 Oct 2025, 10:30 AM',
          type: 'ELECTION_ALERT',
          sentTo: 1250,
        },
        {
          id: '2',
          title: 'Candidate Update',
          message: 'New candidate registered for President position',
          timestamp: '27 Oct 2025, 03:15 PM',
          type: 'CANDIDATE_UPDATE',
          sentTo: 1250,
        },
        {
          id: '3',
          title: 'Voting Reminder',
          message: 'Only 2 hours left to cast your vote!',
          timestamp: '26 Oct 2025, 05:00 PM',
          type: 'VOTING_REMINDER',
          sentTo: 403,
        },
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and message');
      return;
    }

    Alert.alert(
      'Confirm Send',
      `Send notification "${title}" to all students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: Replace with actual API call
              // await NotificationService.sendToAll(title, message);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));

              const newNotification = {
                id: Date.now().toString(),
                title: title,
                message: message,
                timestamp: new Date().toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                type: 'ADMIN_ALERT',
                sentTo: 1250,
              };

              setNotifications([newNotification, ...notifications]);
              setTitle('');
              setMessage('');
              
              Alert.alert('Success', 'Notification sent to 1250 students!');
            } catch (error) {
              console.error('Error sending notification:', error);
              Alert.alert('Error', 'Failed to send notification. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call delete API
              // await NotificationService.delete(notificationId);
              
              setNotifications(notifications.filter(n => n.id !== notificationId));
              Alert.alert('Success', 'Notification deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <NotificationCard
      notification={item}
      onDelete={() => deleteNotification(item.id)}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formSection}>
        <Text style={styles.header}>Send Notification</Text>

        <TextInput
          style={styles.input}
          placeholder="Notification Title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Notification Message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={sendNotification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>📤 Send to All Students</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.subHeader}>Notification History ({notifications.length})</Text>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications sent yet</Text>
            </View>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageInput: {
    height: 100,
    paddingTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
    padding: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
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