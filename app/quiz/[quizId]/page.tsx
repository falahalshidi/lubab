'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, X, Trophy, AlertCircle, RotateCcw } from 'lucide-react';
import Navbar from '@/components/dashboard/Navbar';
import { getCurrentUser, getProgress, saveProgress } from '@/lib/auth';
import { getQuizById, getLessonById, getSubjectById } from '@/lib/data';
import { Quiz, QuizResult, AnswerRecord } from '@/types';
import { analyzePerformance } from '@/lib/ai-simulator';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    const quizData = getQuizById(quizId);
    if (!quizData) {
      router.push('/dashboard');
      return;
    }

    setQuiz(quizData);

    const lessonData = getLessonById(quizData.lessonId);
    setLesson(lessonData);

    if (lessonData) {
      const subjectData = getSubjectById(lessonData.subjectId);
      setSubject(subjectData);
    }

    setLoading(false);
  }, [quizId, router]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    if (!quiz || !lesson) return;

    const answerRecords: AnswerRecord[] = quiz.questions.map((q) => {
      const selectedAnswer = answers[q.id] ?? -1;
      const isCorrect = selectedAnswer === q.correctAnswer;
      return {
        questionId: q.id,
        selectedAnswer,
        isCorrect,
      };
    });

    const correctAnswers = answerRecords.filter((a) => a.isCorrect).length;
    const wrongAnswers = answerRecords.filter((a) => !a.isCorrect).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // تحليل الأداء لاكتشاف نقاط الضعف
    const weakPoints: string[] = [];
    answerRecords.forEach((record, index) => {
      if (!record.isCorrect) {
        const question = quiz.questions[index];
        weakPoints.push(question.text);
      }
    });

    const result: QuizResult = {
      quizId: quiz.id,
      lessonId: lesson.id,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      wrongAnswers,
      answers: answerRecords,
      completedAt: new Date(),
      weakPoints,
    };

    setQuizResult(result);
    setShowResults(true);

    // حفظ النتيجة في التقدم
    const progress = getProgress();
    if (progress) {
      const updatedProgress = {
        ...progress,
        quizzesCompleted: [...progress.quizzesCompleted, result],
        weakPoints: [...new Set([...progress.weakPoints, ...weakPoints])],
      };

      // إذا كانت النتيجة جيدة، أضف الدرس للمكتملة
      if (score >= 60 && !progress.lessonsCompleted.includes(lesson.id)) {
        updatedProgress.lessonsCompleted = [
          ...updatedProgress.lessonsCompleted,
          lesson.id,
        ];
      }

      saveProgress(updatedProgress);
    }
  };

  if (loading || !quiz || !lesson || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const selectedAnswer = answers[currentQuestion.id];

  if (showResults && quizResult) {
    const isPassed = quizResult.score >= 60;
    const analysis = analyzePerformance([quizResult]);

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/lesson/${lesson.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-5 h-5 ml-2 rotate-180" />
              <span>العودة للدرس</span>
            </Link>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              {isPassed ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-orange-600" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPassed ? 'مبروك! لقد نجحت' : 'تحتاج للمزيد من الممارسة'}
              </h1>
              <div className="text-5xl font-bold text-blue-600 mt-4">
                {quizResult.score}%
              </div>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {quizResult.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">إجابات صحيحة</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {quizResult.wrongAnswers}
                </div>
                <div className="text-sm text-gray-600">إجابات خاطئة</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {quizResult.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">إجمالي الأسئلة</div>
              </div>
            </div>

            {/* Questions Review */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">مراجعة الأسئلة</h2>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const answerRecord = quizResult.answers.find(
                    (a) => a.questionId === question.id
                  );
                  const isCorrect = answerRecord?.isCorrect;
                  const selectedIndex = answerRecord?.selectedAnswer ?? -1;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900">
                          سؤال {index + 1}: {question.text}
                        </h3>
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected = selectedIndex === optIndex;
                          const isCorrectAnswer = optIndex === question.correctAnswer;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer
                                  ? 'bg-green-100 border-2 border-green-300'
                                  : isSelected && !isCorrect
                                  ? 'bg-red-100 border-2 border-red-300'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2 space-x-reverse">
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                                {isSelected && !isCorrect && (
                                  <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )}
                                <span
                                  className={
                                    isCorrectAnswer
                                      ? 'font-semibold text-green-800'
                                      : isSelected && !isCorrect
                                      ? 'font-semibold text-red-800'
                                      : 'text-gray-700'
                                  }
                                >
                                  {option}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="mr-auto text-sm text-green-700 font-medium">
                                    (الإجابة الصحيحة)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>شرح:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">توصيات:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/lesson/${lesson.id}`}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                مراجعة الدرس
              </Link>
              <Link
                href={`/subject/${subject.id}`}
                className="flex-1 px-6 py-3 bg-white text-blue-600 text-center rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                العودة للمادة
              </Link>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setQuizResult(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 space-x-reverse"
              >
                <RotateCcw className="w-5 h-5" />
                <span>إعادة الاختبار</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowRight className="w-5 h-5 ml-2 rotate-180" />
            <span>العودة للدرس</span>
          </Link>
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="text-3xl">{subject.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">اختبار: {lesson.title}</h1>
              <p className="text-gray-600">{subject.name}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              سؤال {currentQuestionIndex + 1} من {quiz.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full h-3 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span>السابق</span>
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2 space-x-reverse font-semibold"
          >
            <span>
              {currentQuestionIndex === quiz.questions.length - 1
                ? 'إنهاء الاختبار'
                : 'التالي'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

