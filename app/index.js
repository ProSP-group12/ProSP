import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from '../screens/MainScreen.js';
import SavedWordsScreen from '../screens/SavedWordsScreen.js';
import WordDetailsScreen from '../screens/WordDetailsScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Saved Words → Word Details
function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedWords" component={SavedWordsScreen} />
      <Stack.Screen name="WordDetails" component={WordDetailsScreen} />
    </Stack.Navigator>
  );
}

// Main App with Tabs
export default function Main() {
  return (
    <Tab.Navigator
      screenOptions={{
        // headerStyle: { backgroundColor: '#000' },
        // headerTintColor: '#fff',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: 'white',
      }}
    >
      <Tab.Screen
        name="Camera"
        component={MainScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="camera-alt" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedStack} // <-- use the stack here
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
