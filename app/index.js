import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from '../screens/MainScreen.js';
import SavedWordsScreen from '../screens/SavedWordsScreen.js';
import WordDetailsScreen from '../screens/WordDetailsScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          height: 60, 
          borderTopWidth: 0, 
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#555',
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
        component={SavedStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
