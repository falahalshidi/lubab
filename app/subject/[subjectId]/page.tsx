'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Lock, BookOpen } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { getCurrentUser, getProgress } from '@/lib/auth';
import { getSubjectById } from '@/lib/data';
import { Subject, Lesson } from '@/types';

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [user, setUser] = useState<any>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    const subjectData = getSubjectById(subjectId);
    if (!subjectData) {
      router.push('/dashboard');
      return;
    }

    setSubject(subjectData);

    const progressData = getProgress();
    setProgress(progressData);
    setLoading(false);
  }, [subjectId, router]);

  if (loading || !subject || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // حساب التقدم في المادة
  const completedLessons = progress.lessonsCompleted.filter((lid: string) =>
    subject.lessons.some((l) => l.id === lid)
  ).length;
  const totalLessons = subject.lessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // تحديد حالة كل درس
  const getLessonStatus = (lesson: Lesson, index: number) => {
    const isCompleted = progress.lessonsCompleted.includes(lesson.id);
    const isFirst = index === 0;
    const prevLesson = index > 0 ? subject.lessons[index - 1] : null;
    const isPrevCompleted = prevLesson ? progress.lessonsCompleted.includes(prevLesson.id) : true;
    const isLocked = !isFirst && !isPrevCompleted;

    if (isCompleted) return 'completed';
    if (isLocked) return 'locked';
    return 'available';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
            <span>العودة للوحة التحكم</span>
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            <div className="text-4xl sm:text-5xl">{subject.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">{subject.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">التقدم في المادة</h2>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-2">
            <div
              className="bg-gray-900 rounded-full h-2.5 sm:h-3 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {completedLessons} من {totalLessons} درس مكتمل
          </p>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">الدروس</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {subject.lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson, index);
              const isCompleted = status === 'completed';
              const isLocked = status === 'locked';

              return (
                <div
                  key={lesson.id}
                  className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                    isLocked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse flex-1 w-full sm:w-auto">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                        ) : isLocked ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{lesson.title}</h3>
                          {isCompleted && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              مكتمل
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              مقفل
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 mb-2">{lesson.description}</p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            الدرس {index + 1}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              lesson.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : lesson.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {lesson.difficulty === 'easy'
                              ? 'سهل'
                              : lesson.difficulty === 'medium'
                              ? 'متوسط'
                              : 'صعب'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {isLocked ? (
                        <button
                          disabled
                          className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse text-sm"
                        >
                          <Lock className="w-4 h-4" />
                          <span>مقفل</span>
                        </button>
                      ) : (
                        <Link
                          href={`/lesson/${lesson.id}`}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse font-semibold text-sm sm:text-base"
                        >
                          <span>{isCompleted ? 'مراجعة' : 'ابدأ'}</span>
                          <ArrowRight className="w-4 h-4 rotate-180" />
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
    </div>
  );
}

