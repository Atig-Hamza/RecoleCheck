import { auth } from '@/config/firebase';
import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields to continue.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand header */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={32} color={AppColors.white} />
          </View>
          <Text style={styles.brandName}>RecolteCheck</Text>
          <Text style={styles.brandTagline}>Smart farm management, simplified</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={AppColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={AppColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={AppColors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={AppColors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}> Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: 40 },
  brandSection: { alignItems: 'center', marginBottom: 36 },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 15,
    color: AppColors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: 0.1,
  },
  formCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    ...Shadows.md,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: Radius.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  eyeIcon: { padding: Spacing.xs },
  button: {
    backgroundColor: AppColors.primary,
    paddingVertical: 15,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: AppColors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: { fontSize: 14, color: AppColors.textSecondary },
  footerLink: { fontSize: 14, color: AppColors.primary, fontWeight: '700' },
});
