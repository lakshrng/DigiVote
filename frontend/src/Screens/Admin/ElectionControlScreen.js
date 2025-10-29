import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { AdminService } from '../../services/AdminService';

export default function ElectionControlScreen() {
  const [electionStatus, setElectionStatus] = useState('STOPPED'); // RUNNING, PAUSED, STOPPED
  const [electionStartTime, setElectionStartTime] = useState(null);
  const [electionEndTime, setElectionEndTime] = useState(null);
  const [autoClose, setAutoClose] = useState(true);

  useEffect(() => {
    loadElectionStatus();
  }, []);

  const loadElectionStatus = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await AdminService.getElectionStatus();
      // setElectionStatus(data.status);
      
      // Mock data
      setElectionStatus('STOPPED');
    } catch (error) {
      console.error('Error loading election status:', error);
    }
  };

  const startElection = () => {
    Alert.alert(
      'Start Election',
      'This will open voting for all students. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.startElection();
              
              const startTime = new Date();
              const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours
              
              setElectionStatus('RUNNING');
              setElectionStartTime(startTime);
              setElectionEndTime(endTime);
              
              Alert.alert(
                'Success',
                'Election has been started!\nVoting is now open for all students.',
                [
                  {
                    text: 'Send Notification',
                    onPress: () => {
                      // Navigate to notification screen with pre-filled data
                      Alert.alert('Info', 'Navigate to NotificationScreen to send alert');
                    },
                  },
                  { text: 'OK' },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to start election');
            }
          },
        },
      ]
    );
  };

  const pauseElection = () => {
    Alert.alert(
      'Pause Election',
      'This will temporarily stop voting. You can resume later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.pauseElection();
              
              setElectionStatus('PAUSED');
              Alert.alert('Success', 'Election has been paused');
            } catch (error) {
              Alert.alert('Error', 'Failed to pause election');
            }
          },
        },
      ]
    );
  };

  const resumeElection = () => {
    Alert.alert(
      'Resume Election',
      'Resume voting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resume',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.resumeElection();
              
              setElectionStatus('RUNNING');
              Alert.alert('Success', 'Election has been resumed');
            } catch (error) {
              Alert.alert('Error', 'Failed to resume election');
            }
          },
        },
      ]
    );
  };

  const stopElection = () => {
    Alert.alert(
      'Stop Election',
      'This will permanently close voting. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.stopElection();
              
              setElectionStatus('STOPPED');
              Alert.alert(
                'Success',
                'Election has been stopped.\nYou can now publish results.',
                [
                  {
                    text: 'Publish Results',
                    onPress: () => {
                      Alert.alert('Info', 'Navigate to Results screen to publish');
                    },
                  },
                  { text: 'OK' },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to stop election');
            }
          },
        },
      ]
    );
  };

  const extendElection = () => {
    Alert.alert(
      'Extend Election',
      'Add 6 more hours to voting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Extend',
          onPress: async () => {
            try {
              // TODO: API call
              // await AdminService.extendElection(6);
              
              const newEndTime = new Date(electionEndTime.getTime() + 6 * 60 * 60 * 1000);
              setElectionEndTime(newEndTime);
              
              Alert.alert('Success', 'Election extended by 6 hours');
            } catch (error) {
              Alert.alert('Error', 'Failed to extend election');
            }
          },
        },
      ]
    );
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
    <ScrollView style={styles.container}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{electionStatus}</Text>
        </View>
      </View>

      {/* Election Times */}
      {electionStatus !== 'STOPPED' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Election Schedule</Text>
          {electionStartTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started:</Text>
              <Text style={styles.infoValue}>
                {electionStartTime.toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
          {electionEndTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ends:</Text>
              <Text style={styles.infoValue}>
                {electionEndTime.toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto-close at end time</Text>
          <Switch
            value={autoClose}
            onValueChange={setAutoClose}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Control Buttons */}
      <Text style={styles.sectionTitle}>Election Control</Text>

      {electionStatus === 'STOPPED' && (
        <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={startElection}>
          <Text style={styles.controlButtonText}>▶️ Start Election</Text>
        </TouchableOpacity>
      )}

      {electionStatus === 'RUNNING' && (
        <>
          <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={pauseElection}>
            <Text style={styles.controlButtonText}>⏸️ Pause Election</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.extendButton]} onPress={extendElection}>
            <Text style={styles.controlButtonText}>⏱️ Extend Time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopElection}>
            <Text style={styles.controlButtonText}>⏹️ Stop Election</Text>
          </TouchableOpacity>
        </>
      )}

      {electionStatus === 'PAUSED' && (
        <>
          <TouchableOpacity style={[styles.controlButton, styles.resumeButton]} onPress={resumeElection}>
            <Text style={styles.controlButtonText}>▶️ Resume Election</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopElection}>
            <Text style={styles.controlButtonText}>⏹️ Stop Election</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Warning Messages */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Important</Text>
        <Text style={styles.warningText}>
          • Starting election opens voting for all verified students{'\n'}
          • Pausing temporarily stops voting (can be resumed){'\n'}
          • Stopping permanently closes the election{'\n'}
          • Results can only be published after stopping
        </Text>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  controlButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  extendButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 22,
  },
  footer: {
    height: 30,
  },
});