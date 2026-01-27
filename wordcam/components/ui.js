import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function SubTitle({ children, style }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
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

