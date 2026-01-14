import { Lesson, Question, QuizResult, ChatMessage } from '@/types';
import { getLessonById } from './data';

// محاكاة استجابة AI للشرح
export function generateExplanation(lesson: Lesson): string {
  const explanations: Record<string, string> = {
    'math-lesson-1': `مرحباً! اليوم سنتعلم الجمع والطرح. هذه العمليات مهمة جداً في حياتنا اليومية.

دعني أشرح لك بطريقة بسيطة:
- الجمع: عندما نجمع عددين، نضيفهما معاً
- الطرح: عندما نطرح، نأخذ عدداً من عدد آخر

مثال بسيط: إذا كان لديك 5 تفاحات وأعطيتك 3 أخرى، كم لديك؟ نعم، 8 تفاحات! هذا هو الجمع.

هل تريد أن أشرح لك مثالاً آخر؟`,

    'math-lesson-2': `أهلاً بك! اليوم سنتعلم الضرب. الضرب أسهل مما تظن!

الضرب هو تكرار الجمع. مثلاً: 3 × 4 يعني أننا نجمع 3 أربع مرات.

دعني أعطيك مثالاً: إذا كان لديك 4 صناديق وكل صندوق فيه 5 أقلام، كم قلم لديك؟
نضرب 4 × 5 = 20 قلم

هل فهمت؟ يمكنك أن تسألني عن أي شيء!`,

    'math-lesson-3': `مرحباً! سنتعلم اليوم القسمة. القسمة هي عكس الضرب.

القسمة تعني: كم مرة يمكننا تقسيم عدد على عدد آخر؟

مثال: إذا كان لديك 20 قطعة حلوى ووزعتها على 4 أصدقاء بالتساوي، كم قطعة لكل صديق؟
نقسم 20 ÷ 4 = 5 قطع لكل صديق

هل تريد أمثلة أخرى؟`,

    'science-lesson-1': `أهلاً! اليوم سنتعرف على أجزاء النبات. النباتات كائنات حية رائعة!

كل جزء في النبات له وظيفة مهمة:
- الجذور: تمتص الماء من التربة
- الساق: يحمل الأوراق
- الأوراق: تصنع الغذاء
- الزهرة: تساعد في التكاثر

تخيل النبات كإنسان: الجذور مثل الفم (تمتص)، الساق مثل الجسم (يحمل)، الأوراق مثل اليدين (تعمل)!

هل تريد معرفة المزيد عن أي جزء معين؟`,

    'science-lesson-2': `مرحباً! سنتعلم اليوم دورة الماء. إنها دورة مستمرة لا تنتهي!

تخيل أنك قطرة ماء:
1. تبدأ في البحر
2. تتحول إلى بخار بفعل الشمس (التبخر)
3. ترتفع إلى السماء وتصبح سحابة (التكثف)
4. تسقط كقطرات مطر (الهطول)
5. تعود إلى البحر (الجريان)
6. تبدأ من جديد!

هذه الدورة تحدث كل يوم في الطبيعة. هل تريد أن أشرح أي مرحلة بالتفصيل؟`,

    'science-lesson-3': `أهلاً! اليوم سنتعرف على الجهاز الهضمي. إنه مثل مصنع داخل جسمك!

الطعام يسير في رحلة:
1. الفم: حيث نمضغ الطعام
2. المريء: أنبوب ينقل الطعام
3. المعدة: تهضم الطعام
4. الأمعاء الدقيقة: تمتص الغذاء
5. الأمعاء الغليظة: تتخلص من الفضلات

تخيل أن الطعام رحلة في قطار! كل محطة لها وظيفة مهمة.

هل تريد معرفة المزيد عن أي جزء؟`,

    'arabic-lesson-1': `مرحباً! اليوم سنتعلم أنواع الجمل في اللغة العربية.

هناك نوعان رئيسيان:
1. الجملة الاسمية: تبدأ باسم (مثل: الشمس مشرقة)
2. الجملة الفعلية: تبدأ بفعل (مثل: يلعب الطفل)

تخيل الجملة كبيت:
- الجملة الاسمية: الباب اسم (المبتدأ) والغرفة خبر
- الجملة الفعلية: الباب فعل والغرفة فاعل

هل تريد أمثلة أكثر؟`,

    'arabic-lesson-2': `أهلاً! سنتعلم اليوم المفعول به. إنه مهم جداً في اللغة العربية!

المفعول به هو: الاسم الذي يقع عليه فعل الفاعل.

مثال: "قرأ الطالب الكتاب"
- قرأ: الفعل
- الطالب: الفاعل
- الكتاب: المفعول به (ما وقع عليه الفعل)

تخيل أن الفاعل يرمي كرة، والكرة هي المفعول به!

هل تريد أمثلة أخرى؟`,

    'arabic-lesson-3': `مرحباً! اليوم سنتعلم الضمائر. الضمائر تجعل كلامنا أقصر وأسهل!

الضمائر مثل الأسماء المختصرة:
- أنا: بدلاً من قول اسمك كل مرة
- أنت: بدلاً من قول اسم الشخص
- هو/هي: بدلاً من قول اسم الغائب

مثال: بدلاً من قول "أحمد طالب مجتهد" يمكنك قول "أنا طالب مجتهد"

هل تريد معرفة المزيد عن الضمائر؟`,
  };

  return (
    explanations[lesson.id] ||
    `مرحباً! اليوم سنتعلم ${lesson.title}. 

${lesson.description}

دعني أشرح لك هذا الدرس بطريقة بسيطة وممتعة. هل أنت مستعد للبدء؟`
  );
}

