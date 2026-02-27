import { AppColors, Radius, Shadows, Spacing } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getParcelles } from '@/services/firestore';
import { Parcelle } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ParcellesScreen() {
  const { user } = useAuth();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        setLoading(true);
        try {
          const data = await getParcelles(user.uid);
          setParcelles(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [user])
  );

  const renderItem = ({ item }: { item: Parcelle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/parcelle/[id]', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="leaf" size={22} color={AppColors.primary} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.nom}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.surface} ha</Text>
            </View>
          </View>
          {item.cultures.length > 0 && (
            <View style={styles.chipRow}>
              {item.cultures.slice(0, 3).map((c, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
              {item.cultures.length > 3 && (
                <Text style={styles.moreText}>+{item.cultures.length - 3}</Text>
              )}
            </View>
          )}
          {item.periodeRecolte ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color={AppColors.textSecondary} />
              <Text style={styles.metaText}>{item.periodeRecolte}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={AppColors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>My Plots</Text>
          <Text style={styles.subtitle}>{parcelles.length} registered plot{parcelles.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {parcelles.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="earth-outline" size={48} color={AppColors.textTertiary} />
          </View>
          <Text style={styles.emptyText}>No plots yet</Text>
          <Text style={styles.emptySubtext}>Add your first agricultural plot to get started</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/parcelle/form')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color={AppColors.white} />
            <Text style={styles.emptyButtonText}>Add Plot</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={parcelles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {parcelles.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/parcelle/form')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={AppColors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background },

  header: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  list: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: AppColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppColors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badge: {
    backgroundColor: AppColors.primaryLight + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: AppColors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: AppColors.textSecondary },
  moreText: { fontSize: 11, fontWeight: '600', color: AppColors.textTertiary, alignSelf: 'center' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaText: { fontSize: 12, color: AppColors.textSecondary },

  // Empty
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyText: { fontSize: 20, fontWeight: '700', color: AppColors.text, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: AppColors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xxl,
    gap: 6,
  },
  emptyButtonText: { fontSize: 15, fontWeight: '700', color: AppColors.white },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: AppColors.primary,
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});
