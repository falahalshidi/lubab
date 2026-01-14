// أنواع البيانات الأساسية للمشروع

export type UserRole = 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  studentId?: string; // للوالدين
}

export interface Grade {
  id: string;
  name: string;
  level: number;
  available: boolean;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradeId: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  subjectId: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  quizId: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: Question[];
  timeLimit?: number; // بالدقائق
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface QuizResult {
  quizId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  answers: AnswerRecord[];
  completedAt: Date;
  weakPoints: string[];
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number; // بالثواني
}

export interface StudentProgress {
  studentId: string;
  lessonsCompleted: string[];
  quizzesCompleted: QuizResult[];
  subjectsProgress: SubjectProgress[];
  studyPlan: StudyPlanItem[];
  weakPoints: string[];
  strengths: string[];
}

export interface SubjectProgress {
  subjectId: string;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  lastAccessed?: Date;
}

export interface StudyPlanItem {
  id: string;
  date: Date;
  lessonId: string;
  subjectId: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  recommended: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  lessonId?: string;
}

export interface ParentReport {
  studentId: string;
  overallProgress: number;
  subjectsSummary: SubjectSummary[];
  recentActivity: ActivityItem[];
  recommendations: string[];
  alerts: Alert[];
}

export interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  progress: number;
  averageScore: number;
  lessonsCompleted: number;
  lastActivity: Date;
}

export interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'quiz_completed' | 'weak_point_detected';
  title: string;
  description: string;
  timestamp: Date;
  subjectId?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
}

