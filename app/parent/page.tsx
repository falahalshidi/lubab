'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, BookOpen, Award, BarChart3 } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { getCurrentUser, getProgress } from '@/lib/auth';
import { subjects, grade5 } from '@/lib/data';
import { analyzePerformance } from '@/lib/ai-simulator';

export default function ParentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'parent') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    // جلب تقدم الطالب
    const progressData = getProgress();
    if (!progressData) {
      // إذا لم يكن هناك تقدم، أنشئ بيانات تجريبية
      setProgress({
        studentId: currentUser.studentId || 'student-1',
        lessonsCompleted: [],
        quizzesCompleted: [],
        subjectsProgress: [],
        studyPlan: [],
        weakPoints: [],
        strengths: [],
      });
    } else {
      setProgress(progressData);
    }

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

  // حساب الإحصائيات
  const totalLessons = subjects.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = progress.lessonsCompleted?.length || 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // حساب متوسط الدرجات
  const quizResults = progress.quizzesCompleted || [];
  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum: number, q: any) => sum + q.score, 0) / quizResults.length
        )
      : 0;

  // تحليل الأداء
  const analysis = quizResults.length > 0 ? analyzePerformance(quizResults) : {
    weakPoints: progress.weakPoints || [],
    strengths: progress.strengths || [],
    recommendations: [],
  };

  // التقدم في كل مادة
  const subjectsSummary = subjects.map((subject) => {
    const completed = progress.lessonsCompleted?.filter((lid: string) =>
      subject.lessons.some((l) => l.id === lid)
    ).length || 0;
    const total = subject.lessons.length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // حساب متوسط الدرجات في هذه المادة
    const subjectQuizzes = quizResults.filter((q: any) => {
      const lesson = subject.lessons.find((l) => l.id === q.lessonId);
      return lesson !== undefined;
    });
    const subjectAverage =
      subjectQuizzes.length > 0
        ? Math.round(
            subjectQuizzes.reduce((sum: number, q: any) => sum + q.score, 0) /
              subjectQuizzes.length
          )
        : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      icon: subject.icon,
      progress: progressPercentage,
      averageScore: subjectAverage,
      lessonsCompleted: completed,
      totalLessons: total,
    };
  });

  // آخر الأنشطة
  const recentActivity: any[] = [];

  // إضافة الدروس المكتملة
  const recentLessons = progress.lessonsCompleted
    ?.slice(-5)
    .map((lid: string) => {
      for (const subject of subjects) {
        const lesson = subject.lessons.find((l) => l.id === lid);
        if (lesson) {
          return {
            id: `lesson-${lid}`,
            type: 'lesson_completed',
            title: `إكمال درس: ${lesson.title}`,
            description: `تم إكمال الدرس في مادة ${subject.name}`,
            timestamp: new Date(),
            subjectId: subject.id,
          };
        }
      }
      return null;
    })
    .filter(Boolean) || [];

  // إضافة الاختبارات المكتملة
  const recentQuizzes = quizResults
    .slice(-5)
    .map((q: any) => {
      for (const subject of subjects) {
        const lesson = subject.lessons.find((l) => l.id === q.lessonId);
        if (lesson) {
          return {
            id: `quiz-${q.quizId}`,
            type: 'quiz_completed',
            title: `إكمال اختبار: ${lesson.title}`,
            description: `النتيجة: ${q.score}% - ${subject.name}`,
            timestamp: new Date(q.completedAt),
            subjectId: subject.id,
          };
        }
      }
      return null;
    })
    .filter(Boolean) || [];

  recentActivity.push(...recentLessons, ...recentQuizzes);
  recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  recentActivity.splice(5);

  // التنبيهات
  const alerts: any[] = [];
  if (averageScore < 60 && quizResults.length > 0) {
    alerts.push({
      id: 'low-score',
      type: 'warning',
      title: 'انخفاض في الأداء',
      message: 'متوسط الدرجات أقل من 60%. يوصى بمراجعة الدروس السابقة.',
      timestamp: new Date(),
      actionRequired: true,
    });
  }
  if (overallProgress < 30 && completedLessons > 0) {
    alerts.push({
      id: 'slow-progress',
      type: 'info',
      title: 'تقدم بطيء',
      message: 'التقدم الإجمالي أقل من 30%. شجع الطالب على المزيد من المذاكرة.',
      timestamp: new Date(),
      actionRequired: false,
    });
  }
  if (analysis.weakPoints.length > 3) {
    alerts.push({
      id: 'many-weak-points',
      type: 'warning',
      title: 'نقاط ضعف متعددة',
      message: 'تم اكتشاف عدة نقاط ضعف. يوصى بمراجعة شاملة.',
      timestamp: new Date(),
      actionRequired: true,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">لوحة تحكم ولي الأمر</h1>
          <p className="text-sm sm:text-base text-gray-600">{grade5.name} - متابعة أداء الطالب</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{overallProgress}%</div>
            <p className="text-gray-300 text-xs sm:text-sm">التقدم الإجمالي</p>
          </div>

          <div className="bg-gray-700 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{averageScore}%</div>
            <p className="text-gray-300 text-xs sm:text-sm">متوسط الدرجات</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{completedLessons}</div>
            <p className="text-gray-300 text-xs sm:text-sm">دروس مكتملة</p>
          </div>

          <div className="bg-gray-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{quizResults.length}</div>
            <p className="text-gray-300 text-xs sm:text-sm">اختبارات مكتملة</p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">التنبيهات</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${
                    alert.type === 'warning'
                      ? 'bg-gray-50 border-gray-200'
                      : alert.type === 'success'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <AlertCircle
                      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        alert.type === 'warning'
                          ? 'text-gray-600'
                          : alert.type === 'success'
                          ? 'text-gray-600'
                          : 'text-gray-600'
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{alert.title}</h3>
                      <p className="text-gray-700 text-sm">{alert.message}</p>
                      {alert.actionRequired && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          يتطلب إجراء
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Subjects Progress */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">التقدم في المواد</h2>
            <div className="space-y-6">
              {subjectsSummary.map((subject) => (
                <div key={subject.subjectId}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{subject.subjectName}</h3>
                        <p className="text-sm text-gray-600">
                          {subject.lessonsCompleted}/{subject.totalLessons} درس
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {subject.averageScore > 0 ? `${subject.averageScore}%` : '-'}
                      </div>
                      <p className="text-xs text-gray-500">متوسط الدرجات</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">آخر الأنشطة</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const subject = subjects.find((s) => s.id === activity.subjectId);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">{subject?.icon || '📚'}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      {activity.type === 'lesson_completed' ? (
                        <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" />
                      ) : (
                        <Award className="w-5 h-5 text-gray-900 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد أنشطة حديثة</p>
              </div>
            )}
          </div>
        </div>

        {/* Weak Points & Strengths */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Weak Points */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">نقاط الضعف</h2>
            </div>
            {analysis.weakPoints.length > 0 ? (
              <div className="space-y-2">
                {analysis.weakPoints.slice(0, 5).map((point: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <p className="text-sm text-gray-800">{point}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-gray-900 mx-auto mb-2" />
                <p className="text-gray-600">لا توجد نقاط ضعف حالياً</p>
              </div>
            )}
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">نقاط القوة</h2>
            </div>
            {analysis.strengths.length > 0 ? (
              <div className="space-y-2">
                {analysis.strengths.map((strength: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <p className="text-sm text-gray-800">{strength}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">ابدأ التعلم لاكتشاف نقاط قوتك!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">توصيات</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

