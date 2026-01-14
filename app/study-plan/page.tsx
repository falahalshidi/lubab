'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CheckCircle, Clock, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { getCurrentUser, getProgress } from '@/lib/auth';
import { subjects, getLessonById, getSubjectById } from '@/lib/data';
import { generateStudyPlan } from '@/lib/ai-simulator';

export default function StudyPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    const progressData = getProgress();
    if (!progressData) {
      router.push('/dashboard');
      return;
    }

    setProgress(progressData);

    // إنشاء خطة دراسية
    const allLessons = subjects.flatMap((s) =>
      s.lessons.map((l) => ({ ...l, subjectId: s.id }))
    );
    const availableLessons = allLessons.filter(
      (l) => !progressData.lessonsCompleted.includes(l.id)
    );

    const plan = generateStudyPlan(progressData.weakPoints || [], availableLessons);
    setStudyPlan(plan);
    setLoading(false);
  }, [router]);

  if (loading || !user || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // تجميع الخطة حسب اليوم
  const planByDay = studyPlan.reduce((acc: Record<string, any[]>, item: any) => {
    const dateKey = item.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const getDayName = (date: Date) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const completedCount = studyPlan.filter((item) => item.completed).length;
  const totalCount = studyPlan.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الخطة الدراسية</h1>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{completionRate}%</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">معدل الإنجاز</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <span className="text-2xl sm:text-3xl font-bold text-green-600">{completedCount}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">مهام مكتملة</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                {totalCount - completedCount}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">مهام متبقية</p>
          </div>
        </div>

        {/* Weekly Plan */}
        <div className="space-y-6">
          {Object.entries(planByDay).map(([dateKey, items]) => {
            const date = new Date(dateKey);
            return (
              <div key={dateKey} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div
                  className={`p-4 sm:p-6 border-b ${
                    isToday(date)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className={`text-xl font-bold ${
                          isToday(date) ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {getDayName(date)}
                      </h2>
                      <p
                        className={`text-xs sm:text-sm ${
                          isToday(date) ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(date)}
                      </p>
                    </div>
                    {isToday(date) && (
                      <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs sm:text-sm font-medium">
                        اليوم
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {items.map((item: any) => {
                      const lesson = getLessonById(item.lessonId);
                      const subject = item.subjectId
                        ? getSubjectById(item.subjectId)
                        : null;

                      if (!lesson || !subject) return null;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 ${
                            item.completed
                              ? 'bg-green-50 border-green-200'
                              : item.priority === 'high'
                              ? 'bg-red-50 border-red-200'
                              : item.priority === 'medium'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-3 sm:space-x-4 space-x-reverse flex-1 w-full sm:w-auto">
                              <div className="text-2xl sm:text-3xl">{subject.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{lesson.title}</h3>
                                  {item.completed && (
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                  )}
                                  {item.recommended && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                      موصى به
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2">{subject.name}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      item.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : item.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item.priority === 'high'
                                      ? 'أولوية عالية'
                                      : item.priority === 'medium'
                                      ? 'أولوية متوسطة'
                                      : 'أولوية منخفضة'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto">
                              {item.completed ? (
                                <span className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-xs sm:text-sm text-center">
                                  مكتمل
                                </span>
                              ) : (
                                <Link
                                  href={`/lesson/${lesson.id}`}
                                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse font-semibold text-sm sm:text-base touch-manipulation"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  <span>ابدأ</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {studyPlan.length === 0 && (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-md">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              لا توجد خطة دراسية حالياً
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              ابدأ بإنهاء بعض الدروس لإنشاء خطة دراسية مخصصة لك
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm sm:text-base touch-manipulation"
            >
              ابدأ التعلم
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

