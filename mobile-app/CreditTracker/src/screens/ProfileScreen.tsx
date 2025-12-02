import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button} from '../components';
import {useAuth} from '../context';
import {Role} from '../types';

type MainStackParamList = {
  Home: undefined;
  CreditEntryDetail: {entryId: string};
  CreateCreditEntry: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Profile'
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation: _navigation,
}) => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: confirmLogout},
    ]);
  };

  const confirmLogout = async () => {
    await logout();
    // Navigation will be handled by auth state change
  };

  const getRoleName = (role: Role | undefined) => {
    switch (role) {
      case Role.Shop:
        return 'Shop Owner';
      case Role.Customer:
        return 'Customer';
      default:
        return 'Unknown';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleName(user.role)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user.userName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IC No / Passport</Text>
          <Text style={styles.infoValue}>{user.icNoOrPassport}</Text>
        </View>

        {user.address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{user.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  actions: {
    padding: 20,
  },
  logoutButton: {
    marginTop: 16,
  },
});
