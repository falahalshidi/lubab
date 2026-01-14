import { User } from '@/types';
import { demoUsers } from './data';

const STORAGE_KEY = 'lubab_user';
const PROGRESS_KEY = 'lubab_progress';
const STUDENT_SETUP_KEY = 'lubab_student_setup';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// تسجيل الدخول
export function login(email: string, password: string): User | null {
  const user = demoUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    // حفظ في localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  return null;
}

// تسجيل الخروج
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// الحصول على المستخدم الحالي
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// التحقق من المصادقة
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// حفظ التقدم
export function saveProgress(progress: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// الحصول على التقدم
export function getProgress(): any {
  if (typeof window === 'undefined') return null;

  const progressStr = localStorage.getItem(PROGRESS_KEY);
  if (!progressStr) return null;

  try {
    return JSON.parse(progressStr);
  } catch {
    return null;
  }
}

// تهيئة التقدم الافتراضي
export function initializeProgress(studentId: string) {
  const existing = getProgress();
  if (existing && existing.studentId === studentId) {
    return existing;
  }

  const defaultProgress = {
    studentId,
    lessonsCompleted: [],
    quizzesCompleted: [],
    subjectsProgress: [],
    studyPlan: [],
    weakPoints: [],
    strengths: [],
  };

  saveProgress(defaultProgress);
  return defaultProgress;
}

// حفظ إعدادات الطالب
export function saveStudentSetup(setup: { name: string; gradeId: string; subjectIds: string[] }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STUDENT_SETUP_KEY, JSON.stringify(setup));
  
  // تحديث اسم المستخدم
  const user = getCurrentUser();
  if (user) {
    user.name = setup.name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

// الحصول على إعدادات الطالب
export function getStudentSetup(): { name: string; gradeId: string; subjectIds: string[] } | null {
  if (typeof window === 'undefined') return null;

  const setupStr = localStorage.getItem(STUDENT_SETUP_KEY);
  if (!setupStr) return null;

  try {
    return JSON.parse(setupStr);
  } catch {
    return null;
  }
}

