// app.js (drop next to index.html)
// Compiled in-browser by Babel (type="text/babel")

/* eslint-disable no-console */
const { useState, useEffect, useRef } = React;

// Safely get lucide react icons (global from UMD bundle)
const Lucide = typeof LucideReact !== 'undefined' ? LucideReact : null;

// Minimal fallback icons (small inline SVGs) if LucideReact fails for any reason
const FallbackIcon = ({ children }) => (
  <span className="inline-block w-5 h-5 text-white align-middle" aria-hidden>{children}</span>
);

const SendIcon = (props) => Lucide?.Send ? <Lucide.Send {...props} /> : <FallbackIcon>➤</FallbackIcon>;
const EyeIcon = (props) => Lucide?.Eye ? <Lucide.Eye {...props} /> : <FallbackIcon>👁</FallbackIcon>;
const UsersIcon = (props) => Lucide?.Users ? <Lucide.Users {...props} /> : <FallbackIcon>👥</FallbackIcon>;
const MsgIcon = (props) => Lucide?.MessageSquare ? <Lucide.MessageSquare {...props} /> : <FallbackIcon>✉️</FallbackIcon>;
const LockIcon = (props) => Lucide?.Lock ? <Lucide.Lock {...props} /> : <FallbackIcon>🔒</FallbackIcon>;
const ChartIcon = (props) => Lucide?.BarChart3 ? <Lucide.BarChart3 {...props} /> : <FallbackIcon>📊</FallbackIcon>;
const ShieldIcon = (props) => Lucide?.Shield ? <Lucide.Shield {...props} /> : <FallbackIcon>🛡️</FallbackIcon>;
const XIcon = (props) => Lucide?.X ? <Lucide.X {...props} /> : <FallbackIcon>✕</FallbackIcon>;

// Utilities
const safeParse = (s) => {
  try { return JSON.parse(s || '[]') } catch (e) { return [] }
};

const uid = (prefix='id') => `${prefix}_${Date.now()}_${Math.floor(Math.random()*100000)}`;

const getDeviceType = (ua = navigator.userAgent) => {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
};

const getBrowser = (ua = navigator.userAgent) => {
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  return 'Other';
};

