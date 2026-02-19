//ui.js
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Reusable Button component
export function Button({ title, onPress, disabled, variant = 'primary' }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.primary,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'secondary' ? styles.textSecondary : styles.textPrimary,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// Reusable Card container
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Reusable Title text component
export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

// Reusable SubTitle text component
export function SubTitle({ children, style }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

// Styles specifically for UI components
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    // Removed borders and added a soft shadow for a modern look
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#333333',
    fontSize: 14,
    marginTop: 6,
  },
  base: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#FFD700',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  textPrimary: {
    color: '#000000',
  },
  textSecondary: {
    color: '#000000',
  },
});