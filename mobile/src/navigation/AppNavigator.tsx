import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useColors } from '../hooks/useTheme';
import { UserRole } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';

// Shop Screens
import ShopDashboardScreen from '../screens/shop/ShopDashboardScreen';
import CreditEntryListScreen from '../screens/shop/CreditEntryListScreen';
import CreditEntryDetailScreen from '../screens/shop/CreditEntryDetailScreen';
import CreateCreditEntryScreen from '../screens/shop/CreateCreditEntryScreen';
import EditCreditEntryScreen from '../screens/shop/EditCreditEntryScreen';
import CustomerSearchScreen from '../screens/shop/CustomerSearchScreen';

// Customer Screens
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import MyCreditEntriesScreen from '../screens/customer/MyCreditEntriesScreen';
import CustomerEntryDetailScreen from '../screens/customer/CustomerEntryDetailScreen';

// Shared
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Shop Credit Entries Stack ────────────────────────────────────────────────
function ShopCreditStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreditEntryList" component={CreditEntryListScreen} />
      <Stack.Screen name="CreditEntryDetail" component={CreditEntryDetailScreen} />
      <Stack.Screen name="CreateCreditEntry" component={CreateCreditEntryScreen} />
      <Stack.Screen name="EditCreditEntry" component={EditCreditEntryScreen} />
    </Stack.Navigator>
  );
}

// ─── Shop Tab Navigator ───────────────────────────────────────────────────────
function ShopTabs() {
  const colors = useColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, any> = {
            ShopDashboard: focused ? 'home' : 'home-outline',
            CreditEntries: focused ? 'receipt' : 'receipt-outline',
            CustomerSearch: focused ? 'search' : 'search-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ShopDashboard" component={ShopDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="CreditEntries" component={ShopCreditStack} options={{ tabBarLabel: 'Entries' }} />
      <Tab.Screen name="CustomerSearch" component={CustomerSearchScreen} options={{ tabBarLabel: 'Customers' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Customer Credit Entries Stack ────────────────────────────────────────────
function CustomerCreditStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyCreditEntriesList" component={MyCreditEntriesScreen} />
      <Stack.Screen name="CustomerEntryDetail" component={CustomerEntryDetailScreen} />
    </Stack.Navigator>
  );
}

// ─── Customer Tab Navigator ───────────────────────────────────────────────────
function CustomerTabs() {
  const colors = useColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, any> = {
            CustomerDashboard: focused ? 'home' : 'home-outline',
            MyCreditEntries: focused ? 'receipt' : 'receipt-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="CustomerDashboard" component={CustomerDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="MyCreditEntries" component={CustomerCreditStack} options={{ tabBarLabel: 'My Credits' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { token, user, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token || !user ? (
        // Auth Flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen as any} />
        </>
      ) : user.role === UserRole.Shop ? (
        <Stack.Screen name="ShopTabs" component={ShopTabs} />
      ) : (
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      )}
    </Stack.Navigator>
  );
}
