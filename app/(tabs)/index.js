import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../../screens/MainScreen';
import SavedWordsScreen from '../../screens/SavedWordsScreen';

const Stack = createNativeStackNavigator();

export default function Main() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Camera" component={MainScreen} />
        <Stack.Screen name="SavedWords" component={SavedWordsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
