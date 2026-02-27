import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { addParcelle, getParcelle, updateParcelle } from '@/services/firestore';
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

export default function ParcelleFormScreen() {
  const { parcelleId } = useLocalSearchParams<{ parcelleId?: string }>();
  const { user } = useAuth();
  const isEdit = !!parcelleId;

  const [nom, setNom] = useState('');
  const [surface, setSurface] = useState('');
  const [cultures, setCultures] = useState('');
  const [periodeRecolte, setPeriodeRecolte] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && user) {
      (async () => {
        try {
          const p = await getParcelle(user.uid, parcelleId!);
          if (p) {
            setNom(p.nom);
            setSurface(p.surface.toString());
            setCultures(p.cultures.join(', '));
            setPeriodeRecolte(p.periodeRecolte);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setInitialLoading(false);
        }
      })();
    }
  }, [isEdit, parcelleId, user]);

  const handleSave = async () => {
    if (!user) return;
    if (!nom.trim()) {
      Alert.alert('Error', 'Please enter a plot name.');
      return;
    }
    const surfaceNum = parseFloat(surface);
    if (isNaN(surfaceNum) || surfaceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid area in hectares.');
      return;
    }

    const culturesArr = cultures
      .split(/[,،]/)
      .map((c) => c.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const data = {
        nom: nom.trim(),
        surface: surfaceNum,
        cultures: culturesArr,
        periodeRecolte: periodeRecolte.trim(),
      };

      if (isEdit) {
        await updateParcelle(user.uid, parcelleId!, data);
      } else {
        await addParcelle(user.uid, data);
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
      <Stack.Screen options={{ title: isEdit ? 'Edit Plot' : 'New Plot' }} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isEdit ? 'Edit Plot Details' : 'Plot Information'}</Text>

          <Text style={styles.label}>PLOT NAME *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="leaf-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="e.g. Olive Grove"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>AREA (HECTARES) *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="resize-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={surface}
              onChangeText={setSurface}
              keyboardType="decimal-pad"
              placeholder="e.g. 2.5"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>CROPS (COMMA-SEPARATED)</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="nutrition-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cultures}
              onChangeText={setCultures}
              placeholder="e.g. Tomatoes, Potatoes, Wheat"
              placeholderTextColor={AppColors.textTertiary}
            />
          </View>

          <Text style={styles.label}>HARVEST PERIOD</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="calendar-outline" size={18} color={AppColors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={periodeRecolte}
              onChangeText={setPeriodeRecolte}
              placeholder="e.g. June - September"
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
              <Text style={styles.buttonText}>{isEdit ? 'Update Plot' : 'Add Plot'}</Text>
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
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
    paddingVertical: 14,
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
