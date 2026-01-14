import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/">
              <span className="text-lg sm:text-xl font-semibold text-gray-900">لُباب</span>
            </Link>
            <div className="flex items-center">
              <Link
                href="/login"
                className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          {/* Launch Article Button */}
          <div className="mb-8 sm:mb-12 flex justify-center">
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-2 space-x-reverse">
              <span>اقرأ مقالنا الإطلاقي</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
            </button>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            معلّمك الشخصي
            <br />
            بالذكاء الاصطناعي
          </h1>

          {/* Description - About the Platform */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-2">
            منصة تعليمية ذكية تشرح الدروس حسب مستواك، تختبرك تلقائياً، 
            وتكتشف نقاط ضعفك لتبني خطة مذاكرة مخصصة لك. 
            تجنب التعقيدات في التعليم التقليدي واستمتع بتجربة تعليمية شخصية ومتكيفة.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              href="/login"
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 space-x-reverse text-sm sm:text-base"
            >
              <span>سجّل هنا</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
