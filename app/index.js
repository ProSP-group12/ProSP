import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../screens/MainScreen';
import SavedWordsScreen from '../screens/SavedWordsScreen';

// const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function Main() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
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
        component={SavedWordsScreen}
        options={{
          title: "Saved Words",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