// Main App
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const [messages, setMessages] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, messages: 0 });

  const suggestions = [
    "I've always wanted to tell you...",
    "What I admire most about you is...",
    "A confession: ",
    "You should know that...",
    "My honest opinion about you...",
    "Something I've noticed about you...",
    "If I could tell you one thing..."
  ];

  // initial: capture visitor and hydrate local state
  useEffect(() => {
    captureVisitor();
    const msgs = safeParse(localStorage.getItem('messages'));
    const vis = safeParse(localStorage.getItem('visitors'));
    setMessages(msgs);
    setVisitors(vis);
    setStats(calculateStats(msgs, vis));
  }, []);

  // calculate stats
  const calculateStats = (msgList = [], visList = []) => {
    const today = new Date().toDateString();
    const todayCount = visList.filter(v => {
      try { return new Date(v.timestamp).toDateString() === today } catch { return false }
    }).length;
    return { total: visList.length, today: todayCount, messages: msgList.length };
  };

  // capture visitor details (localStorage)
  const captureVisitor = () => {
    try {
      const v = {
        id: uid('visitor'),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        referrer: document.referrer || 'Direct',
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled
      };
      const existing = safeParse(localStorage.getItem('visitors'));
      existing.push(v);
      localStorage.setItem('visitors', JSON.stringify(existing));
      setVisitors(existing);
      setStats(s => ({ ...s, total: existing.length }));
      console.log('Visitor captured', v);
    } catch (err) {
      console.warn('Failed to capture visitor', err);
    }
  };

  // handle message submit
  const handleSubmit = () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    const msg = {
      id: uid('msg'),
      text: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      device: getDeviceType(),
      browser: getBrowser()
    };
    try {
      const existing = safeParse(localStorage.getItem('messages'));
      existing.push(msg);
      localStorage.setItem('messages', JSON.stringify(existing));
      setMessages(existing);
      setStats(calculateStats(existing, visitors));
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 2000);
      console.log('Message saved', msg);
    } catch (err) {
      console.error('Failed to save message', err);
      alert('Failed to send message. Try again.');
    }
  };

  // admin login (simple local password)
  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      loadAdminData();
      return;
    }
    alert('Incorrect password');
    setPassword('');
  };

  const loadAdminData = () => {
    setLoadingAdmin(true);
    try {
      const msgList = safeParse(localStorage.getItem('messages'));
      const visList = safeParse(localStorage.getItem('visitors'));
      setMessages(msgList);
      setVisitors(visList);
      setStats(calculateStats(msgList, visList));
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  // Admin view
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">🎯 Admin Dashboard</h1>
              <p className="text-purple-300">Monitor visitors & messages</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={logoutAdmin} className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30">
                Logout
              </button>
            </div>
          </div>

          {loadingAdmin ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Visitors" value={stats.total} Icon={UsersIcon} />
                <StatCard label="Today" value={stats.today} Icon={EyeIcon} />
                <StatCard label="Messages" value={stats.messages} Icon={MsgIcon} />
              </div>

              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MsgIcon /> Anonymous Messages ({messages.length})</h2>
                {messages.length === 0 ? (
                  <div className="text-purple-300 py-6">No messages yet.</div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.slice().reverse().map(m => (
                      <div key={m.id} className="bg-white/3 p-4 rounded-lg border border-white/10">
                        <p className="text-white mb-2">{m.text}</p>
                        <div className="text-sm text-purple-300">
                          📅 {new Date(m.timestamp).toLocaleString()} · {m.device} · {m.browser}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ChartIcon /> Visitor Analytics ({visitors.length})</h2>
                {visitors.length === 0 ? (
                  <div className="text-purple-300 py-6">No visitor data captured yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-purple-300 border-b border-white/20">
                          <th className="py-2 px-2">Time</th>
                          <th className="py-2 px-2">Device</th>
                          <th className="py-2 px-2">Browser</th>
                          <th className="py-2 px-2">Timezone</th>
                          <th className="py-2 px-2">Resolution</th>
                          <th className="py-2 px-2">Language</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitors.slice().reverse().slice(0, 50).map(v => (
                          <tr key={v.id} className="border-b border-white/10 hover:bg-white/3">
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
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // User view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <button
        onClick={() => setShowLogin(true)}
        className="fixed top-6 right-6 z-40 px-4 py-2 rounded-full bg-slate-800/80 text-white border border-purple-400/30 flex items-center gap-2"
      >
        <ShieldIcon /> <span className="font-semibold">Admin</span>
      </button>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 rounded-2xl p-6 w-full max-w-md border border-purple-400/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldIcon /> Admin Login</h3>
              <button onClick={() => { setShowLogin(false); setPassword(''); }} className="text-purple-300"><XIcon /></button>
            </div>
            <input
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg bg-white/5 text-white mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleLogin} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">Login</button>
              <button onClick={() => { setShowLogin(false); setPassword(''); }} className="px-4 py-2 rounded-lg bg-white/5 text-white">Cancel</button>
            </div>
            <p className="text-xs mt-3 text-purple-300">Default admin password: <code className="bg-black/30 px-2 py-1 rounded">admin123</code></p>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full">
        <div className="bg-white/6 rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4"><MsgIcon /></div>
            <h1 className="text-4xl font-bold text-white mb-2">Send Anonymous Message</h1>
            <p className="text-purple-200">Share your thoughts freely and anonymously</p>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4"><SendIcon /></div>
              <h2 className="text-2xl font-bold text-white mb-2">✅ Message Sent!</h2>
              <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-white/10 rounded-lg text-white">Send Another</button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
