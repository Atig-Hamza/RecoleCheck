import { auth } from '@/config/firebase';
import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { setUserProfile } from '@/services/firestore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setUserProfile(cred.user.uid, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: '',
        email: email.trim(),
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email Taken', 'This email is already associated with an account.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
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
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Start managing your farm today</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="John"
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Doe"
                  placeholderTextColor={AppColors.textMuted}
                />
              </View>
            </View>
          </View>

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
              secureTextEntry
              placeholder="Min. 6 characters"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark-outline" size={18} color={AppColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter your password"
              placeholderTextColor={AppColors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingTop: 60, paddingBottom: 40 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  headerSection: { marginBottom: Spacing.xxl },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: AppColors.textSecondary,
    letterSpacing: 0.1,
  },
  formCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    ...Shadows.md,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nameField: { flex: 1 },
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
