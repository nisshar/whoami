// app.js
// Drop next to index.html. This file is compiled by Babel in-browser (type="text/babel").

/* eslint-disable no-console */
const { useState, useEffect, useRef } = React;
const Lucide = typeof LucideReact !== 'undefined' ? LucideReact : null;

// Fallback icons if LucideReact is not available
const IconFallback = ({ children }) => <span className="inline-block w-5 h-5 text-white align-middle">{children}</span>;
const SendIcon = (props) => Lucide?.Send ? <Lucide.Send {...props} /> : <IconFallback>➤</IconFallback>;
const EyeIcon = (props) => Lucide?.Eye ? <Lucide.Eye {...props} /> : <IconFallback>👁</IconFallback>;
const UsersIcon = (props) => Lucide?.Users ? <Lucide.Users {...props} /> : <IconFallback>👥</IconFallback>;
const MsgIcon = (props) => Lucide?.MessageSquare ? <Lucide.MessageSquare {...props} /> : <IconFallback>✉️</IconFallback>;
const LockIcon = (props) => Lucide?.Lock ? <Lucide.Lock {...props} /> : <IconFallback>🔒</IconFallback>;
const ChartIcon = (props) => Lucide?.BarChart3 ? <Lucide.BarChart3 {...props} /> : <IconFallback>📊</IconFallback>;
const ShieldIcon = (props) => Lucide?.Shield ? <Lucide.Shield {...props} /> : <IconFallback>🛡️</IconFallback>;
const XIcon = (props) => Lucide?.X ? <Lucide.X {...props} /> : <IconFallback>✕</IconFallback>;

