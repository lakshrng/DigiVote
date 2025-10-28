import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import NotificationScreen from '../screens/admin/NotificationScreen';
import ManageVotersScreen from '../screens/admin/ManageVotersScreen';
import ManageCandidatesScreen from '../screens/admin/ManageCandidatesScreen';
import ElectionControlScreen from '../screens/admin/ElectionControlScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={{ title: 'Send Notifications' }}
      />
      <Stack.Screen
        name="ManageVotersScreen"
        component={ManageVotersScreen}
        options={{ title: 'Manage Voters' }}
      />
      <Stack.Screen
        name="ManageCandidatesScreen"
        component={ManageCandidatesScreen}
        options={{ title: 'Manage Candidates' }}
      />
      <Stack.Screen
        name="ElectionControlScreen"
        component={ElectionControlScreen}
        options={{ title: 'Election Control' }}
      />
    </Stack.Navigator>
  );
}