import { auth } from '@/config/firebase';
import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, setUserProfile } from '@/services/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
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

export default function ProfileScreen() {
  const { user } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        setLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setNom(profile.nom);
            setPrenom(profile.prenom);
            setTelephone(profile.telephone);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [user])
  );

  const handleSave = async () => {
    if (!user) return;
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Error', 'Please fill in both first and last name.');
      return;
    }
    setSaving(true);
    try {
      await setUserProfile(user.uid, {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: user.email || '',
      });
      Alert.alert('Saved', 'Your profile has been updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(auth),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const displayName = prenom && nom ? `${prenom} ${nom}` : user?.email ?? '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color={AppColors.white} />
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <View style={styles.roleChip}>
            <Ionicons name="leaf" size={12} color={AppColors.primary} />
            <Text style={styles.roleChipText}>Farmer</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Personal Information</Text>

          <Text style={styles.label}>LAST NAME</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Your last name"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>FIRST NAME</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={prenom}
              onChangeText={setPrenom}
              placeholder="Your first name"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>PHONE</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              placeholder="0612345678"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>EMAIL</Text>
          <View style={[styles.inputWrap, styles.readonlyWrap]}>
            <Ionicons name="mail-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <Text style={styles.readonlyText}>{user?.email}</Text>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={AppColors.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={AppColors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background },
  scroll: { paddingBottom: 20 },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.3,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  roleChipText: { fontSize: 12, fontWeight: '600', color: AppColors.primary },

  // Form card
  formCard: {
    backgroundColor: AppColors.white,
    margin: Spacing.xxl,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
    paddingVertical: 14,
  },
  readonlyWrap: {
    backgroundColor: AppColors.background,
  },
  readonlyText: {
    fontSize: 15,
    color: AppColors.textSecondary,
    paddingVertical: 14,
  },

  // Save
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    marginHorizontal: Spacing.xxl,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  saveButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.white,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.md,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: AppColors.danger,
  },
  logoutText: {
    color: AppColors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});
