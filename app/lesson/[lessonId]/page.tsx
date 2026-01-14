'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Play, BookOpen } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import AIChat from '@/components/chat/AIChat';
import { getCurrentUser, getProgress, saveProgress } from '@/lib/auth';
import { getLessonById, getSubjectById } from '@/lib/data';
import { Lesson } from '@/types';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [subject, setSubject] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    const lessonData = getLessonById(lessonId);
    if (!lessonData) {
      router.push('/dashboard');
      return;
    }

    setLesson(lessonData);

    const subjectData = getSubjectById(lessonData.subjectId);
    setSubject(subjectData);

    const progressData = getProgress();
    setProgress(progressData);

    // التحقق من إكمال الدرس
    if (progressData && progressData.lessonsCompleted.includes(lessonId)) {
      setIsCompleted(true);
    }

    setLoading(false);
  }, [lessonId, router]);

  const markLessonComplete = () => {
    if (!progress || !lesson) return;

    const updatedProgress = {
      ...progress,
      lessonsCompleted: [...new Set([...progress.lessonsCompleted, lesson.id])],
    };

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
    setIsCompleted(true);
  };

  if (loading || !lesson || !subject || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // تحويل محتوى الدرس من Markdown بسيط إلى HTML
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold text-gray-900 mt-6 mb-4">
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 mt-5 mb-3">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-bold text-gray-800 mt-4 mb-2">
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="mr-6 mb-2 text-gray-700">
              {line.substring(2)}
            </li>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/subject/${subject.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
            <span>العودة للمادة</span>
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse mb-4">
            <div className="text-2xl sm:text-3xl">{subject.icon}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-sm sm:text-base text-gray-600">{subject.name}</p>
            </div>
            {isCompleted && (
              <div className="flex items-center space-x-2 space-x-reverse px-3 py-1 bg-green-100 text-green-700 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">مكتمل</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Description */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <BookOpen className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">محتوى الدرس</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                {formatContent(lesson.content)}
              </div>
            </div>

            {/* Mark Complete Button */}
            {!isCompleted && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">هل انتهيت من قراءة الدرس؟</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      يمكنك الآن البدء بالاختبار أو طرح أسئلة على المعلّم الذكي
                    </p>
                  </div>
                  <button
                    onClick={markLessonComplete}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse font-semibold touch-manipulation"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>تم الإكمال</span>
                  </button>
                </div>
              </div>
            )}

            {/* Start Quiz Button */}
            <Link
              href={`/quiz/${lesson.quizId}`}
              className="block w-full px-6 py-4 bg-gray-900 text-white text-center rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse font-bold text-base sm:text-lg touch-manipulation"
            >
              <Play className="w-5 h-5" />
              <span className="text-base sm:text-lg font-semibold">ابدأ الاختبار</span>
            </Link>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <AIChat lesson={lesson} />
          </div>
        </div>
      </div>
    </div>
  );
}

