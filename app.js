// app.js
// Drop next to index.html. Compiled in-browser by Babel (type="text/babel").

const { useState, useEffect } = React;
const Lucide = typeof LucideReact !== 'undefined' ? LucideReact : null;

/* Icon fallbacks */
const IconFallback = ({ children }) => <span className="inline-block w-5 h-5 text-white align-middle">{children}</span>;
const SendIcon = (props) => Lucide?.Send ? <Lucide.Send {...props} /> : <IconFallback>➤</IconFallback>;
const EyeIcon = (props) => Lucide?.Eye ? <Lucide.Eye {...props} /> : <IconFallback>👁</IconFallback>;
const UsersIcon = (props) => Lucide?.Users ? <Lucide.Users {...props} /> : <IconFallback>👥</IconFallback>;
const MsgIcon = (props) => Lucide?.MessageSquare ? <Lucide.MessageSquare {...props} /> : <IconFallback>✉️</IconFallback>;
const LockIcon = (props) => Lucide?.Lock ? <Lucide.Lock {...props} /> : <IconFallback>🔒</IconFallback>;
const ChartIcon = (props) => Lucide?.BarChart3 ? <Lucide.BarChart3 {...props} /> : <IconFallback>📊</IconFallback>;
const ShieldIcon = (props) => Lucide?.Shield ? <Lucide.Shield {...props} /> : <IconFallback>🛡️</IconFallback>;
const XIcon = (props) => Lucide?.X ? <Lucide.X {...props} /> : <IconFallback>✕</IconFallback>;

const safeParse = (s) => { try { return JSON.parse(s || '[]'); } catch { return []; } };
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

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

/* ---------------- constants and keys ---------------- */
const GENDER_LOGS_KEY = 'gender_logs';
const MESSAGES_KEY = 'messages';
const VISITORS_KEY = 'visitors';

// Admin password (hidden via Base64) - demo only.
// atob("YWRtaW4xMjM=") => "admin123"
const ADMIN_PASS = typeof atob === 'function' ? atob("YWRtaW4xMjM=") : "admin123";

