import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { addRecolte, getRecoltes, updateRecolte } from '@/services/firestore';
import { formatDate, parseDate } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function RecolteFormScreen() {
  const { parcelleId, zoneId, recolteId } = useLocalSearchParams<{
    parcelleId: string;
    zoneId: string;
    recolteId?: string;
  }>();
  const { user } = useAuth();
  const isEdit = !!recolteId;

  const [dateStr, setDateStr] = useState('');
  const [poids, setPoids] = useState('');
  const [culture, setCulture] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && user && parcelleId && zoneId) {
      (async () => {
        try {
          const recoltes = await getRecoltes(user.uid, parcelleId, zoneId);
          const recolte = recoltes.find((r) => r.id === recolteId);
          if (recolte) {
            setDateStr(formatDate(recolte.date));
            setPoids(recolte.poids.toString());
            setCulture(recolte.culture);
            setNotes(recolte.notes);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setInitialLoading(false);
        }
      })();
    }
  }, [isEdit, parcelleId, zoneId, recolteId, user]);

  const handleSave = async () => {
    if (!user || !parcelleId || !zoneId) return;

    const dateTimestamp = parseDate(dateStr);
    if (!dateTimestamp) {
      Alert.alert('Error', 'Please enter a valid date (DD/MM/YYYY).');
      return;
    }

    const poidsNum = parseFloat(poids);
    if (isNaN(poidsNum) || poidsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weight.');
      return;
    }

    if (!culture.trim()) {
      Alert.alert('Error', 'Please enter the crop type.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        date: dateTimestamp,
        poids: poidsNum,
        culture: culture.trim(),
        notes: notes.trim(),
      };

      if (isEdit) {
        await updateRecolte(user.uid, parcelleId, zoneId, recolteId!, data);
      } else {
        await addRecolte(user.uid, parcelleId, zoneId, data);
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Something went wrong while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: isEdit ? 'Edit Harvest' : 'New Harvest' }} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isEdit ? 'Edit Harvest Record' : 'Harvest Details'}</Text>

          <Text style={styles.label}>DATE (DD/MM/YYYY) *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="calendar-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={dateStr}
              onChangeText={setDateStr}
              keyboardType="numbers-and-punctuation"
              placeholder="e.g. 15/06/2026"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>WEIGHT (KG) *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="scale-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={poids}
              onChangeText={setPoids}
              keyboardType="decimal-pad"
              placeholder="e.g. 150"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>CROP TYPE *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="leaf-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={culture}
              onChangeText={setCulture}
              placeholder="e.g. Tomatoes"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>NOTES</Text>
          <View style={[styles.inputWrap, styles.multilineWrap]}>
            <Ionicons name="document-text-outline" size={18} color={AppColors.textTertiary} style={styles.inputIconTop} />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Optional notes about this harvest"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <>
              <Ionicons name={isEdit ? 'checkmark-circle-outline' : 'add-circle-outline'} size={20} color={AppColors.white} />
              <Text style={styles.buttonText}>{isEdit ? 'Update Harvest' : 'Add Harvest'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background },
  scroll: { padding: Spacing.xxl, paddingBottom: 40 },
  formCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  formTitle: {
    fontSize: 18,
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
  multilineWrap: { alignItems: 'flex-start' },
  inputIcon: { marginRight: Spacing.sm },
  inputIconTop: { marginRight: Spacing.sm, marginTop: 16 },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    marginTop: Spacing.xxl,
    ...Shadows.md,
  },
  buttonText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
});
