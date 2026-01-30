/**
 * Image Recognition Vocabulary Learning App
 */

import { StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import ImageRecognitionComponent from './src/components/ImageRecognitionComponent';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ImageRecognitionComponent />
    </SafeAreaProvider>
  );
}

export default App;
