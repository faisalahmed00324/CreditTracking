import React, {useCallback} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {
  HomeScreen,
  CreditEntryDetailScreen,
  CreateCreditEntryScreen,
  ProfileScreen,
} from '../screens';

export type MainStackParamList = {
  Home: undefined;
  CreditEntryDetail: {entryId: string};
  CreateCreditEntry: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const ProfileButton = ({onPress}: {onPress: () => void}) => (
  <TouchableOpacity onPress={onPress} style={styles.profileButton}>
    <Text style={styles.profileButtonText}>Profile</Text>
  </TouchableOpacity>
);

const HomeHeaderRight = ({navigation}: {navigation: any}) => {
  const handlePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  return <ProfileButton onPress={handlePress} />;
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({navigation}) => ({
          headerShown: true,
          title: 'Credit Tracker',
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => <HomeHeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="CreditEntryDetail"
        component={CreditEntryDetailScreen}
        options={{
          title: 'Entry Details',
        }}
      />
      <Stack.Screen
        name="CreateCreditEntry"
        component={CreateCreditEntryScreen}
        options={{
          title: 'New Entry',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    paddingHorizontal: 8,
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
