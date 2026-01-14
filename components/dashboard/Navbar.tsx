'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8 space-x-reverse">
            <Link href="/dashboard">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                لُباب
              </span>
            </Link>

            {user.role === 'student' && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 sm:space-x-2 space-x-reverse px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm sm:text-base"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Link>
                <Link
                  href="/study-plan"
                  className="flex items-center space-x-1 sm:space-x-2 space-x-reverse px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">الخطة الدراسية</span>
                </Link>
              </>
            )}

            {user.role === 'parent' && (
              <Link
                href="/parent"
                className="flex items-center space-x-1 sm:space-x-2 space-x-reverse px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm sm:text-base"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
            <div className="flex items-center space-x-1.5 sm:space-x-2 space-x-reverse px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline text-sm">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 space-x-reverse px-2 sm:px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
