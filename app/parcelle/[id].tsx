import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { deleteParcelle, getParcelle, getZones } from '@/services/firestore';
import { Parcelle, Zone } from '@/types';
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
    View
} from 'react-native';

export default function ParcelleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const [p, z] = await Promise.all([
        getParcelle(user.uid, id),
        getZones(user.uid, id),
      ]);
      setParcelle(p);
      setZones(z);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = () => {
    Alert.alert('Delete Plot', 'Are you sure you want to delete this plot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParcelle(user!.uid, id!);
            router.back();
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

  if (!parcelle) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={AppColors.danger} />
        <Text style={styles.errorText}>Plot not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: parcelle.nom }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="leaf" size={28} color={AppColors.primary} />
          </View>
          <Text style={styles.heroTitle}>{parcelle.nom}</Text>

          {/* Info rows */}
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={18} color={AppColors.textTertiary} />
            <Text style={styles.infoLabel}>Area</Text>
            <Text style={styles.infoValue}>{parcelle.surface} hectares</Text>
          </View>

          {parcelle.cultures.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="nutrition-outline" size={18} color={AppColors.textTertiary} />
              <Text style={styles.infoLabel}>Crops</Text>
              <Text style={styles.infoValue}>{parcelle.cultures.join(', ')}</Text>
            </View>
          )}

          {parcelle.periodeRecolte ? (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.textTertiary} />
              <Text style={styles.infoLabel}>Harvest</Text>
              <Text style={styles.infoValue}>{parcelle.periodeRecolte}</Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({ pathname: '/parcelle/form', params: { parcelleId: id } })
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

        {/* Zones section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zones ({zones.length})</Text>
            <TouchableOpacity
              style={styles.addZoneButton}
              onPress={() =>
                router.push({ pathname: '/zone/form', params: { parcelleId: id } })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color={AppColors.white} />
              <Text style={styles.addZoneText}>Add Zone</Text>
            </TouchableOpacity>
          </View>

          {zones.length === 0 ? (
            <View style={styles.emptyZones}>
              <Ionicons name="grid-outline" size={36} color={AppColors.textTertiary} />
              <Text style={styles.emptyText}>No zones yet</Text>
              <Text style={styles.emptySubtext}>Divide your plot into zones to track harvests</Text>
            </View>
          ) : (
            zones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={styles.zoneCard}
                onPress={() =>
                  router.push({
                    pathname: '/zone/[id]',
                    params: { id: zone.id, parcelleId: id },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.zoneRow}>
                  <View style={styles.zoneIconWrap}>
                    <Ionicons name="grid" size={18} color={AppColors.accent} />
                  </View>
                  <View style={styles.zoneContent}>
                    <Text style={styles.zoneName}>{zone.nom}</Text>
                    {zone.description ? (
                      <Text style={styles.zoneDesc} numberOfLines={1}>{zone.description}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textTertiary} />
                </View>
              </TouchableOpacity>
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
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: AppColors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: Spacing.sm,
  },
  infoLabel: { fontSize: 14, color: AppColors.textSecondary, fontWeight: '500', width: 70 },
  infoValue: { fontSize: 14, color: AppColors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
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

  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
  addZoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addZoneText: { color: AppColors.white, fontSize: 13, fontWeight: '600' },

  // Empty
  emptyZones: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: AppColors.text, marginTop: Spacing.md },
  emptySubtext: { fontSize: 13, color: AppColors.textSecondary, marginTop: 4, textAlign: 'center' },

  // Zone card
  zoneCard: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  zoneRow: { flexDirection: 'row', alignItems: 'center' },
  zoneIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AppColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  zoneContent: { flex: 1 },
  zoneName: { fontSize: 15, fontWeight: '700', color: AppColors.text },
  zoneDesc: { fontSize: 13, color: AppColors.textSecondary, marginTop: 2 },
});
