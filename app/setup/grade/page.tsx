'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Check } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { grades } from '@/lib/data';

export default function GradeSetupPage() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }

    const name = sessionStorage.getItem('temp_student_name');
    if (!name) {
      router.push('/setup/name');
      return;
    }
    setStudentName(name);
    setLoading(false);
  }, [router]);

  const handleSelect = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    if (grade && grade.available) {
      setSelectedGrade(gradeId);
      sessionStorage.setItem('temp_student_grade', gradeId);
      setTimeout(() => {
        router.push('/setup/subjects');
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
              لُباب
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            مرحباً {studentName}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">اختر صفك الدراسي</p>
        </div>

        {/* Grades Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {grades.map((grade) => {
            const isAvailable = grade.available;
            const isSelected = selectedGrade === grade.id;

            return (
              <button
                key={grade.id}
                onClick={() => handleSelect(grade.id)}
                disabled={!isAvailable}
                className={`relative p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${
                  isAvailable
                    ? isSelected
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xl'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {isAvailable ? (
                      <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
                    ) : (
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold">{grade.name}</h2>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
                    </div>
                  )}
                </div>

                {!isAvailable && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    قريباً
                  </div>
                )}

                {isAvailable && (
                  <p className="text-xs sm:text-sm opacity-90">متوفر الآن</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => router.push('/setup/name')}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
          >
            ← العودة
          </button>
        </div>
      </div>
    </div>
  );
}
