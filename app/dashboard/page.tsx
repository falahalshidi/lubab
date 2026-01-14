'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, TrendingUp, AlertCircle, CheckCircle, Brain, Target } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { getCurrentUser, getProgress, initializeProgress, getStudentSetup } from '@/lib/auth';
import { subjects, allSubjects } from '@/lib/data';
import { Subject, StudentProgress } from '@/types';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    // التحقق من إعدادات الطالب
    const setup = getStudentSetup();
    if (!setup) {
      router.push('/setup/name');
      return;
    }

    // تهيئة أو جلب التقدم
    let studentProgress = getProgress();
    if (!studentProgress || studentProgress.studentId !== currentUser.id) {
      studentProgress = initializeProgress(currentUser.id);
    }
    setProgress(studentProgress);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !progress) return null;

  // الحصول على المواد المختارة من الإعدادات
  const setup = getStudentSetup();
  const selectedSubjects = setup
    ? allSubjects.filter((s) => setup.subjectIds.includes(s.id) && s.lessons.length > 0)
    : subjects;

  // حساب التقدم لكل مادة
  const getSubjectProgress = (subjectId: string) => {
    const subject = selectedSubjects.find((s) => s.id === subjectId);
    if (!subject) return { completed: 0, total: 0, percentage: 0 };

    const completed = progress.lessonsCompleted.filter((lid) =>
      subject.lessons.some((l) => l.id === lid)
    ).length;
    const total = subject.lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  // حساب الإحصائيات العامة
  const totalLessons = selectedSubjects.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = progress.lessonsCompleted.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // إعداد بيانات Bento Cards
  const bentoFeatures = [
    {
      Icon: Brain,
      name: 'المواد الدراسية',
      description: `استكشف ${selectedSubjects.length} مادة متاحة وابدأ رحلتك التعليمية`,
      href: selectedSubjects.length > 0 ? `/subject/${selectedSubjects[0].id}` : '/dashboard',
      cta: 'استكشف المواد',
      className: 'lg:col-span-2 lg:row-span-1',
    },
    {
      Icon: Calendar,
      name: 'الخطة الدراسية',
      description: 'جدول مذاكرة أسبوعي مخصص لك بناءً على أدائك',
      href: '/study-plan',
      cta: 'عرض الخطة',
      className: 'lg:col-span-1 lg:row-span-1',
    },
    ...selectedSubjects.map((subject, index) => {
      const subjectProgress = getSubjectProgress(subject.id);
      return {
        Icon: BookOpen,
        name: subject.name,
        description: `${subject.description} - ${subjectProgress.completed}/${subjectProgress.total} درس مكتمل`,
        href: `/subject/${subject.id}`,
        cta: 'ابدأ التعلم',
        className: index === 0 ? 'lg:col-span-1 lg:row-span-2' : 'lg:col-span-1 lg:row-span-1',
      };
    }),
    {
      Icon: TrendingUp,
      name: 'التقدم الإجمالي',
      description: `لقد أكملت ${completedLessons} من ${totalLessons} درس - ${overallProgress}%`,
      href: '/dashboard',
      cta: 'عرض التفاصيل',
      className: 'lg:col-span-1 lg:row-span-1',
    },
    {
      Icon: AlertCircle,
      name: 'نقاط تحتاج للمراجعة',
      description: progress.weakPoints.length > 0 
        ? `${progress.weakPoints.length} نقطة ضعف تحتاج للمراجعة`
        : 'أداؤك ممتاز! لا توجد نقاط ضعف حالياً',
      href: '/dashboard',
      cta: 'عرض النقاط',
      className: 'lg:col-span-1 lg:row-span-1',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            مرحباً! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            ابدأ رحلتك التعليمية الذكية
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="lg:grid-rows-3">
          {bentoFeatures.map((feature) => (
            <BentoCard
              key={feature.name}
              name={feature.name}
              description={feature.description}
              href={feature.href}
              cta={feature.cta}
              Icon={feature.Icon}
              className={feature.className}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
