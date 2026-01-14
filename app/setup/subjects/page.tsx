'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Lock, ArrowRight } from 'lucide-react';
import { getCurrentUser, saveStudentSetup } from '@/lib/auth';
import { allSubjects } from '@/lib/data';

export default function SubjectsSetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [gradeId, setGradeId] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }

    const name = sessionStorage.getItem('temp_student_name');
    const grade = sessionStorage.getItem('temp_student_grade');

    if (!name || !grade) {
      router.push('/setup/name');
      return;
    }

    setStudentName(name);
    setGradeId(grade);
    setLoading(false);
  }, [router]);

  const toggleSubject = (subjectId: string) => {
    const subject = allSubjects.find((s) => s.id === subjectId);
    if (!subject || subject.lessons.length === 0) return;

    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleComplete = () => {
    if (selectedSubjects.length > 0) {
      saveStudentSetup({
        name: studentName,
        gradeId,
        subjectIds: selectedSubjects,
      });

      sessionStorage.removeItem('temp_student_name');
      sessionStorage.removeItem('temp_student_grade');

      router.push('/dashboard');
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

  const availableSubjects = allSubjects.filter((s) => s.lessons.length > 0);
  const comingSoonSubjects = allSubjects.filter((s) => s.lessons.length === 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            اختر المواد التي تريد دراستها
          </h1>
          <p className="text-base sm:text-xl text-gray-600">
            يمكنك اختيار واحدة أو أكثر من المواد المتاحة
          </p>
        </div>

        {/* Available Subjects */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">المواد المتاحة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject.id);

              return (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xl'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl sm:text-4xl">{subject.icon}</span>
                    {isSelected && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1">{subject.name}</h3>
                  <p className="text-xs sm:text-sm opacity-90">{subject.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Subjects */}
        {comingSoonSubjects.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">قريباً</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {comingSoonSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="relative p-4 sm:p-6 rounded-xl border-2 bg-gray-100 text-gray-400 border-gray-300 opacity-60"
                >
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    قريباً
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl sm:text-4xl">{subject.icon}</span>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1">{subject.name}</h3>
                  <p className="text-xs sm:text-sm">{subject.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Button */}
        <div className="text-center mt-8 sm:mt-10">
          <button
            onClick={handleComplete}
            disabled={selectedSubjects.length === 0}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse mx-auto text-base sm:text-lg"
          >
            <span>إكمال الإعداد</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => router.push('/setup/grade')}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
          >
            ← العودة
          </button>
        </div>
      </div>
    </div>
  );
}
