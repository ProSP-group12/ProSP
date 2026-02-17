/**
 * Simple test app to check if the runtime is working
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    color: '#000',
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Image Recognition App</Text>
      <Text>Runtime is working!</Text>
    </View>
  );
}
