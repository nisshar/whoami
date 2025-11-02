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
    if (isAdmin) loadAdminData();
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
      const todayVisitors = visList.filter(
        (v) => new Date(v.timestamp).toDateString() === today
      ).length;

      setStats({
        total: visList.length,
        today: todayVisitors,
        messages: msgList.length
      });
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

  /* ------------------------- ADMIN DASHBOARD ------------------------- */
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎯 Admin Dashboard</h1>
              <p className="text-purple-300">Monitor visitors and messages</p>
            </div>
            <button
              onClick={() => setIsAdmin(false)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Logout
            </button>
          </div>

          {loading ? (
            <p className="text-center text-xl py-12">Loading data...</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Visitors" value={stats.total} Icon={Users} color="text-purple-400" />
                <StatCard label="Today" value={stats.today} Icon={Eye} color="text-blue-400" />
                <StatCard label="Messages" value={stats.messages} Icon={MessageSquare} color="text-green-400" />
              </div>

              {/* Messages */}
              <Section title="Anonymous Messages" Icon={MessageSquare}>
                {messages.length === 0 ? (
                  <EmptyState text="No messages yet" />
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.slice().reverse().map((msg) => (
                      <div key={msg.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <p className="text-white mb-2">{msg.text}</p>
                        <p className="text-purple-300 text-sm">
                          📅 {new Date(msg.timestamp).toLocaleString()} • 📱 {msg.device} • 🌐 {msg.browser}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Visitors */}
              <Section title="Visitor Analytics" Icon={BarChart3}>
                {visitors.length === 0 ? (
                  <EmptyState text="No visitor data captured yet" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20 text-purple-300">
                          <th className="py-2 px-2 text-left">Time</th>
                          <th className="py-2 px-2 text-left">Device</th>
                          <th className="py-2 px-2 text-left">Browser</th>
                          <th className="py-2 px-2 text-left">Timezone</th>
                          <th className="py-2 px-2 text-left">Resolution</th>
                          <th className="py-2 px-2 text-left">Language</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitors.slice().reverse().slice(0, 50).map((v) => (
                          <tr key={v.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-2 px-2">{new Date(v.timestamp).toLocaleString()}</td>
                            <td className="py-2 px-2">{getDeviceType(v.userAgent)}</td>
                            <td className="py-2 px-2">{getBrowser(v.userAgent)}</td>
                            <td className="py-2 px-2">{v.timezone}</td>
                            <td className="py-2 px-2">{v.screenRes}</td>
                            <td className="py-2 px-2">{v.language}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    );
  }

  /* --------------------------- USER VIEW --------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* ADMIN BUTTON */}
      <button
        onClick={() => setShowLoginModal(true)}
        className="fixed top-6 right-6 z-40 px-5 py-3 bg-slate-800/80 rounded-full border border-purple-400/50 hover:scale-105 transition flex items-center gap-2"
      >
        <Shield className="w-5 h-5 text-purple-300" />
        <span className="text-white font-semibold">Admin</span>
      </button>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800/90 rounded-3xl p-8 max-w-md w-full border border-purple-400/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-400" /> Admin Login
              </h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-purple-300 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 mb-6"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold hover:scale-105 transition"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-white" />
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
                <Send className="w-12 h-12 text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">✅ Message Sent!</h2>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition"
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <p className="w-full text-purple-200 text-sm mb-2">💡 Quick starters:</p>
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(sug)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-full text-sm transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your anonymous message..."
                className="w-full h-48 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white resize-none"
              />
              <p className="text-purple-300 text-sm mt-2">{message.length} characters</p>

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl mt-4 flex items-center justify-center gap-2 hover:scale-105 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" /> Send Anonymously
              </button>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-4">
                <Lock className="w-5 h-5 text-purple-300" />
                <p className="text-sm text-purple-200">
                  Your message is completely anonymous. We only track basic device info for analytics.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-purple-300 mt-6 text-sm">
          🔐 Powered by Anonymous Messenger • Your privacy matters
        </p>
      </div>
    </div>
  );
};

/* ---------------------- Helper Components ---------------------- */
const StatCard = ({ label, value, Icon, color }) => (
  <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-purple-300 text-sm mb-1">{label}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
      <Icon className={`w-12 h-12 ${color}`} />
    </div>
  </div>
);

const Section = ({ title, Icon, children }) => (
  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 mb-8">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <Icon className="w-6 h-6" /> {title}
    </h2>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="text-center py-12 text-purple-300">{text}</div>
);

ReactDOM.render(<App />, document.getElementById('root'));
