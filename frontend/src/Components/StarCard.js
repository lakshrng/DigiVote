import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={[styles.value, { color: color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
  },
});