/* ---------------- logging helpers ---------------- */
function pushGenderLog(entry) {
  try {
    const logs = safeParse(localStorage.getItem(GENDER_LOGS_KEY));
    logs.push(entry);
    localStorage.setItem(GENDER_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('gender log save failed', e);
  }
}

/* ---------------- main App ---------------- */
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const [messages, setMessages] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [genderLogs, setGenderLogs] = useState([]);

  // gender dropdown state; empty string means "Not specified"
  const [selectedGender, setSelectedGender] = useState('');

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
    const msgs = safeParse(localStorage.getItem(MESSAGES_KEY));
    const vis = safeParse(localStorage.getItem(VISITORS_KEY));
    const glogs = safeParse(localStorage.getItem(GENDER_LOGS_KEY));
    setMessages(msgs);
    setVisitors(vis);
    setGenderLogs(glogs);
    captureVisitor();
  }, []);

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
      const existing = safeParse(localStorage.getItem(VISITORS_KEY));
      existing.push(v);
      localStorage.setItem(VISITORS_KEY, JSON.stringify(existing));
      setVisitors(existing);
      console.log('Visitor captured', v);
    } catch (err) {
      console.warn('Failed to capture visitor', err);
    }
  };

  const calcStats = (msgList = [], visList = []) => {
    const today = new Date().toDateString();
    const todayCount = visList.filter(v => {
      try { return new Date(v.timestamp).toDateString() === today; } catch { return false; }
    }).length;
    return { total: visList.length, today: todayCount, messages: msgList.length };
  };

  // Submit message; include snapshot of selectedGender (can be '')
  const handleSubmit = () => {
    if (!message.trim()) { alert('Please enter a message'); return; }
    const msg = {
      id: uid('msg'),
      text: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      device: getDeviceType(),
      browser: getBrowser(),
      selectedGender: selectedGender || null
    };
    try {
      const existing = safeParse(localStorage.getItem(MESSAGES_KEY));
      existing.push(msg);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(existing));
      setMessages(existing);
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 2000);
      console.log('Message saved', msg);
    } catch (err) {
      console.error('Failed to save message', err);
      alert('Failed to send message. Try again.');
    }
  };

  // Admin login: uses ADMIN_PASS (decoded from Base64)
  const handleLogin = () => {
    if (password === ADMIN_PASS) {
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
      const msgList = safeParse(localStorage.getItem(MESSAGES_KEY));
      const visList = safeParse(localStorage.getItem(VISITORS_KEY));
      const glogs = safeParse(localStorage.getItem(GENDER_LOGS_KEY));
      setMessages(msgList);
      setVisitors(visList);
      setGenderLogs(glogs);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally { setLoadingAdmin(false); }
  };

  const logoutAdmin = () => setIsAdmin(false);

  /* ---------- Admin view ---------- */
  if (isAdmin) {
    const stats = calcStats(messages, visitors);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">🎯 Admin Dashboard</h1>
              <p className="text-purple-300">Monitor visitors, messages & gender interactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={logoutAdmin} className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30">Logout</button>
            </div>
          </div>

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
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {messages.slice().reverse().map(m => (
                  <div key={m.id} className="bg-white/3 p-4 rounded-lg border border-white/10">
                    <p className="text-white mb-2">{m.text}</p>
                    <div className="text-sm text-purple-300">📅 {new Date(m.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-purple-300 mt-2">
                      {m.selectedGender ? `Gender selected at send: ${m.selectedGender}` : 'Gender: not specified'}
                      {' • '}{m.device} • {m.browser}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
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

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">⚑ Gender Interactions ({genderLogs.length})</h2>
            {genderLogs.length === 0 ? (
              <div className="text-purple-300 py-6">No gender interactions logged yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-purple-300 border-b border-white/20">
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Action</th>
                      <th className="py-2 px-2">Value</th>
                      <th className="py-2 px-2">Device</th>
                      <th className="py-2 px-2">Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genderLogs.slice().reverse().slice(0, 200).map(g => (
                      <tr key={g.id} className="border-b border-white/10 hover:bg-white/3">
                        <td className="py-2 px-2">{new Date(g.timestamp).toLocaleString()}</td>
                        <td className="py-2 px-2">{g.action}</td>
                        <td className="py-2 px-2">{g.value || '-'}</td>
                        <td className="py-2 px-2">{g.device || getDeviceType(g.userAgent)}</td>
                        <td className="py-2 px-2">{g.browser || getBrowser(g.userAgent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- User view ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      {/* Small icon-only admin button tucked in the corner */}
      <button
        onClick={() => setShowLogin(true)}
        aria-label="Open admin login"
        title="Admin"
        className="fixed top-4 right-4 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/85 border border-purple-400/30 shadow-sm hover:scale-105 transition transform"
      >
        <ShieldIcon className="w-4 h-4 text-white" />
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
            {/* Password hint removed per request */}
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

          {/* Gender dropdown (optional) */}
          <div className="mb-4">
            <label className="text-sm text-purple-200 block mb-2">Gender (optional)</label>
            <select
              value={selectedGender}
              onChange={(e) => {
                const val = e.target.value;
                // log selection
                const entry = {
                  id: uid('gender'),
                  action: 'select',
                  value: val || null,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  device: getDeviceType(),
                  browser: getBrowser()
                };
                pushGenderLog(entry);
                setSelectedGender(val);
                setTimeout(() => {
                  try { setGenderLogs(safeParse(localStorage.getItem(GENDER_LOGS_KEY))); } catch {}
                }, 50);
              }}
              onFocus={() => {
                // log open event
                const entry = {
                  id: uid('gender'),
                  action: 'open',
                  value: null,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  device: getDeviceType(),
                  browser: getBrowser()
                };
                pushGenderLog(entry);
                setTimeout(() => {
                  try { setGenderLogs(safeParse(localStorage.getItem(GENDER_LOGS_KEY))); } catch {}
                }, 50);
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/5 text-white"
            >
              <option value="">Not specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <p className="text-xs text-purple-300 mt-2">Selecting gender is optional. Interactions are logged locally for analytics shown to admin.</p>
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
                <p className="w-full text-purple-200 text-sm mb-2">💡 Quick starters:</p>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setMessage(s)} className="px-3 py-1.5 bg-white/10 rounded-full text-purple-200 text-sm">{s}</button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your anonymous message here..."
                className="w-full h-48 px-4 py-3 rounded-2xl bg-white/5 text-white placeholder-purple-300 resize-none"
              />
              <p className="text-purple-300 text-sm mt-2">{message.length} characters</p>

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2 justify-center"><SendIcon /> Send Anonymously</span>
              </button>

              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-3">
                <LockIcon />
                <p className="text-sm text-purple-200">Gender selection is optional and logs are stored locally (this browser) for analytics. No personal identifiers are required.</p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-purple-300 mt-4 text-sm">🔐 Powered by Anonymous Messenger • Local demo (no server)</p>
      </div>
    </div>
  );
}

/* ---------------- small UI helpers ---------------- */
function StatCard({ label, value, Icon }) {
  return (
    <div className="bg-white/6 rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-purple-300">{label}</p>
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        <div className="text-2xl text-purple-400"><Icon /></div>
      </div>
    </div>
  );
}

/* ---------------- mount ---------------- */
const rootEl = document.getElementById('root');
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootEl).render(<App />);
} else {
  ReactDOM.render(<App />, rootEl);
}
