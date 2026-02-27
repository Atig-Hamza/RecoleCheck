# RecoleCheck - وثائق المشروع

## A) الشاشات المطلوبة (10 شاشات فقط)

| # | الشاشة | الملف | الوصف |
|---|--------|------|-------|
| 1 | تسجيل الدخول | `app/(auth)/login.tsx` | إدخال البريد وكلمة المرور |
| 2 | إنشاء حساب | `app/(auth)/register.tsx` | تسجيل فلاح جديد |
| 3 | الرئيسية | `app/(tabs)/index.tsx` | لوحة القيادة - ملخص الأراضي |
| 4 | قائمة الأراضي | `app/(tabs)/parcelles.tsx` | عرض جميع الأراضي |
| 5 | الملف الشخصي | `app/(tabs)/profile.tsx` | تعديل المعلومات + تسجيل الخروج |
| 6 | تفاصيل الأرض | `app/parcelle/[id].tsx` | عرض أرض + المناطق التابعة لها |
| 7 | نموذج الأرض | `app/parcelle/form.tsx` | إضافة/تعديل أرض |
| 8 | تفاصيل المنطقة | `app/zone/[id].tsx` | عرض منطقة + سجل المحاصيل |
| 9 | نموذج المنطقة | `app/zone/form.tsx` | إضافة/تعديل منطقة |
| 10 | نموذج المحصول | `app/recolte/form.tsx` | إضافة/تعديل محصول |

---

## B) نموذج بيانات Firestore

```
users/{userId}                               ← وثيقة المستخدم (فلاح)
│   ├── nom: string                          ← الاسم العائلي
│   ├── prenom: string                       ← الاسم الشخصي
│   ├── telephone: string                    ← رقم الهاتف
│   ├── email: string                        ← البريد الإلكتروني
│   └── createdAt: number                    ← تاريخ الإنشاء (timestamp)
│
└── parcelles/{parcelleId}                   ← مجموعة فرعية: الأراضي
    │   ├── nom: string                      ← اسم الأرض
    │   ├── surface: number                  ← المساحة (هكتار)
    │   ├── cultures: string[]               ← أنواع الزراعات
    │   ├── periodeRecolte: string           ← فترة الحصاد
    │   └── createdAt: number                ← تاريخ الإنشاء
    │
    └── zones/{zoneId}                       ← مجموعة فرعية: المناطق
        │   ├── nom: string                  ← اسم المنطقة
        │   ├── description: string          ← وصف المنطقة
        │   └── createdAt: number            ← تاريخ الإنشاء
        │
        └── recoltes/{recolteId}             ← مجموعة فرعية: المحاصيل
                ├── date: number             ← تاريخ الحصاد (timestamp)
                ├── poids: number            ← الوزن (كيلوغرام)
                ├── culture: string          ← نوع الزراعة
                ├── notes: string            ← ملاحظات
                └── createdAt: number        ← تاريخ الإنشاء
```

### العلاقات:
- **users** → أعلى مستوى (1 وثيقة لكل فلاح)
- **parcelles** → مجموعة فرعية تحت user (1 فلاح → عدة أراضي)
- **zones** → مجموعة فرعية تحت parcelle (1 أرض → عدة مناطق)
- **recoltes** → مجموعة فرعية تحت zone (1 منطقة → عدة محاصيل = سجل تاريخي)

---

## C) خطوات إعداد Firebase Auth

