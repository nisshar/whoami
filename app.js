const { useState, useEffect } = React;
const { Send, Eye, Users, MessageSquare, Lock, BarChart3, Shield, X } = lucide;

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, messages: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const suggestions = [
    "I've always wanted to tell you...",
    "What I admire most about you is...",
    "A confession: ",
    "You should know that...",
    "My honest opinion about you...",
    "Something I've noticed about you...",
    "If I could tell you one thing..."
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const initializeApp = async () => {
    setLoading(true);
    await captureVisitor();
    setLoading(false);
  };

  const captureVisitor = async () => {
    const visitorData = {
      id: `visitor_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenRes: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct',
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    };

    try {
      // Using localStorage for GitHub Pages deployment
      const existingVisitors = localStorage.getItem('visitors');
      const visitorsList = existingVisitors ? JSON.parse(existingVisitors) : [];
      visitorsList.push(visitorData);
      localStorage.setItem('visitors', JSON.stringify(visitorsList));
      console.log('✅ Visitor captured:', visitorData);
    } catch (error) {
      console.error('❌ Error saving visitor:', error);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const msgList = JSON.parse(localStorage.getItem('messages') || '[]');
      const visList = JSON.parse(localStorage.getItem('visitors') || '[]');
      
      setMessages(msgList);
      setVisitors(visList);
      
      const today = new Date().toDateString();
      const todayVisitors = visList.filter(v => 
        new Date(v.timestamp).toDateString() === today
      ).length;

      setStats({
        total: visList.length,
        today: todayVisitors,
        messages: msgList.length
      });
      
      console.log('📊 Admin data loaded:', { messages: msgList.length, visitors: visList.length });
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      text: message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      device: getDeviceType(navigator.userAgent),
      browser: getBrowser(navigator.userAgent)
    };

    try {
      const messageList = JSON.parse(localStorage.getItem('messages') || '[]');
      messageList.push(newMessage);
      localStorage.setItem('messages', JSON.stringify(messageList));
      
      console.log('✅ Message saved:', newMessage);
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('❌ Error saving message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleAdminLogin = () => {
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
      console.log('✅ Admin logged in');
    } else {
      alert('❌ Incorrect password!');
      setPassword('');
    }
  };

  const getDeviceType = (ua) => {
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  const getBrowser = (ua) => {
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  };

  // ADMIN DASHBOARD VIEW
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎯 Admin Dashboard</h1>
              <p className="text-purple-300">Monitor visitors and messages</p>
            </div>
            <button
              onClick={() => {
                setIsAdmin(false);
                console.log('🔓 Logged out from admin');
              }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {loading ? (
            <div className="text-center text-white text-xl py-12">Loading data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Total Visitors</p>
                      <p className="text-4xl font-bold text-white">{stats.total}</p>
                    </div>
                    {React.createElement(Users, { className: "w-12 h-12 text-purple-400" })}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Today</p>
                      <p className="text-4xl font-bold text-white">{stats.today}</p>
                    </div>
                    {React.createElement(Eye, { className: "w-12 h-12 text-blue-400" })}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Messages</p>
                      <p className="text-4xl font-bold text-white">{stats.messages}</p>
                    </div>
                    {React.createElement(MessageSquare, { className: "w-12 h-12 text-green-400" })}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  {React.createElement(MessageSquare, { className: "w-6 h-6" })}
                  Anonymous Messages ({messages.length})
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-purple-300 text-lg mb-2">No messages yet</p>
                      <p className="text-purple-400 text-sm">Messages will appear here when users send them</p>
                    </div>
                  ) : (
                    messages.slice().reverse().map((msg) => (
                      <div key={msg.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition">
                        <p className="text-white mb-3 text-lg leading-relaxed">{msg.text}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-purple-300">
                          <span className="flex items-center gap-1">
                            📅 {new Date(msg.timestamp).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>📱 {msg.device || getDeviceType(msg.userAgent)}</span>
                          <span>•</span>
                          <span>🌐 {msg.browser || getBrowser(msg.userAgent)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  {React.createElement(BarChart3, { className: "w-6 h-6" })}
                  Visitor Analytics ({visitors.length})
                </h2>
                <div className="overflow-x-auto">
                  {visitors.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-purple-300 text-lg">No visitor data captured yet</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Time</th>
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Device</th>
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Browser</th>
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Timezone</th>
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Resolution</th>
                          <th className="text-left text-purple-300 pb-3 px-2 text-sm">Language</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitors.slice().reverse().slice(0, 50).map((visitor) => (
                          <tr key={visitor.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-2 text-white text-sm">
                              {new Date(visitor.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-white text-sm">
                              {getDeviceType(visitor.userAgent)}
                            </td>
                            <td className="py-3 px-2 text-white text-sm">
                              {getBrowser(visitor.userAgent)}
                            </td>
                            <td className="py-3 px-2 text-white text-sm">
                              {visitor.timezone}
                            </td>
                            <td className="py-3 px-2 text-white text-sm">
                              {visitor.screenRes}
                            </td>
                            <td className="py-3 px-2 text-white text-sm">
                              {visitor.language}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // USER VIEW WITH LOGIN MODAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* ADMIN BUTTON - TOP RIGHT */}
      <button
        onClick={() => {
          console.log('Admin button clicked!');
          setShowLoginModal(true);
        }}
        className="fixed top-6 right-6 z-40 px-5 py-3 bg-slate-800/80 backdrop-blur-md rounded-full hover:bg-slate-700/80 transition-all flex items-center gap-2 border-2 border-purple-400/50 shadow-xl hover:shadow-2xl hover:scale-105"
      >
        {React.createElement(Shield, { className: "w-5 h-5 text-purple-300" })}
        <span className="text-white font-semibold">Admin</span>
      </button>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl p-8 max-w-md w-full border-2 border-purple-400/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                {React.createElement(Shield, { className: "w-8 h-8 text-purple-400" })}
                Admin Login
              </h2>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword('');
                }}
                className="text-purple-300 hover:text-white transition"
              >
                {React.createElement(X, { className: "w-6 h-6" })}
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdminLogin();
                    }
                  }}
                  placeholder="Type password here..."
                  className="w-full px-4 py-3 bg-white/10 border-2 border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword('');
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
              {React.createElement(MessageSquare, { className: "w-12 h-12 text-white" })}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Send Anonymous Message
            </h1>
            <p className="text-purple-200 text-lg">
              Share your thoughts freely and anonymously
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4">
                {React.createElement(Send, { className: "w-12 h-12 text-green-300" })}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">✅ Message Sent!</h2>
              <p className="text-purple-200 mb-6">Your anonymous message has been delivered</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition"
              >
                Send Another
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <p className="w-full text-purple-200 text-sm mb-2">💡 Quick starters:</p>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(sug)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-full text-sm transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your anonymous message here..."
                  className="w-full h-48 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
                <p className="text-purple-300 text-sm mt-2">{message.length} characters</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {React.createElement(Send, { className: "w-5 h-5" })}
                Send Anonymously
              </button>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                {React.createElement(Lock, { className: "w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" })}
                <p className="text-sm text-purple-200">
                  Your message is completely anonymous. We only track basic device info for analytics.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-purple-300 mt-6 text-sm">
          🔐 Powered by anonymous messaging • Your privacy matters
        </p>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