// محاكاة إجابة AI على سؤال الطالب
export function answerQuestion(
  question: string,
  lesson: Lesson
): string {
  const lowerQuestion = question.toLowerCase();

  // إجابات ذكية حسب نوع السؤال
  if (
    lowerQuestion.includes('ماذا') ||
    lowerQuestion.includes('ما هو') ||
    lowerQuestion.includes('ما هي')
  ) {
    return `سؤال ممتاز! دعني أشرح لك:

${lesson.content.substring(0, 200)}...

هل تريد المزيد من التفاصيل؟ يمكنك أن تسألني عن أي جزء معين!`;
  }

  if (
    lowerQuestion.includes('كيف') ||
    lowerQuestion.includes('لماذا')
  ) {
    return `سؤال رائع! هذا يساعدك على الفهم العميق.

دعني أشرح لك بطريقة عملية:
- الخطوة الأولى: ...
- الخطوة الثانية: ...
- الخطوة الثالثة: ...

هل فهمت؟ يمكنك أن تسألني عن أي خطوة بالتفصيل!`;
  }

  if (lowerQuestion.includes('مثال') || lowerQuestion.includes('مثلاً')) {
    return `بالطبع! إليك مثال واضح:

مثال 1: ...
مثال 2: ...
مثال 3: ...

هل تريد أمثلة أكثر؟`;
  }

  // إجابة عامة
  return `سؤال جيد! دعني أساعدك.

بناءً على ما تعلمناه في هذا الدرس، الإجابة هي...

هل تريد أن أشرح لك بطريقة أخرى أو لديك سؤال آخر؟`;
}

// تحليل الأداء
export function analyzePerformance(
  quizResults: QuizResult[]
): {
  weakPoints: string[];
  strengths: string[];
  recommendations: string[];
} {
  const weakPoints: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  // تحليل بسيط
  const recentResults = quizResults.slice(-3);
  const averageScore =
    recentResults.reduce((sum, r) => sum + r.score, 0) /
    recentResults.length;

  if (averageScore < 60) {
    weakPoints.push('تحتاج إلى مزيد من الممارسة');
    recommendations.push('راجع الدروس السابقة قبل المتابعة');
  } else if (averageScore < 80) {
    weakPoints.push('أداؤك جيد لكن يمكن تحسينه');
    recommendations.push('تدرب على المزيد من الأمثلة');
  } else {
    strengths.push('أداؤك ممتاز!');
    recommendations.push('يمكنك المتابعة للدروس التالية');
  }

  return { weakPoints, strengths, recommendations };
}

// إنشاء خطة مذاكرة
export function generateStudyPlan(
  weakPoints: string[],
  availableLessons: Lesson[]
): any[] {
  const plan: any[] = [];
  const today = new Date();

  // خطة أسبوعية بسيطة
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    if (i < availableLessons.length) {
      plan.push({
        id: `plan-${i}`,
        date,
        lessonId: availableLessons[i].id,
        subjectId: availableLessons[i].subjectId,
        completed: false,
        priority: i < 3 ? 'high' : 'medium',
        recommended: weakPoints.length > 0 && i < 2,
      });
    }
  }

  return plan;
}

// إنشاء رسالة AI جديدة
export function createAIMessage(
  content: string,
  lessonId?: string
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    role: 'ai',
    content,
    timestamp: new Date(),
    lessonId,
  };
}

