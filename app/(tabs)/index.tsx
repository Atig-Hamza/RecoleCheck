import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getParcelles, getUserProfile } from '@/services/firestore';
import { Parcelle, UserProfile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        setLoading(true);
        try {
          const [p, pars] = await Promise.all([
            getUserProfile(user.uid),
            getParcelles(user.uid),
          ]);
          setProfile(p);
          setParcelles(pars);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [user])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const name = profile ? `${profile.prenom} ${profile.nom}` : 'Farmer';
  const totalHectares = parcelles.reduce((sum, p) => sum + p.surface, 0);
  const uniqueCrops = [...new Set(parcelles.flatMap((p) => p.cultures))];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero / Greeting */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroGreeting}>Good morning,</Text>
            <Text style={styles.heroName}>{name}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={AppColors.white} />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardHighlight]}>
          <View style={styles.statIconWrap}>
            <Ionicons name="layers-outline" size={20} color={AppColors.primary} />
          </View>
          <Text style={styles.statNumber}>{parcelles.length}</Text>
          <Text style={styles.statLabel}>Total Plots</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: AppColors.accentLight }]}>
            <Ionicons name="resize-outline" size={20} color={AppColors.accent} />
          </View>
          <Text style={styles.statNumber}>{totalHectares.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Hectares</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: '#EDE7F6' }]}>
            <Ionicons name="nutrition-outline" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.statNumber}>{uniqueCrops.length}</Text>
          <Text style={styles.statLabel}>Crop Types</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity
        style={styles.primaryAction}
        onPress={() => router.push('/parcelle/form')}
        activeOpacity={0.85}
      >
        <View style={styles.actionLeft}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="add" size={24} color={AppColors.white} />
          </View>
          <View>
            <Text style={styles.actionTitle}>Add New Plot</Text>
            <Text style={styles.actionSubtitle}>Register a new agricultural land</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={AppColors.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryAction}
        onPress={() => router.push('/(tabs)/parcelles')}
        activeOpacity={0.85}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconCircle, styles.secondaryIconCircle]}>
            <Ionicons name="list" size={20} color={AppColors.primary} />
          </View>
          <View>
            <Text style={[styles.actionTitle, styles.secondaryActionTitle]}>View All Plots</Text>
            <Text style={styles.actionSubtitle}>Browse & manage your lands</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
      </TouchableOpacity>

      {/* Recent crops preview */}
      {uniqueCrops.length > 0 && (
        <View style={styles.cropsSection}>
          <Text style={styles.sectionTitle}>Active Crops</Text>
          <View style={styles.chipRow}>
            {uniqueCrops.slice(0, 8).map((crop, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{crop}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background },

  // Hero
  hero: {
    backgroundColor: AppColors.primary,
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroGreeting: { fontSize: 15, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.2 },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.white,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    marginTop: -20,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  statCardHighlight: {},
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppColors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },

  // Actions
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.primary,
    marginHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.white,
    marginHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIconCircle: {
    backgroundColor: AppColors.successLight,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 1,
  },
  secondaryActionTitle: { color: AppColors.text },
  actionSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  // Crops
  cropsSection: { marginTop: Spacing.sm },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: AppColors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  chipText: { fontSize: 13, color: AppColors.primaryDark, fontWeight: '600' },
});
