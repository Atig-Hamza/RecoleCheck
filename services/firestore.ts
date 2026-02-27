import { db } from '@/config/firebase';
import { Parcelle, Recolte, UserProfile, Zone } from '@/types';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

// ===================== ملف المستخدم =====================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(userId: string, data: Omit<UserProfile, 'createdAt'>) {
  await setDoc(doc(db, 'users', userId), { ...data, createdAt: Date.now() }, { merge: true });
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', userId), data);
}

// ===================== الأراضي =====================

function parcellesCol(userId: string) {
  return collection(db, 'users', userId, 'parcelles');
}

export async function getParcelles(userId: string): Promise<Parcelle[]> {
  const q = query(parcellesCol(userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Parcelle));
}

export async function getParcelle(userId: string, parcelleId: string): Promise<Parcelle | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'parcelles', parcelleId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Parcelle) : null;
}

export async function addParcelle(userId: string, data: Omit<Parcelle, 'id' | 'createdAt'>) {
  return addDoc(parcellesCol(userId), { ...data, createdAt: Date.now() });
}

export async function updateParcelle(userId: string, parcelleId: string, data: Partial<Parcelle>) {
  await updateDoc(doc(db, 'users', userId, 'parcelles', parcelleId), data);
}

export async function deleteParcelle(userId: string, parcelleId: string) {
  await deleteDoc(doc(db, 'users', userId, 'parcelles', parcelleId));
}

// ===================== المناطق =====================

function zonesCol(userId: string, parcelleId: string) {
  return collection(db, 'users', userId, 'parcelles', parcelleId, 'zones');
}

export async function getZones(userId: string, parcelleId: string): Promise<Zone[]> {
  const q = query(zonesCol(userId, parcelleId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zone));
}

export async function getZone(userId: string, parcelleId: string, zoneId: string): Promise<Zone | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Zone) : null;
}

export async function addZone(userId: string, parcelleId: string, data: Omit<Zone, 'id' | 'createdAt'>) {
  return addDoc(zonesCol(userId, parcelleId), { ...data, createdAt: Date.now() });
}

export async function updateZone(userId: string, parcelleId: string, zoneId: string, data: Partial<Zone>) {
  await updateDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId), data);
}

export async function deleteZone(userId: string, parcelleId: string, zoneId: string) {
  await deleteDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId));
}

// ===================== المحاصيل =====================

function recoltesCol(userId: string, parcelleId: string, zoneId: string) {
  return collection(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes');
}

export async function getRecoltes(userId: string, parcelleId: string, zoneId: string): Promise<Recolte[]> {
  const q = query(recoltesCol(userId, parcelleId, zoneId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recolte));
}

export async function addRecolte(
  userId: string,
  parcelleId: string,
  zoneId: string,
  data: Omit<Recolte, 'id' | 'createdAt'>
) {
  return addDoc(recoltesCol(userId, parcelleId, zoneId), { ...data, createdAt: Date.now() });
}

export async function updateRecolte(
  userId: string,
  parcelleId: string,
  zoneId: string,
  recolteId: string,
  data: Partial<Recolte>
) {
  await updateDoc(
    doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes', recolteId),
    data
  );
}

export async function deleteRecolte(
  userId: string,
  parcelleId: string,
  zoneId: string,
  recolteId: string
) {
  await deleteDoc(
    doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes', recolteId)
  );
}
