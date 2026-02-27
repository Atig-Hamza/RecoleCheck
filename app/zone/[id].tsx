import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { deleteZone, getRecoltes, getZone } from '@/services/firestore';
import { Recolte, Zone } from '@/types';
import { formatDate } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ZoneDetailScreen() {
  const { id, parcelleId } = useLocalSearchParams<{ id: string; parcelleId: string }>();
  const { user } = useAuth();
  const [zone, setZone] = useState<Zone | null>(null);
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !id || !parcelleId) return;
    setLoading(true);
    try {
      const [z, r] = await Promise.all([
        getZone(user.uid, parcelleId, id),
        getRecoltes(user.uid, parcelleId, id),
      ]);
      setZone(z);
      setRecoltes(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, id, parcelleId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = () => {
    Alert.alert('Delete Zone', 'Are you sure you want to delete this zone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteZone(user!.uid, parcelleId!, id!);
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Something went wrong while deleting.');
          }
        },
      },
    ]);
  };

  const handleDeleteRecolte = (recolteId: string) => {
    Alert.alert('Delete Harvest', 'Are you sure you want to delete this harvest record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { deleteRecolte } = await import('@/services/firestore');
            await deleteRecolte(user!.uid, parcelleId!, id!, recolteId);
            loadData();
          } catch (e) {
            Alert.alert('Error', 'Something went wrong while deleting.');
          }
        },
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

  if (!zone) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={AppColors.danger} />
        <Text style={styles.errorText}>Zone not found</Text>
      </View>
    );
  }

  const totalPoids = recoltes.reduce((sum, r) => sum + r.poids, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: zone.nom }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Zone info card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="grid" size={26} color={AppColors.accent} />
          </View>
          <Text style={styles.heroTitle}>{zone.nom}</Text>
          {zone.description ? (
            <Text style={styles.heroDesc}>{zone.description}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: '/zone/form',
                  params: { parcelleId, zoneId: id },
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={18} color={AppColors.white} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.85}>
              <Ionicons name="trash-outline" size={18} color={AppColors.danger} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary strip */}
        {recoltes.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{totalPoids.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>kg total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{recoltes.length}</Text>
              <Text style={styles.summaryLabel}>harvests</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {recoltes.length > 0 ? (totalPoids / recoltes.length).toFixed(1) : '0'}
              </Text>
              <Text style={styles.summaryLabel}>kg avg</Text>
            </View>
          </View>
        )}

        {/* Harvest log */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Harvest Log</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push({
                  pathname: '/recolte/form',
                  params: { parcelleId, zoneId: id },
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color={AppColors.white} />
              <Text style={styles.addButtonText}>Add Harvest</Text>
            </TouchableOpacity>
          </View>

          {recoltes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="analytics-outline" size={36} color={AppColors.textTertiary} />
              <Text style={styles.emptyText}>No harvests recorded yet</Text>
              <Text style={styles.emptySubtext}>Start logging your crop yields</Text>
            </View>
          ) : (
            recoltes.map((recolte) => (
              <View key={recolte.id} style={styles.recolteCard}>
                <View style={styles.recolteTop}>
                  <View style={styles.recolteDateWrap}>
                    <Ionicons name="calendar-outline" size={14} color={AppColors.textSecondary} />
                    <Text style={styles.recolteDate}>{formatDate(recolte.date)}</Text>
                  </View>
                  <View style={styles.weightBadge}>
                    <Text style={styles.weightText}>{recolte.poids} kg</Text>
                  </View>
                </View>

                <View style={styles.recolteCropRow}>
                  <Ionicons name="leaf-outline" size={14} color={AppColors.primary} />
                  <Text style={styles.recolteCropText}>{recolte.culture}</Text>
                </View>

                {recolte.notes ? (
                  <Text style={styles.recolteNotes}>{recolte.notes}</Text>
                ) : null}

                <View style={styles.recolteActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/recolte/form',
                        params: { parcelleId, zoneId: id, recolteId: recolte.id },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={14} color={AppColors.primary} />
                    <Text style={styles.actionLink}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteRecolte(recolte.id)}>
                    <Ionicons name="trash-outline" size={14} color={AppColors.danger} />
                    <Text style={[styles.actionLink, styles.dangerLink]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background, gap: 12 },
  scroll: { padding: Spacing.xxl, paddingBottom: 40 },
  errorText: { fontSize: 16, color: AppColors.danger, fontWeight: '600' },

  // Hero
  heroCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: AppColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.primary,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  editButtonText: { color: AppColors.white, fontSize: 15, fontWeight: '700' },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: AppColors.white,
    borderWidth: 1.5,
    borderColor: AppColors.danger,
    paddingVertical: 13,
    borderRadius: Radius.lg,
  },
  deleteButtonText: { color: AppColors.danger, fontSize: 15, fontWeight: '700' },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: 20, fontWeight: '800', color: AppColors.text },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: AppColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  summaryDivider: { width: 1, backgroundColor: AppColors.border, marginVertical: 4 },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addButtonText: { color: AppColors.white, fontSize: 13, fontWeight: '600' },

  // Empty
  emptyCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: AppColors.text, marginTop: Spacing.md },
  emptySubtext: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4 },

  // Recolte card
  recolteCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  recolteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recolteDateWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recolteDate: { fontSize: 13, color: AppColors.textSecondary, fontWeight: '500' },
  weightBadge: {
    backgroundColor: AppColors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  weightText: { fontSize: 13, fontWeight: '700', color: AppColors.primaryDark },
  recolteCropRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  recolteCropText: { fontSize: 14, fontWeight: '600', color: AppColors.text },
  recolteNotes: { fontSize: 13, color: AppColors.textSecondary, lineHeight: 18, marginBottom: 4 },
  recolteActions: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLink: { fontSize: 13, color: AppColors.primary, fontWeight: '600' },
  dangerLink: { color: AppColors.danger },
});
