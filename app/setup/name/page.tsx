'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export default function NameSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem('temp_student_name', name.trim());
      router.push('/setup/grade');
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
              لُباب
            </span>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">مرحباً بك!</h1>
            <p className="text-gray-600 text-sm sm:text-base">ما اسمك؟</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                placeholder="أدخل اسمك"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 sm:py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse text-base sm:text-lg touch-manipulation"
            >
              <span>متابعة</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
