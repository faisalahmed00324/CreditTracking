import React from 'react';
import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import CreditEntriesScreen from '../screens/CreditEntriesScreen';
import CreateCreditEntryScreen from '../screens/CreateCreditEntryScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { isShop, logout } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: '#f4f7f8' },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Pressable onPress={logout}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="CreditEntries" component={CreditEntriesScreen} options={{ title: 'Credit Entries' }} />
      {isShop ? (
        <Stack.Screen name="CreateEntry" component={CreateCreditEntryScreen} options={{ title: 'Create Entry' }} />
      ) : null}
    </Stack.Navigator>
  );
}
