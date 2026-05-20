import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code, Bot, User } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../store';
import { naturalLanguageQuery } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cypher?: string;
  results?: any[];
}

const exampleQuestions = [
  "List all entry components",
  "Show me all files",
  "What components exist?",
  "Find all methods"
];

export function Query() {
  const { settings } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await naturalLanguageQuery(text);
      
      if (response.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: 'Here are the results:',
          cypher: response.cypher,
          results: response.results
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Ask about your code
              </h2>
              <p className="text-slate-400 mb-8">
                Use natural language to explore your knowledge graph
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(question)}
                    className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                  >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-slate-300 text-sm">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`flex-1 ${message.role === 'user' ? 'max-w-lg' : 'max-w-3xl'}`}>
                    <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'user' ? (
                        <span className="text-sm text-slate-400">You</span>
                      ) : (
                        <span className="text-sm text-slate-400">ArkTS Graph</span>
                      )}
                    </div>

                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}>
                      <p className="mb-3">{message.content}</p>

                      {message.cypher && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-slate-400 uppercase tracking-wider">
                              Cypher Query
                            </span>
                          </div>
                          <div className="bg-slate-900 rounded-lg overflow-hidden">
                            <SyntaxHighlighter
                              language="sql"
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                fontSize: '12px'
                              }}
                            >
                              {message.cypher}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )}

                      {message.results && message.results.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-slate-400 uppercase tracking-wider">
                              Results ({message.results.length})
                            </span>
                          </div>
                          <div className="bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <pre className="text-xs text-slate-300">
                              {JSON.stringify(message.results, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-700">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your codebase..."
              className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg text-white hover:from-blue-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {!settings.openaiApiKey && (
            <p className="text-xs text-amber-400 mt-2 text-center">
              ⚠️ OpenAI API key not set. Using fallback queries.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
