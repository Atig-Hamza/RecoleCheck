/** الملف الشخصي للفلاح */
export interface UserProfile {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  createdAt: number;
}

/** أرض زراعية */
export interface Parcelle {
  id: string;
  nom: string;
  surface: number; // هكتار
  cultures: string[];
  periodeRecolte: string;
  createdAt: number;
}

/** منطقة داخل أرض */
export interface Zone {
  id: string;
  nom: string;
  description: string;
  createdAt: number;
}

/** محصول (حصاد) */
export interface Recolte {
  id: string;
  date: number;
  poids: number; // كيلوغرام
  culture: string;
  notes: string;
  createdAt: number;
}