1. **إنشاء مشروع Firebase:**
   - اذهب إلى [Firebase Console](https://console.firebase.google.com)
   - أنشئ مشروع جديد باسم "RecoleCheck"

2. **تفعيل المصادقة:**
   - في لوحة Firebase → Authentication → Sign-in method
   - فعّل "Email/Password"

3. **إضافة التطبيقات:**
   - أضف تطبيق Android (package name من `app.json`)
   - أضف تطبيق iOS (bundle ID من `app.json`)
   - أضف تطبيق Web (للحصول على firebaseConfig)

4. **نسخ إعدادات Firebase:**
   - من Project Settings → General → Your apps → Web app
   - انسخ كائن `firebaseConfig`
   - ألصقه في `config/firebase.ts`

5. **إعداد Firestore:**
   - في لوحة Firebase → Firestore Database
   - أنشئ قاعدة بيانات في وضع الإنتاج
   - انسخ القواعد من `firestore.rules` إلى Rules tab

---

## D) قواعد أمان Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // كل فلاح يمكنه فقط الوصول إلى بياناته الخاصة
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // منع أي وصول آخر
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**الشرح:**
- `request.auth != null` → المستخدم مسجل الدخول
- `request.auth.uid == userId` → يصل فقط إلى بياناته
- `{document=**}` → القاعدة تنطبق على جميع المجموعات الفرعية (parcelles, zones, recoltes)

---

## E) خطة التنفيذ (Milestones)

### المرحلة 1: الأساسيات ✅
- [x] إعداد مشروع Expo مع TypeScript
- [x] تثبيت Firebase JS SDK
- [x] إعداد ملف إعدادات Firebase (`config/firebase.ts`)
- [x] تعريف الأنواع TypeScript (`types/index.ts`)
- [x] إنشاء services layer (`services/firestore.ts`)

### المرحلة 2: المصادقة (Auth) ✅
- [x] إنشاء AuthContext و AuthProvider
- [x] شاشة تسجيل الدخول (login)
- [x] شاشة إنشاء حساب (register)
- [x] حماية المسارات (redirect مبني على حالة المصادقة)
- [x] تسجيل الخروج

### المرحلة 3: الملف الشخصي (Profile CRUD) ✅
- [x] شاشة عرض/تعديل الملف الشخصي
- [x] حفظ المعلومات في Firestore
- [x] عرض نوع الحساب: فلاح (Agriculteur)

### المرحلة 4: الأراضي (Parcelles CRUD) ✅
- [x] قائمة الأراضي (مع حالة فارغة)
- [x] نموذج إضافة أرض جديدة
- [x] عرض تفاصيل أرض
- [x] تعديل أرض
- [x] حذف أرض
- [x] الحقول: اسم، مساحة، زراعات، فترة الحصاد

### المرحلة 5: الزراعات والمناطق ✅
- [x] الزراعات (cultures) كحقل مصفوفة في الأرض
- [x] المناطق (zones) كمجموعة فرعية
- [x] نموذج إضافة/تعديل منطقة
- [x] عرض قائمة المناطق في تفاصيل الأرض
- [x] حذف منطقة

### المرحلة 6: المحاصيل وسجل الحصاد ✅
- [x] نموذج إضافة محصول (تاريخ، وزن، نوع، ملاحظات)
- [x] عرض سجل المحاصيل في تفاصيل المنطقة (مرتب بالتاريخ)
- [x] تعديل محصول
- [x] حذف محصول
- [x] إجمالي الإنتاج لكل منطقة

### المرحلة 7: المزامنة السحابية ✅
- [x] جميع البيانات مخزنة في Firebase Firestore (cloud)
- [x] المزامنة تتم تلقائياً عند كل عملية CRUD
- [x] بيانات Firebase Auth محفوظة محلياً (AsyncStorage)

---

## F) الافتراضات (Assumptions)

1. **المصادقة:** بريد إلكتروني + كلمة مرور فقط (بدون Google/Facebook)
2. **التاريخ:** يُدخل يدوياً بصيغة يوم/شهر/سنة (بدون date picker خارجي)
3. **الزراعات:** تُدخل كنص مفصول بفواصل في حقل الأرض
4. **أوزان الحصاد:** بالكيلوغرام
5. **اللغة:** واجهة عربية كاملة (MSA)
6. **الوضع:** وضع فاتح فقط (بدون dark mode)

---

## التحقق من المتطلبات (Verification Against Requirements)

| # | المتطلب | الحالة | التنفيذ |
|---|---------|--------|---------|
| 1 | المصادقة عبر Firebase Authentication | ✅ | `app/(auth)/login.tsx`, `app/(auth)/register.tsx`, `contexts/AuthContext.tsx` |
| 2 | نوع واحد فقط: "Agriculteur" | ✅ | لا يوجد اختيار أدوار - كل مستخدم هو فلاح. ظاهر في `app/(tabs)/profile.tsx` |
| 3 | إدارة المعلومات الشخصية | ✅ | `app/(tabs)/profile.tsx` + `services/firestore.ts` (CRUD المستخدم) |
| 4 | إدارة الأراضي (مساحة، زراعات، فترة حصاد، أوزان) | ✅ | `app/(tabs)/parcelles.tsx`, `app/parcelle/[id].tsx`, `app/parcelle/form.tsx` |
| 5 | تتبع المحاصيل بالمنطقة + سجل تاريخي | ✅ | `app/zone/[id].tsx` (سجل كامل), `app/recolte/form.tsx`, المحاصيل مرتبة بالتاريخ |
| 6 | مركزة ومزامنة البيانات عبر السحابة | ✅ | Firestore (cloud) + `services/firestore.ts` - كل العمليات متزامنة تلقائياً |
| 7 | التطبيق يعمل على Android و iOS | ✅ | React Native (Expo) - مشروع واحد لكلا المنصتين |

---

## Stack التقني

- **Framework:** React Native (Expo SDK 54) مع TypeScript
- **Routing:** Expo Router v6 (file-based routing)
- **Backend:** Firebase (Authentication + Firestore)
- **State:** React Context (AuthContext)
- **Persistence:** AsyncStorage (لحفظ جلسة المصادقة محلياً)

---

## بنية المشروع

```
config/
  firebase.ts              ← إعدادات Firebase
types/
  index.ts                 ← تعريف الأنواع
utils/
  helpers.ts               ← دوال مساعدة (تنسيق التاريخ)
constants/
  colors.ts                ← ألوان التطبيق
contexts/
  AuthContext.tsx           ← سياق المصادقة
services/
  firestore.ts             ← عمليات CRUD مع Firestore
app/
  _layout.tsx              ← التخطيط الرئيسي + حماية المسارات
  (auth)/
    _layout.tsx            ← تخطيط شاشات المصادقة
    login.tsx              ← تسجيل الدخول
    register.tsx           ← إنشاء حساب
  (tabs)/
    _layout.tsx            ← تخطيط التبويبات (3 تبويبات)
    index.tsx              ← الرئيسية
    parcelles.tsx          ← قائمة الأراضي
    profile.tsx            ← الملف الشخصي
  parcelle/
    [id].tsx               ← تفاصيل أرض
    form.tsx               ← نموذج أرض
  zone/
    [id].tsx               ← تفاصيل منطقة + سجل محاصيل
    form.tsx               ← نموذج منطقة
  recolte/
    form.tsx               ← نموذج محصول
firestore.rules            ← قواعد أمان Firestore
```
