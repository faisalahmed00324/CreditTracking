import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth} from '../context';
import {LoadingScreen} from '../components';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
