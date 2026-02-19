// ui.js
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Centralized color management for the entire application
export const THEME_COLORS = {
  primary: '#2DD4BF',      // Mint Blue-Green theme
  secondary: '#FFFFFF',
  background: '#F5F5F5',   // Light gray background
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#333333',
  border: '#2DD4BF',       // Border follows primary theme
  tabInactive: '#64748B',  // Muted color for inactive tabs
  shadow: '#000000',
};

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: THEME_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    color: THEME_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: THEME_COLORS.textSecondary,
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
    backgroundColor: THEME_COLORS.primary,
  },
  secondary: {
    backgroundColor: THEME_COLORS.card,
    borderColor: THEME_COLORS.border,
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
    color: THEME_COLORS.text,
  },
  textSecondary: {
    color: THEME_COLORS.text,
  },
});