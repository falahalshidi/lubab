'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage, Lesson } from '@/types';
import { generateExplanation, answerQuestion, createAIMessage } from '@/lib/ai-simulator';

interface AIChatProps {
  lesson: Lesson;
  onLessonComplete?: () => void;
}

export default function AIChat({ lesson, onLessonComplete }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // إرسال رسالة ترحيبية عند تحميل المكون
  useEffect(() => {
    const welcomeMessage = generateExplanation(lesson);
    const aiMessage = createAIMessage(welcomeMessage, lesson.id);
    setMessages([aiMessage]);
  }, [lesson]);

  // التمرير التلقائي للأسفل عند إضافة رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulateTyping = async (response: string, callback: () => void) => {
    setIsTyping(true);
    // محاكاة تأخير الكتابة
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    callback();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      lessonId: lesson.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // محاكاة استجابة AI
    await simulateTyping('', () => {
      const aiResponse = answerQuestion(userMessage.content, lesson);
      const aiMessage = createAIMessage(aiResponse, lesson.id);
      setMessages((prev) => [...prev, aiMessage]);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
          <div>
            <h3 className="font-bold text-gray-900">المعلّم الذكي</h3>
            <p className="text-sm text-gray-600">متاح للإجابة على أسئلتك</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        style={{ maxHeight: '500px' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 space-x-reverse ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gray-900'
                  : 'bg-gray-900'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`flex-1 rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend} className="flex items-center space-x-2 space-x-reverse">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك هنا..."
            disabled={isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse shadow-md hover:shadow-lg font-semibold touch-manipulation"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">إرسال</span>
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          اضغط Enter للإرسال
        </p>
      </div>
    </div>
  );
}