const safeParse = (s) => {
  try { return JSON.parse(s || '[]'); } catch { return []; }
};
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random()*100000)}`;

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

/* ---------------- Profile storage helpers ---------------- */
const PROFILE_KEY = 'anon_profile';
const loadProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || null; } catch { return null; }
};
const saveProfile = (p) => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { console.warn('profile save failed', e); }
};
const clearProfile = () => { try { localStorage.removeItem(PROFILE_KEY); } catch (e) {} };

/* ---------------- App ---------------- */
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
  const [profile, setProfile] = useState(loadProfile());

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
    // hydrate messages & visitors and capture visitor
    const msgs = safeParse(localStorage.getItem('messages'));
    const vis = safeParse(localStorage.getItem('visitors'));
    setMessages(msgs);
    setVisitors(vis);
    setStats(calcStats(msgs, vis));
    captureVisitor();
  }, []);

  // recalc stats helper
  const calcStats = (msgList = [], visList = []) => {
    const today = new Date().toDateString();
    const todayCount = visList.filter(v => {
      try { return new Date(v.timestamp).toDateString() === today; } catch { return false; }
    }).length;
    return { total: visList.length, today: todayCount, messages: msgList.length };
  };

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

  // Submit message (includes profile snapshot)
  const handleSubmit = () => {
    if (!message.trim()) { alert('Please enter a message'); return; }
    const profileSnapshot = loadProfile(); // may be null
    const msg = {
      id: uid('msg'),
      text: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      device: getDeviceType(),
      browser: getBrowser(),
      profile: profileSnapshot
    };
    try {
      const existing = safeParse(localStorage.getItem('messages'));
      existing.push(msg);
      localStorage.setItem('messages', JSON.stringify(existing));
      setMessages(existing);
      setStats(calcStats(existing, visitors));
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 2000);
      console.log('Message saved', msg);
    } catch (err) {
      console.error('Failed to save message', err);
      alert('Failed to send message. Try again.');
    }
  };

  // Admin login (local quick password)
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
      setStats(calcStats(msgList, visList));
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally { setLoadingAdmin(false); }
  };
  const logoutAdmin = () => setIsAdmin(false);

  /* ---------- Admin view ---------- */
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
              <button onClick={logoutAdmin} className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30">Logout</button>
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
                        <div className="flex items-center gap-3 mb-3">
                          {m.profile?.emoji ? <div className="text-2xl">{m.profile.emoji}</div> : null}
                          <div>
                            <div className="text-sm text-purple-300">To: <span className="text-white font-semibold">{m.profile?.displayName || 'Someone'}</span></div>
                            {m.profile?.interests?.length ? (
                              <div className="text-xs text-purple-300">Likes: {m.profile.interests.join(', ')}</div>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-white mb-2">{m.text}</p>
                        <div className="text-sm text-purple-300">📅 {new Date(m.timestamp).toLocaleString()} · {m.device} · {m.browser}</div>
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

  /* ---------------- User view ---------------- */
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

          {/* Profile Picker */}
          <ProfilePicker profile={profile} setProfile={(p) => { setProfile(p); saveProfile(p); }} />

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

              {/* Preview line showing personalization (if any) */}
              {profile ? (
                <div className="mb-3 text-sm text-purple-200">
                  Sending {profile.displayName ? `to ${profile.displayName}` : 'anonymously'}{profile.interests?.length ? ` — likes ${profile.interests.slice(0,3).join(', ')}` : ''}.
                </div>
              ) : null}

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
                <p className="text-sm text-purple-200">Optional profile is saved locally only. No personal information is required.</p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-purple-300 mt-4 text-sm">🔐 Powered by Anonymous Messenger • Local demo (no server)</p>
      </div>
    </div>
  );
}

/* ---------------- ProfilePicker component ---------------- */
const defaultInterests = ['football','coding','desi food','music','reading','ambitious'];

function ProfilePicker({ profile, setProfile }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile || {
    displayName: '',
    gender: '',
    interests: [],
    emoji: ''
  });

  useEffect(() => setDraft(profile || { displayName:'', gender:'', interests:[], emoji:'' }), [profile]);

  const toggleInterest = (tag) => {
    setDraft(d => {
      const found = d.interests.includes(tag);
      return { ...d, interests: found ? d.interests.filter(t => t !== tag) : [...d.interests, tag] };
    });
  };

  const addCustomInterest = () => {
    const val = (prompt('Add interest (short):') || '').trim();
    if (!val) return;
    setDraft(d => ({ ...d, interests: Array.from(new Set([...d.interests, val])) }));
  };

  const handleSave = () => {
    setProfile(draft);
    saveProfile(draft);
    setOpen(false);
  };

  const handleClear = () => {
    clearProfile();
    setProfile(null);
    setDraft({ displayName:'', gender:'', interests:[], emoji:'' });
    setOpen(false);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="px-3 py-1.5 bg-white/10 text-sm text-purple-200 rounded-full"
          aria-expanded={open}
        >
          {profile?.emoji ? <span className="mr-2">{profile.emoji}</span> : null}
          {profile?.displayName ? `To: ${profile.displayName}` : 'Add a profile (optional)'}
        </button>

        {profile ? (
          <button onClick={() => { clearProfile(); setProfile(null); }} className="text-xs text-purple-300">Clear</button>
        ) : null}
      </div>

      {open && (
        <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-xs text-purple-300 mb-1">Display name (optional)</label>
          <input value={draft.displayName} onChange={e => setDraft({ ...draft, displayName: e.target.value })}
            placeholder="e.g. Nishant" className="w-full mb-3 px-3 py-2 rounded bg-white/6 text-white" />

          <label className="block text-xs text-purple-300 mb-1">Gender (optional)</label>
          <div className="flex gap-3 mb-3">
            {['Male','Female','Other','Prefer not to say'].map(g => (
              <label key={g} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  checked={draft.gender === g}
                  onChange={() => setDraft(d => ({ ...d, gender: g }))}
                />
                <span className="text-sm text-purple-200">{g}</span>
              </label>
            ))}
          </div>

          <label className="block text-xs text-purple-300 mb-1">Interests (tap to toggle)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {defaultInterests.map(tag => {
              const selected = draft.interests.includes(tag);
              return (
                <button key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-2 py-1 rounded-full text-sm ${selected ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200'}`}>
                  {tag}
                </button>
              );
            })}
            <button onClick={addCustomInterest} className="px-2 py-1 rounded-full bg-white/10 text-sm text-purple-200">+ Add</button>
          </div>

          <label className="block text-xs text-purple-300 mb-1">Emoji (optional)</label>
          <input value={draft.emoji} onChange={e => setDraft(d => ({ ...d, emoji: e.target.value }))} placeholder="🙂" className="px-3 py-2 rounded bg-white/6 text-white mb-3"/>

          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">Save</button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded bg-white/10 text-white">Cancel</button>
            <button onClick={handleClear} className="ml-auto text-sm text-red-400">Clear saved</button>
          </div>

          <p className="text-xs text-purple-300 mt-3">Optional. Saved locally only in this browser.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI helpers ---------------- */
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
