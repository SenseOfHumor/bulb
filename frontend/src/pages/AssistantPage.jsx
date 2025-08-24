import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you analyze your documents, create action plans, and answer questions about your uploaded content. What would you like to explore today?",
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I understand you're asking about "${inputMessage}". Based on your uploaded documents, here are some insights I can provide:\n\n• Key findings from your analysis\n• Relevant action items to consider\n• Connections to other parts of your knowledge graph\n\nWould you like me to dive deeper into any specific aspect?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { label: "Summarize my latest project", action: "summarize" },
    { label: "Show action items due this week", action: "actions" },
    { label: "Find connections between documents", action: "connections" },
    { label: "Generate a report", action: "report" }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 h-[calc(100vh-200px)] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  AI Assistant
                </h1>
                <p className="text-white/70">
                  Chat with your intelligent document assistant
                </p>
              </div>
              <div className="flex gap-3">
                <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Clear Chat
                </button>
                <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Export Chat
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-white/80 text-sm font-medium mb-3">Quick Actions:</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action.label)}
                    className="bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1 rounded-full text-sm transition-colors border border-white/20"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div 
                      className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-sky-100' : 'text-white/60'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white border border-white/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-white/60 text-sm">Assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your documents..."
                  disabled={isLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  rows="3"
                />
                <div className="absolute bottom-3 right-3 text-white/40 text-sm">
                  Press Enter to send
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors self-end"
              >
                Send
              </button>
            </div>

            {/* Context Info */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected to 3 projects • Knowledge graph active • 127 nodes available</span>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Link
                to="/mindmap"
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
