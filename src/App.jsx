import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Home, Settings, Flame, Palette, ArrowLeft, Camera, CheckCircle, Trash2, X, Leaf, ChevronDown, ChevronUp, Users, MessageSquare, Calendar, BookOpen, Send, ChevronRight, LogOut } from 'lucide-react';
import AuthScreen from './pages/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { projects as projectsApi } from './lib/api/projects';
import { glazes as glazesApi } from './lib/api/glazes';
import { isSupabaseConfigured } from './lib/supabase';
import storage from './utils/storage';

function CoastalKilnApp() {
  const { user, profile, loading: authLoading, isAuthenticated, isOnline, signIn, signUp, signOut, resetPassword, updateProfile } = useAuth();

  const [offlineMode, setOfflineMode] = useState(false);

  // Use profile from auth context, fallback to default for offline mode
  const displayProfile = profile || { username: 'Potter', email: '', bio: '', location: '', units: 'metric' };
  const setDisplayProfile = (updates) => {
    if (typeof updates === 'function') {
      updateProfile(updates(displayProfile));
    } else {
      updateProfile(updates);
    }
  };
  const [currentView, setCurrentView] = useState('studio');
  const [tab, setTab] = useState('pieces');
  const [sustainableTab, setSustainableTab] = useState('reclaim');
  const [guildTab, setGuildTab] = useState('my-guilds');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'post' | 'resource' | null
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState('main');
  const [selected, setSelected] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedGuild, setSelectedGuild] = useState(null);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [glazes, setGlazes] = useState([]);
  const [glazesLoading, setGlazesLoading] = useState(true);

  const [reclaimBatches, setReclaimBatches] = useState(() => storage.get('reclaimBatches', [
    { id: '1', weight: 5.5, source: 'Trimming scraps', date: '2026-01-10', status: 'drying', notes: 'Mixed porcelain and stoneware' }
  ]));

  const [studioTips, setStudioTips] = useState(() => storage.get('studioTips', [
    { id: '1', category: 'clay_reclaim', title: 'Clay Reclaim Process', content: 'Collect scraps in a bucket, separate by clay type when possible. Add water to fully submerge, let slake for 24-48 hours. Pour onto plaster bats or canvas to dry to workable consistency. Wedge thoroughly before use.', tags: ['Clay Reuse', 'Water Conservation'] },
    { id: '2', category: 'diy_tools', title: 'Make Your Own Ribbon Tools', content: 'Cut old hacksaw blades into 6-inch strips. Bend into loops and secure with wire or tape. File any sharp edges. Free tools that work as well as store-bought!', tags: ['Cost Saving', 'Recycling'] },
    { id: '3', category: 'plaster_bats', title: 'Casting Plaster Bats', content: 'Use pottery #1 plaster, mix ratio 100 parts plaster to 70 parts water by weight. Pour into a level mold (bucket lids work great). Let set 45 minutes before removing. Cure for 2-3 days before first use.', tags: ['Cost Saving', 'Studio Setup'] }
  ]));

  const [guilds, setGuilds] = useState(() => storage.get('guilds', [
    { id: '1', name: 'Wellington Potters Guild', members: 24, memberList: ['Hannah', 'Sarah', 'Mike'], location: 'Wellington, NZ', description: 'Weekly throws and quarterly exhibitions', isMember: true, isAdmin: true, event: 'Wood Firing Workshop - Jan 25', posts: [{ id: '1', author: 'Sarah', content: 'Anyone interested in a group wood firing next month?', time: '2 hours ago' }], resources: [{ id: '1', title: 'Studio Safety Guidelines', type: 'PDF', addedBy: 'Admin' }], inviteCode: 'WPG2026' },
    { id: '2', name: 'Auckland Clay Collective', members: 18, memberList: [], location: 'Auckland, NZ', description: 'Community studio for all skill levels', isMember: false, isAdmin: false, event: null, posts: [], resources: [], inviteCode: 'ACC2026' }
  ]));

  // Load projects from Supabase when authenticated
  useEffect(() => {
    const loadProjects = async (retries = 3) => {
      if (!isAuthenticated) {
        setProjectsLoading(false);
        return;
      }

      if (isSupabaseConfigured() && !offlineMode) {
        try {
          setProjectsLoading(true);
          // Add delay to let Supabase initialize
          await new Promise(r => setTimeout(r, 200));
          const data = await projectsApi.list();
          // Transform Supabase data to match app format
          const transformed = data.map(p => ({
            id: p.id,
            title: p.title,
            clay: p.clay_body,
            stage: p.stage,
            date: p.created_at?.split('T')[0],
            photos: p.photos || [],
            notes: (p.notes || []).reduce((acc, n) => ({ ...acc, [n.stage]: n.content }), {}),
            glazeIds: p.glaze_ids || [],
          }));
          setProjects(transformed);
        } catch (error) {
          if (error.name === 'AbortError' && retries > 0) {
            console.log(`🔄 Retrying loadProjects (${retries} left)...`);
            await new Promise(r => setTimeout(r, 500));
            return loadProjects(retries - 1);
          }
          console.error('Error loading projects:', error?.message || error?.code || JSON.stringify(error));
          // Fallback to localStorage
          setProjects(storage.get('projects', []));
        } finally {
          setProjectsLoading(false);
        }
      } else {
        // Offline mode - use localStorage
        setProjects(storage.get('projects', []));
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [isAuthenticated, offlineMode]);

  // Load glazes from Supabase when authenticated
  useEffect(() => {
    const loadGlazes = async (retries = 3) => {
      if (!isAuthenticated) {
        setGlazesLoading(false);
        return;
      }

      if (isSupabaseConfigured() && !offlineMode) {
        try {
          setGlazesLoading(true);
          // Add delay to let Supabase initialize
          await new Promise(r => setTimeout(r, 300));
          const data = await glazesApi.list();
          // Transform Supabase data to match app format
          const transformed = data.map(g => ({
            id: g.id,
            name: g.name,
            type: g.firing_type,
            recipe: g.recipe || '',
            notes: g.notes || '',
            tiles: (g.tiles || []).map(t => ({
              id: t.id,
              url: t.url,
              storage_path: t.storage_path,
            })),
          }));
          setGlazes(transformed);
        } catch (error) {
          if (error.name === 'AbortError' && retries > 0) {
            console.log(`🔄 Retrying loadGlazes (${retries} left)...`);
            await new Promise(r => setTimeout(r, 500));
            return loadGlazes(retries - 1);
          }
          console.error('Error loading glazes:', error?.message || error?.code || JSON.stringify(error));
          // Fallback to localStorage
          setGlazes(storage.get('glazes', []));
        } finally {
          setGlazesLoading(false);
        }
      } else {
        // Offline mode - use localStorage
        setGlazes(storage.get('glazes', []));
        setGlazesLoading(false);
      }
    };

    loadGlazes();
  }, [isAuthenticated, offlineMode]);

  // Save to localStorage only in offline mode
  useEffect(() => {
    if (offlineMode || !isSupabaseConfigured()) {
      storage.set('projects', projects);
    }
  }, [projects, offlineMode]);
  useEffect(() => {
    if (offlineMode || !isSupabaseConfigured()) {
      storage.set('glazes', glazes);
    }
  }, [glazes, offlineMode]);
  useEffect(() => { storage.set('reclaimBatches', reclaimBatches); }, [reclaimBatches]);
  useEffect(() => { storage.set('studioTips', studioTips); }, [studioTips]);
  useEffect(() => { storage.set('guilds', guilds); }, [guilds]);

  const [expandedTips, setExpandedTips] = useState({ clay_reclaim: true, diy_tools: false, plaster_bats: false, other: false });
  const [tipsViewMode, setTipsViewMode] = useState('grouped'); // 'grouped' | 'flat'

  const [form, setForm] = useState({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' });

  const stages = ['wedging', 'throwing', 'trimming', 'drying', 'bisque', 'glazing', 'firing', 'complete'];

  const stageColors = {
    wedging: 'bg-amber-100 text-amber-800', throwing: 'bg-orange-100 text-orange-800',
    trimming: 'bg-yellow-100 text-yellow-800', drying: 'bg-lime-100 text-lime-800',
    bisque: 'bg-cyan-100 text-cyan-800', glazing: 'bg-pink-100 text-pink-800',
    firing: 'bg-purple-100 text-purple-800', complete: 'bg-green-100 text-green-800'
  };

  const formatStage = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const nextStage = (current) => {
    const idx = stages.indexOf(current);
    return idx < stages.length - 1 ? stages[idx + 1] : null;
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Please select an image under 5MB');
      return;
    }

    try {
      if (isSupabaseConfigured() && !offlineMode) {
        if (type === 'project') {
          // Upload project photo to Supabase storage
          const photo = await projectsApi.addPhoto(selected.id, file, selected.stage, user?.id);
          setProjects(p => p.map(x => x.id === selected.id ? { ...x, photos: [...x.photos, photo] } : x));
          setSelected({ ...selected, photos: [...selected.photos, photo] });
        } else {
          // Upload glaze tile to Supabase storage
          const tile = await glazesApi.addTile(selected.id, file, null, null, user?.id);
          const newTile = { id: tile.id, url: tile.url, storage_path: tile.storage_path };
          setGlazes(g => g.map(x => x.id === selected.id ? { ...x, tiles: [...x.tiles, newTile] } : x));
          setSelected({ ...selected, tiles: [...selected.tiles, newTile] });
        }
      } else {
        // Offline mode - use base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const photo = { id: Date.now().toString(), url: reader.result };
          if (type === 'project') {
            setProjects(p => p.map(x => x.id === selected.id ? { ...x, photos: [...x.photos, photo] } : x));
            setSelected({ ...selected, photos: [...selected.photos, photo] });
          } else {
            setGlazes(g => g.map(x => x.id === selected.id ? { ...x, tiles: [...x.tiles, photo] } : x));
            setSelected({ ...selected, tiles: [...selected.tiles, photo] });
          }
        };
        reader.onerror = () => {
          alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    }
  };

  const deletePhoto = async (pid, type) => {
    try {
      if (type === 'project') {
        const photo = selected.photos.find(p => p.id === pid);
        if (isSupabaseConfigured() && !offlineMode && photo?.storage_path) {
          await projectsApi.deletePhoto(pid, photo.storage_path);
        }
        setProjects(p => p.map(x => x.id === selected.id ? { ...x, photos: x.photos.filter(ph => ph.id !== pid) } : x));
        setSelected({ ...selected, photos: selected.photos.filter(ph => ph.id !== pid) });
      } else {
        const tile = selected.tiles.find(t => t.id === pid);
        if (isSupabaseConfigured() && !offlineMode && tile?.storage_path) {
          await glazesApi.deleteTile(pid, tile.storage_path);
        }
        setGlazes(g => g.map(x => x.id === selected.id ? { ...x, tiles: x.tiles.filter(t => t.id !== pid) } : x));
        setSelected({ ...selected, tiles: selected.tiles.filter(t => t.id !== pid) });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  // Show loading while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img src="/loading.gif" alt="Loading" className="w-32 h-32" />
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated (and not in offline mode)
  if (!isAuthenticated && !offlineMode) {
    return (
      <AuthScreen
        isOnline={isOnline}
        onAuth={{
          signIn,
          signUp,
          resetPassword,
          continueOffline: () => setOfflineMode(true),
        }}
      />
    );
  }

  

  // Render Settings Modal
  function renderSettingsModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
          {settingsView === 'main' ? (
            <>
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2"><X size={24} /></button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-6 space-y-2">
                  <button onClick={() => setSettingsView('profile')} className="w-full flex items-center justify-between p-4 bg-orange-100 rounded-2xl hover:from-orange-100 hover:to-amber-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {displayProfile.username[0]}
                      </div>
                      <span className="font-semibold text-text-primary">Your Profile</span>
                    </div>
                    <ChevronRight size={20} className="text-text-muted" />
                  </button>

                  <button onClick={() => setSettingsView('preferences')} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all">
                    <span className="font-medium text-text-primary">Preferences</span>
                    <ChevronRight size={20} className="text-text-muted" />
                  </button>

                  <button onClick={() => setSettingsView('feedback')} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all">
                    <span className="font-medium text-text-primary">Give Feedback</span>
                    <ChevronRight size={20} className="text-text-muted" />
                  </button>

                  <button onClick={() => setSettingsView('legal')} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all">
                    <span className="font-medium text-text-primary">Legal & Privacy</span>
                    <ChevronRight size={20} className="text-text-muted" />
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to sign out?')) {
                        await signOut();
                        setShowSettings(false);
                        setOfflineMode(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-stone-100 border border-stone-200 rounded-2xl hover:bg-stone-200 transition-all mt-4"
                  >
                    <LogOut size={20} className="text-text-secondary" />
                    <span className="font-medium text-text-secondary">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : settingsView === 'profile' ? (
            <>
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                  <h2 className="text-2xl font-bold text-text-primary">Your Profile</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white text-4xl font-bold mb-3 shadow-lg">
                    {displayProfile.username[0]}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Username</label>
                  <input type="text" value={displayProfile.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder="Username" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
                  <input type="email" value={displayProfile.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Bio</label>
                  <textarea value={user.bio} onChange={(e) => setUser({ ...user, bio: e.target.value })} placeholder="Bio" rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Location</label>
                  <input type="text" value={user.location} onChange={(e) => setUser({ ...user, location: e.target.value })} placeholder="Location" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent" />
                </div>
                <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 bg-accent text-white rounded-xl font-semibold shadow-md hover:bg-accent-hover">Save Changes</button>
              </div>
            </>
          ) : settingsView === 'preferences' ? (
            <>
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                  <h2 className="text-2xl font-bold text-text-primary">Preferences</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Units of Measurement</label>
                  <select value={user.units || 'metric'} onChange={(e) => setUser({ ...user, units: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent">
                    <option value="metric">Metric (kg, cm)</option>
                    <option value="imperial">Imperial (lbs, inches)</option>
                  </select>
                </div>
                <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 bg-accent text-white rounded-xl font-semibold shadow-md hover:bg-accent-hover">Save Preferences</button>
              </div>
            </>
          ) : settingsView === 'feedback' ? (
            <>
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                  <h2 className="text-2xl font-bold text-text-primary">Give Feedback</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-text-secondary">We'd love to hear your thoughts on Coastal Kiln!</p>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Your Feedback</label>
                  <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Tell us what you think..." rows={6} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent" />
                </div>
                <button onClick={() => {
                  if (form.feedback.trim()) {
                    alert('Thank you for your feedback!');
                    setForm({ ...form, feedback: '' });
                    setSettingsView('main');
                  }
                }} disabled={!form.feedback.trim()} className="w-full px-4 py-3 bg-accent text-white rounded-xl font-semibold shadow-md disabled:bg-stone-300 hover:bg-accent-hover">
                  Submit Feedback
                </button>
              </div>
            </>
          ) : settingsView === 'legal' ? (
            <>
              <div className="px-6 py-5 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                  <h2 className="text-2xl font-bold text-text-primary">Legal & Privacy</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <button onClick={() => window.open('/privacy-policy', '_blank')} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all">
                  <span className="font-medium text-text-primary">Privacy Policy</span>
                  <ChevronRight size={20} className="text-text-muted" />
                </button>
                <button onClick={() => window.open('/terms-of-service', '_blank')} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all">
                  <span className="font-medium text-text-primary">Terms of Service</span>
                  <ChevronRight size={20} className="text-text-muted" />
                </button>
                <div className="p-4 bg-stone-50 rounded-2xl">
                  <p className="text-sm text-text-secondary">Version 1.0.0</p>
                </div>
                <button onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Account deletion requested. You will receive a confirmation email.');
                  }
                }} className="w-full p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl font-semibold hover:bg-red-100 transition-all">
                  Delete Account
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-end items-center">
          <button onClick={() => { setShowSettings(true); setSettingsView('main'); }} className="p-2 text-text-secondary hover:bg-white/50 rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {currentView === 'sustainable' && selectedBatch ? (
          /* Batch Detail View */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-white/50 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">{selectedBatch.source}</h1>
                <p className="text-sm text-text-secondary">{selectedBatch.weight ? `${selectedBatch.weight} kg` : 'Weight not specified'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <select value={selectedBatch.status} onChange={(e) => {
                  const newStatus = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, status: newStatus } : b));
                  setSelectedBatch({ ...selectedBatch, status: newStatus });
                }} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent">
                  <option value="drying">Drying</option>
                  <option value="soaking">Soaking</option>
                  <option value="ready">Ready to Use</option>
                  <option value="wedging">Needs Wedging</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">Weight (kg)</label>
                <input type="number" step="0.1" value={selectedBatch.weight || ''} onChange={(e) => {
                  const newWeight = e.target.value ? parseFloat(e.target.value) : null;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, weight: newWeight } : b));
                  setSelectedBatch({ ...selectedBatch, weight: newWeight });
                }} placeholder="Optional" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">Source</label>
                <input type="text" value={selectedBatch.source} onChange={(e) => {
                  const newSource = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, source: newSource } : b));
                  setSelectedBatch({ ...selectedBatch, source: newSource });
                }} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Notes</label>
                <textarea value={selectedBatch.notes} onChange={(e) => {
                  const newNotes = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, notes: newNotes } : b));
                  setSelectedBatch({ ...selectedBatch, notes: newNotes });
                }} placeholder="Clay type, mixing notes..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-text-primary mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Started</span>
                  <span className="font-medium text-text-primary">{selectedBatch.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedBatch.status === 'ready' ? 'bg-green-100 text-green-800' : selectedBatch.status === 'drying' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedBatch.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => {
                if (confirm('Delete this reclaim batch?')) {
                  setReclaimBatches(prev => prev.filter(b => b.id !== selectedBatch.id));
                  setSelectedBatch(null);
                }
              }} className="w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </button>
              <button onClick={() => setSelectedBatch(null)} className="flex-1 px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover font-medium">
                Save
              </button>
            </div>
          </div>
        ) : currentView === 'sustainable' ? (
          /* Sustainable Studio View */
          <div className="space-y-6">
            <div className="px-2">
              <h1 className="text-4xl font-bold text-text-primary mb-6">Sustainable Studio</h1>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSustainableTab('reclaim')} className={`p-6 rounded-2xl text-left transition-all ${sustainableTab === 'reclaim' ? 'bg-nav-reclaim shadow-lg' : 'bg-white shadow-sm'}`}>
                  <h3 className={`font-semibold text-lg ${sustainableTab === 'reclaim' ? 'text-white' : 'text-text-primary'}`}>Clay Reclaim</h3>
                </button>

                <button onClick={() => setSustainableTab('tips')} className={`p-6 rounded-2xl text-left transition-all ${sustainableTab === 'tips' ? 'bg-nav-tips shadow-lg' : 'bg-white shadow-sm'}`}>
                  <h3 className={`font-semibold text-lg ${sustainableTab === 'tips' ? 'text-white' : 'text-text-primary'}`}>Studio Tips</h3>
                </button>
              </div>
            </div>

            {sustainableTab === 'reclaim' ? (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Total Reclaimed</h3>
                  <p className="text-4xl font-bold text-text-primary">
                    {reclaimBatches.filter(b => b.weight).reduce((sum, b) => sum + b.weight, 0).toFixed(1)} kg
                  </p>
                  <p className="text-sm text-text-secondary mt-1">{reclaimBatches.length} batches in progress</p>
                </div>

                <div className="space-y-3">
                  {reclaimBatches.map(batch => (
                    <button key={batch.id} onClick={() => setSelectedBatch(batch)} className="w-full bg-white rounded-2xl p-4 hover:shadow-md transition-shadow text-left shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-text-primary">{batch.source}</h3>
                          {batch.weight && <p className="text-sm text-text-secondary">{batch.weight} kg</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${batch.status === 'ready' ? 'bg-green-100 text-green-800' : batch.status === 'drying' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{batch.notes}</p>
                      <p className="text-xs text-text-muted">Started: {batch.date}</p>
                    </button>
                  ))}
                </div>

                {reclaimBatches.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <Leaf size={48} className="mx-auto text-text-muted mb-3" />
                    <h3 className="text-lg font-medium text-text-primary mb-1">No reclaim batches yet</h3>
                    <p className="text-text-secondary">Start tracking your clay reclaim</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* View toggle buttons */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setTipsViewMode('grouped')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tipsViewMode === 'grouped' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-cream'}`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setTipsViewMode('flat')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tipsViewMode === 'flat' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-cream'}`}
                  >
                    All
                  </button>
                </div>

                {tipsViewMode === 'flat' ? (
                  /* Flat view - all tips sorted by date/id */
                  <div className="space-y-3">
                    {[...studioTips].sort((a, b) => (b.id || '').localeCompare(a.id || '')).map(tip => {
                      const categoryLabels = { clay_reclaim: 'Clay Reclaim', diy_tools: 'DIY Tools', plaster_bats: 'Plaster Bats', other: 'Other' };
                      return (
                        <div key={tip.id} className="bg-white rounded-2xl p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-text-primary">{tip.title}</h4>
                            <span className="px-2 py-1 bg-nav-tips/20 text-nav-tips text-xs rounded-full font-medium">{categoryLabels[tip.category] || tip.category}</span>
                          </div>
                          <p className="text-sm text-text-secondary mb-3">{tip.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {tip.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-nav-tips/20 text-nav-tips text-xs rounded-full font-medium">{tag}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {studioTips.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                        <BookOpen size={48} className="mx-auto text-text-muted mb-3" />
                        <h3 className="text-lg font-medium text-text-primary mb-1">No tips yet</h3>
                        <p className="text-text-secondary">Add your first studio tip!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Grouped view - collapsible categories */
                  <>
                    {['clay_reclaim', 'diy_tools', 'plaster_bats', 'other'].map(category => {
                      const categoryTips = studioTips.filter(tip => tip.category === category);
                      const categoryLabels = { clay_reclaim: 'Clay Reclaim', diy_tools: 'DIY Tools', plaster_bats: 'Plaster Bats', other: 'Other' };

                      return (
                        <div key={category} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                          <button onClick={() => setExpandedTips(p => ({ ...p, [category]: !p[category] }))} className="w-full flex items-center justify-between p-4 hover:bg-nav-tips/20 transition-colors">
                            <h3 className="font-semibold text-text-primary">{categoryLabels[category]}</h3>
                            {expandedTips[category] ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
                          </button>

                          {expandedTips[category] && (
                            <div className="p-4 pt-0 space-y-3">
                              {categoryTips.map(tip => (
                                <div key={tip.id} className="bg-white border border-stone-200 rounded-xl p-4">
                                  <h4 className="font-medium text-text-primary mb-2">{tip.title}</h4>
                                  <p className="text-sm text-text-secondary mb-3">{tip.content}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {tip.tags.map((tag, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-nav-tips/20 text-nav-tips text-xs rounded-full font-medium">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {categoryTips.length === 0 && <p className="text-sm text-text-muted text-center py-4">No tips yet. Add your own!</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        ) : currentView === 'guilds' && selectedGuild ? (
          /* Guild Detail View */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedGuild(null)} className="p-2 hover:bg-white/50 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">{selectedGuild.name}</h1>
                <p className="text-sm text-text-secondary">{selectedGuild.location} • {selectedGuild.members} members</p>
              </div>
              {selectedGuild.isAdmin && <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Admin</span>}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-2">About</h3>
              <p className="text-text-secondary mb-4">{selectedGuild.description}</p>

              {selectedGuild.isAdmin && (
                <div className="bg-cream rounded-xl p-4">
                  <p className="text-sm font-medium text-text-primary mb-1">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-white border border-stone-200 rounded text-lg font-mono font-bold text-text-primary flex-1 text-center shadow-sm">
                      {selectedGuild.inviteCode}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(selectedGuild.inviteCode); alert('Copied!'); }} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">Share this code to invite members</p>
                </div>
              )}
            </div>

            {selectedGuild.event && (
              <div className="bg-nav-guilds/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="text-nav-guilds mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">Upcoming Event</h3>
                    <p className="text-text-secondary">{selectedGuild.event}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedGuild.memberList && selectedGuild.memberList.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-text-primary mb-3">Members ({selectedGuild.members})</h3>
                <div className="space-y-2">
                  {selectedGuild.memberList.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {member[0]}
                      </div>
                      <span className="text-text-primary">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Message Board
              </h3>
              {selectedGuild.posts && selectedGuild.posts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {selectedGuild.posts.map(post => (
                    <div key={post.id} className="bg-cream rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-text-primary">{post.author}</span>
                        <span className="text-xs text-text-muted">{post.time}</span>
                      </div>
                      <p className="text-text-secondary text-sm">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted mb-4">
                  <p>No messages yet</p>
                </div>
              )}
              <button onClick={() => { setModalType('post'); setShowModal(true); }} className="w-full px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover">
                New Post
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Shared Resources
              </h3>
              {selectedGuild.resources && selectedGuild.resources.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedGuild.resources.map(resource => (
                    <a
                      key={resource.id}
                      href={resource.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 bg-cream rounded-xl transition-colors ${resource.url ? 'hover:bg-stone-200 cursor-pointer' : 'cursor-default'}`}
                      onClick={(e) => {
                        if (!resource.url) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm truncate">{resource.title}</p>
                        <p className="text-xs text-text-muted">Added by {resource.addedBy || resource.added_by_profile?.username || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs rounded ${
                          resource.type === 'PDF' ? 'bg-red-100 text-red-700' :
                          resource.type === 'Video' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{resource.type}</span>
                        {resource.url && (
                          <ChevronRight size={16} className="text-text-muted" />
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted mb-4">
                  <p>No resources yet</p>
                </div>
              )}
              <button onClick={() => { setModalType('resource'); setShowModal(true); }} className="w-full px-4 py-2 bg-stone-600 text-white rounded-xl hover:bg-stone-700">
                Add Resource
              </button>
            </div>
          </div>
        ) : currentView === 'guilds' ? (
          /* Guilds List View */
          <div className="space-y-6">
            <div className="px-2">
              <h1 className="text-4xl font-bold text-text-primary mb-6">My Guilds</h1>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGuildTab('my-guilds')} className={`p-6 rounded-2xl text-left transition-all ${guildTab === 'my-guilds' ? 'bg-nav-guilds shadow-md' : 'bg-white shadow-sm'}`}>
                  <h3 className={`font-semibold text-lg ${guildTab === 'my-guilds' ? 'text-white' : 'text-text-primary'}`}>My Guilds</h3>
                </button>

                <button onClick={() => setGuildTab('discover')} className={`p-6 rounded-2xl text-left transition-all ${guildTab === 'discover' ? 'bg-nav-discover shadow-md' : 'bg-white shadow-sm'}`}>
                  <h3 className={`font-semibold text-lg ${guildTab === 'discover' ? 'text-white' : 'text-text-primary'}`}>Discover</h3>
                </button>
              </div>
            </div>

            {guildTab === 'my-guilds' ? (
              <div className="space-y-4">
                {guilds.filter(g => g.isMember).map(guild => (
                  <button key={guild.id} onClick={() => setSelectedGuild(guild)} className="w-full bg-white rounded-2xl p-6 hover:shadow-md transition-shadow text-left shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-1">{guild.name}</h3>
                        <p className="text-sm text-text-secondary">{guild.location}</p>
                      </div>
                      <span className="px-3 py-1 bg-nav-guilds/20 text-text-primary text-sm font-medium rounded-full">Member</span>
                    </div>
                    <p className="text-text-secondary mb-3">{guild.description}</p>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{guild.members} members</span>
                      </div>
                      {guild.event && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>Upcoming event</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {guilds.filter(g => g.isMember).length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <Users size={48} className="mx-auto text-text-muted mb-3" />
                    <h3 className="text-lg font-medium text-text-primary mb-1">No guilds yet</h3>
                    <p className="text-text-secondary">Create or join a local pottery guild</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-text-primary mb-3">Have an Invite Code?</h3>
                  <button onClick={() => setShowModal(true)} className="w-full px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover font-medium">
                    Join by Invite Code
                  </button>
                </div>

                <div className="space-y-3">
                  {guilds.filter(g => !g.isMember).map(guild => (
                    <div key={guild.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-text-primary mb-1">{guild.name}</h3>
                          <p className="text-sm text-text-secondary">{guild.location}</p>
                        </div>
                      </div>
                      <p className="text-text-secondary mb-3">{guild.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-text-muted">
                          <Users size={16} />
                          <span>{guild.members} members</span>
                        </div>
                        <button onClick={() => {
                          setGuilds(prev => prev.map(g => g.id === guild.id ? { ...g, isMember: true, members: g.members + 1, memberList: [...(g.memberList || []), displayProfile.username] } : g));
                        }} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover text-sm font-medium">
                          Join Guild
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'studio' && !selected ? (
          <div className="space-y-6">
            {/* Hero */}
            <div className="px-2">
              <p className="text-text-secondary mb-1">Hello, {displayProfile.username}</p>
              <h1 className="text-4xl font-bold text-text-primary mb-6">What are we making today?</h1>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTab('pieces')} className={`p-6 rounded-2xl text-left transition-all ${tab === 'pieces' ? 'bg-nav-pieces shadow-lg' : 'bg-white shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${tab === 'pieces' ? 'bg-white' : 'bg-nav-pieces'}`}>
                    <Flame size={22} className={tab === 'pieces' ? 'text-nav-pieces' : 'text-white'} />
                  </div>
                  <h3 className={`font-semibold text-lg ${tab === 'pieces' ? 'text-text-primary' : 'text-text-primary'}`}>Pieces</h3>
                </button>

                <button onClick={() => setTab('glazes')} className={`p-6 rounded-2xl text-left transition-all ${tab === 'glazes' ? 'bg-nav-glaze shadow-lg' : 'bg-white shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${tab === 'glazes' ? 'bg-white' : 'bg-nav-glaze'}`}>
                    <Palette size={22} className={tab === 'glazes' ? 'text-nav-glaze' : 'text-white'} />
                  </div>
                  <h3 className={`font-semibold text-lg ${tab === 'glazes' ? 'text-white' : 'text-text-primary'}`}>Glaze Garden</h3>
                </button>
              </div>
            </div>

            {/* Content */}
            {tab === 'pieces' ? (
              <div className="grid grid-cols-2 gap-3">
                {projects.map(p => {
                  const pieceGlazes = (p.glazeIds || []).map(id => glazes.find(g => g.id === id)).filter(Boolean);
                  const allGlazeNames = [...pieceGlazes.map(g => g.name), p.customGlaze].filter(Boolean);
                  return (
                    <button key={p.id} onClick={() => setSelected(p)} className="bg-white rounded-2xl p-3 hover:shadow-md text-left shadow-sm">
                      <div className="aspect-square bg-cream rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                        {p.photos.length > 0 ? <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover" /> : <Flame size={32} className="text-text-muted" />}
                      </div>
                      <h3 className="font-semibold text-text-primary text-sm truncate">{p.title}</h3>
                      <p className="text-xs text-text-secondary">{p.clay}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${stageColors[p.stage]}`}>
                        {formatStage(p.stage)}
                      </span>
                      {allGlazeNames.length > 0 && (
                        <p className="text-xs text-nav-glaze mt-1 truncate">{allGlazeNames.join(', ')}</p>
                      )}
                    </button>
                  );
                })}
                {projects.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm">
                    <Flame size={48} className="mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary">No pieces yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {glazes.map(g => (
                  <button key={g.id} onClick={() => setSelected(g)} className="bg-white rounded-2xl p-4 hover:shadow-md text-left shadow-sm">
                    <div className="aspect-square bg-cream rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {g.tiles.length > 0 ? <img src={g.tiles[0].url} alt={g.name} className="w-full h-full object-cover" /> : <Palette size={32} className="text-text-muted" />}
                    </div>
                    <h3 className="font-semibold text-text-primary">{g.name}</h3>
                    <p className="text-sm text-text-secondary">{g.type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : currentView === 'studio' && tab === 'pieces' && selected ? (
          /* Project Detail */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/50 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">{selected.title}</h1>
                <p className="text-sm text-text-secondary">{selected.clay}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Current Stage</p>
                  <span className={`inline-block px-4 py-2 rounded-full font-medium ${stageColors[selected.stage]}`}>
                    {formatStage(selected.stage)}
                  </span>
                </div>
                {nextStage(selected.stage) && (
                  <button onClick={async () => {
                    const ns = nextStage(selected.stage);
                    try {
                      if (isSupabaseConfigured() && !offlineMode) {
                        await projectsApi.update(selected.id, { stage: ns });
                      }
                      setProjects(p => p.map(x => x.id === selected.id ? { ...x, stage: ns } : x));
                      setSelected({ ...selected, stage: ns });
                    } catch (error) {
                      console.error('Error updating stage:', error);
                      alert('Failed to update stage');
                    }
                  }} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover">
                    <CheckCircle size={20} />
                    <span>Move to {formatStage(nextStage(selected.stage))}</span>
                  </button>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-text-primary mb-3">Photos</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {selected.photos.map(ph => (
                    <div key={ph.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={ph.url} alt="Piece" className="w-full h-full object-cover" />
                      <button onClick={() => deletePhoto(ph.id, 'project')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-300 rounded-xl text-text-secondary hover:border-accent cursor-pointer">
                  <Camera size={20} />
                  <span className="font-medium">Add Photo</span>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'project')} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Notes</label>
                <textarea value={selected.notes[selected.stage] || ''} onChange={(e) => {
                  const n = e.target.value;
                  setProjects(p => p.map(x => x.id === selected.id ? { ...x, notes: { ...x.notes, [selected.stage]: n } } : x));
                  setSelected({ ...selected, notes: { ...selected.notes, [selected.stage]: n } });
                }} onBlur={async (e) => {
                  // Save notes to Supabase on blur
                  if (isSupabaseConfigured() && !offlineMode) {
                    try {
                      await projectsApi.upsertNote(selected.id, selected.stage, e.target.value);
                    } catch (error) {
                      console.error('Error saving note:', error);
                    }
                  }
                }} placeholder="Add notes..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          </div>
        ) : currentView === 'studio' && tab === 'glazes' && selected ? (
          /* Glaze Detail */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/50 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">{selected.name}</h1>
                <p className="text-sm text-text-secondary">{selected.type}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-text-primary mb-3">Recipe</h3>
              <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono bg-cream p-4 rounded-xl">{selected.recipe || 'No recipe'}</pre>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-text-primary mb-3">Test Tiles</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {selected.tiles.map(t => (
                  <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={t.url} alt="Test" className="w-full h-full object-cover" />
                    <button onClick={() => deletePhoto(t.id, 'glaze')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-300 rounded-xl text-text-secondary hover:border-accent cursor-pointer">
                <Camera size={20} />
                <span className="font-medium">Add Test Tile</span>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'glaze')} className="hidden" />
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-text-primary mb-3">Notes</h3>
              <textarea value={selected.notes || ''} onChange={(e) => {
                const n = e.target.value;
                setGlazes(g => g.map(x => x.id === selected.id ? { ...x, notes: n } : x));
                setSelected({ ...selected, notes: n });
              }} onBlur={async (e) => {
                // Save notes to Supabase on blur
                if (isSupabaseConfigured() && !offlineMode) {
                  try {
                    await glazesApi.update(selected.id, { notes: e.target.value });
                  } catch (error) {
                    console.error('Error saving glaze notes:', error);
                  }
                }
              }} placeholder="Application tips..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent" />
            </div>
          </div>
        ) : null}
      </main>

      {/* FAB */}
      {!selected && !selectedBatch && !selectedGuild && (currentView === 'studio' || currentView === 'sustainable' || currentView === 'guilds') && (
        <button onClick={() => setShowModal(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:bg-accent-hover z-30">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40">
        <div className="max-w-7xl mx-auto px-2 flex justify-around h-16">
          <button onClick={() => { setCurrentView('studio'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'studio' ? 'text-accent' : 'text-text-muted'}`}>
            <Home size={24} strokeWidth={currentView === 'studio' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Studio</span>
          </button>
          <button onClick={() => { setCurrentView('sustainable'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'sustainable' ? 'text-accent' : 'text-text-muted'}`}>
            <Leaf size={24} strokeWidth={currentView === 'sustainable' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Studio Cycle</span>
          </button>
          <button onClick={() => { setCurrentView('guilds'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'guilds' ? 'text-accent' : 'text-text-muted'}`}>
            <Users size={24} strokeWidth={currentView === 'guilds' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Guilds</span>
          </button>
        </div>
      </nav>

      {/* New Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {selectedGuild && modalType === 'post' ? 'New Post' :
                 selectedGuild && modalType === 'resource' ? 'Add Resource' :
                 currentView === 'guilds' && guildTab === 'discover' && form.inviteCode !== undefined ? 'Join by Invite Code' :
                 currentView === 'guilds' ? 'Create Guild' :
                 currentView === 'sustainable' && sustainableTab === 'reclaim' ? 'New Reclaim Batch' :
                 currentView === 'sustainable' && sustainableTab === 'tips' ? 'New Studio Tip' :
                 tab === 'pieces' ? 'New Piece' : 'New Glaze'}
              </h2>
              <button onClick={() => { setShowModal(false); setModalType(null); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' }); }}>
                <X size={24} />
              </button>
            </div>

            {currentView === 'guilds' && guildTab === 'discover' && !selectedGuild ? (
              <div className="space-y-4">
                <input type="text" value={form.inviteCode} onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })} placeholder="Enter invite code" maxLength={8} className="w-full px-3 py-2 border border-stone-200 rounded-xl uppercase text-center text-lg font-mono font-bold" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, inviteCode: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    const guild = guilds.find(g => g.inviteCode === form.inviteCode);
                    if (guild && !guild.isMember) {
                      setGuilds(prev => prev.map(g => g.id === guild.id ? { ...g, isMember: true, members: g.members + 1, memberList: [...(g.memberList || []), displayProfile.username] } : g));
                      setForm({ ...form, inviteCode: '' });
                      setShowModal(false);
                      setGuildTab('my-guilds');
                    } else alert(guild ? 'Already a member' : 'Invalid code');
                  }} disabled={!form.inviteCode} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Join</button>
                </div>
              </div>
            ) : selectedGuild && modalType === 'post' ? (
              <div className="space-y-4">
                <textarea value={form.guildPost} onChange={(e) => setForm({ ...form, guildPost: e.target.value })} placeholder="Share something..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setModalType(null); setForm({ ...form, guildPost: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    if (!form.guildPost) return;
                    const newPost = { id: Date.now().toString(), author: displayProfile.username, content: form.guildPost, time: 'Just now' };
                    setGuilds(prev => prev.map(g => g.id === selectedGuild.id ? { ...g, posts: [newPost, ...(g.posts || [])] } : g));
                    setSelectedGuild({ ...selectedGuild, posts: [newPost, ...(selectedGuild.posts || [])] });
                    setForm({ ...form, guildPost: '' });
                    setModalType(null);
                    setShowModal(false);
                  }} disabled={!form.guildPost} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Post
                  </button>
                </div>
              </div>
            ) : selectedGuild && modalType === 'resource' ? (
              <div className="space-y-4">
                <input type="text" value={form.resourceTitle} onChange={(e) => setForm({ ...form, resourceTitle: e.target.value })} placeholder="Resource title" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value, resourceFile: null, resourceUrl: '' })} className="w-full px-3 py-2 border border-stone-200 rounded-xl">
                  <option value="PDF">PDF</option>
                  <option value="Link">Link</option>
                  <option value="Video">Video</option>
                </select>

                {/* File upload for PDF type */}
                {form.resourceType === 'PDF' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Upload File</label>
                    {form.resourceFile ? (
                      <div className="flex items-center justify-between p-3 bg-cream rounded-xl">
                        <span className="text-sm text-text-primary truncate">{form.resourceFile.name}</span>
                        <button onClick={() => setForm({ ...form, resourceFile: null })} className="p-1 text-text-muted hover:text-red-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-300 rounded-xl text-text-secondary hover:border-accent cursor-pointer">
                        <BookOpen size={20} />
                        <span className="font-medium">Select PDF file</span>
                        <input type="file" accept=".pdf,application/pdf" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setForm({ ...form, resourceFile: file });
                        }} className="hidden" />
                      </label>
                    )}
                  </div>
                )}

                {/* URL input for Link or Video type */}
                {(form.resourceType === 'Link' || form.resourceType === 'Video') && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">URL</label>
                    <input
                      type="url"
                      value={form.resourceUrl}
                      onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })}
                      placeholder={form.resourceType === 'Video' ? 'https://youtube.com/...' : 'https://...'}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setModalType(null); setForm({ ...form, resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={async () => {
                    if (!form.resourceTitle) return;

                    // Validate based on type
                    if (form.resourceType === 'PDF' && !form.resourceFile) {
                      alert('Please select a PDF file');
                      return;
                    }
                    if ((form.resourceType === 'Link' || form.resourceType === 'Video') && !form.resourceUrl) {
                      alert('Please enter a URL');
                      return;
                    }

                    try {
                      let newResource;

                      if (form.resourceType === 'PDF' && form.resourceFile) {
                        // Upload file if PDF type
                        // Note: This would use guilds API in online mode
                        // For localStorage mode, we'll store a placeholder
                        newResource = {
                          id: Date.now().toString(),
                          title: form.resourceTitle,
                          type: form.resourceType,
                          addedBy: displayProfile.username,
                          url: URL.createObjectURL(form.resourceFile), // Temporary blob URL for preview
                          fileName: form.resourceFile.name
                        };
                      } else {
                        // Link or Video
                        newResource = {
                          id: Date.now().toString(),
                          title: form.resourceTitle,
                          type: form.resourceType,
                          addedBy: displayProfile.username,
                          url: form.resourceUrl
                        };
                      }

                      setGuilds(prev => prev.map(g => g.id === selectedGuild.id ? { ...g, resources: [...(g.resources || []), newResource] } : g));
                      setSelectedGuild({ ...selectedGuild, resources: [...(selectedGuild.resources || []), newResource] });
                      setForm({ ...form, resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null });
                      setModalType(null);
                      setShowModal(false);
                    } catch (error) {
                      console.error('Error adding resource:', error);
                      alert('Failed to add resource');
                    }
                  }} disabled={!form.resourceTitle || (form.resourceType === 'PDF' && !form.resourceFile) || ((form.resourceType === 'Link' || form.resourceType === 'Video') && !form.resourceUrl)} className="flex-1 px-4 py-2 bg-stone-600 text-white rounded-xl disabled:bg-stone-300">Add</button>
                </div>
              </div>
            ) : currentView === 'guilds' && !selectedGuild ? (
              <div className="space-y-4">
                <input type="text" value={form.guildName} onChange={(e) => setForm({ ...form, guildName: e.target.value })} placeholder="Guild name" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <input type="text" value={form.guildLocation} onChange={(e) => setForm({ ...form, guildLocation: e.target.value })} placeholder="Location" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <textarea value={form.guildDesc} onChange={(e) => setForm({ ...form, guildDesc: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, guildName: '', guildLocation: '', guildDesc: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    if (!form.guildName || !form.guildLocation) return;
                    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    setGuilds([{ id: Date.now().toString(), name: form.guildName, members: 1, memberList: [displayProfile.username], location: form.guildLocation, description: form.guildDesc, isMember: true, isAdmin: true, event: null, posts: [], resources: [], inviteCode }, ...guilds]);
                    setForm({ ...form, guildName: '', guildLocation: '', guildDesc: '' });
                    setShowModal(false);
                  }} disabled={!form.guildName || !form.guildLocation} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Create</button>
                </div>
              </div>
            ) : currentView === 'sustainable' && sustainableTab === 'reclaim' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g., 5.5 (optional)" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Source *</label>
                  <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g., Trimming scraps" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Notes (optional)</label>
                  <textarea value={form.batchNotes} onChange={(e) => setForm({ ...form, batchNotes: e.target.value })} placeholder="Clay type, mixing notes..." rows={3} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    if (!form.source) return;
                    setReclaimBatches([{ id: Date.now().toString(), weight: form.weight ? parseFloat(form.weight) : null, source: form.source, date: new Date().toISOString().split('T')[0], status: 'drying', notes: form.batchNotes }, ...reclaimBatches]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' });
                    setShowModal(false);
                  }} disabled={!form.source} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Create</button>
                </div>
              </div>
            ) : currentView === 'sustainable' && sustainableTab === 'tips' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category *</label>
                  <select value={form.tipCategory} onChange={(e) => setForm({ ...form, tipCategory: e.target.value })} className="w-full px-3 py-2 border border-stone-200 rounded-xl">
                    <option value="clay_reclaim">Clay Reclaim</option>
                    <option value="diy_tools">DIY Tools</option>
                    <option value="plaster_bats">Plaster Bats</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Tip Title *</label>
                  <input type="text" value={form.tipTitle} onChange={(e) => setForm({ ...form, tipTitle: e.target.value })} placeholder="e.g., Quick Dry Method" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Content *</label>
                  <textarea value={form.tipContent} onChange={(e) => setForm({ ...form, tipContent: e.target.value })} placeholder="Describe your tip..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Tags (comma separated)</label>
                  <input type="text" value={form.tipTags.join(', ')} onChange={(e) => setForm({ ...form, tipTags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })} placeholder="e.g., Water Conservation, Energy" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    if (!form.tipTitle || !form.tipContent) return;
                    setStudioTips([...studioTips, { id: Date.now().toString(), category: form.tipCategory, title: form.tipTitle, content: form.tipContent, tags: form.tipTags }]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' });
                    setShowModal(false);
                  }} disabled={!form.tipTitle || !form.tipContent} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Add Tip</button>
                </div>
              </div>
            ) : tab === 'pieces' ? (
              <div className="space-y-4">
                {form.photo ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-2">
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, photo: null, photoFile: null })} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-accent">
                    <Camera size={48} className="text-text-muted mb-2" />
                    <span className="text-sm text-text-secondary">Add photo (optional)</span>
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setForm({ ...form, photo: reader.result, photoFile: file });
                      reader.readAsDataURL(file);
                    }} className="hidden" />
                  </label>
                )}
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Piece name" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <input type="text" value={form.clay} onChange={(e) => setForm({ ...form, clay: e.target.value })} placeholder="Clay body" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />

                {/* Stage selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Current Stage</label>
                  <select value={form.pieceStage} onChange={(e) => setForm({ ...form, pieceStage: e.target.value })} className="w-full px-3 py-2 border border-stone-200 rounded-xl">
                    <option value="wedging">Wedging</option>
                    <option value="throwing">Throwing</option>
                    <option value="trimming">Trimming</option>
                    <option value="drying">Drying</option>
                    <option value="bisque">Bisque</option>
                    <option value="glazing">Glazing</option>
                    <option value="firing">Firing</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                {/* Glaze selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Glazes (optional)</label>
                  {glazes.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-stone-200 rounded-xl p-2 mb-2">
                      {glazes.map(glaze => (
                        <label key={glaze.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.pieceGlazes.includes(glaze.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, pieceGlazes: [...form.pieceGlazes, glaze.id] });
                              } else {
                                setForm({ ...form, pieceGlazes: form.pieceGlazes.filter(id => id !== glaze.id) });
                              }
                            }}
                            className="w-4 h-4 text-accent rounded"
                          />
                          <span className="text-sm text-text-primary">{glaze.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={form.customGlaze}
                    onChange={(e) => setForm({ ...form, customGlaze: e.target.value })}
                    placeholder="Or type a glaze name..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={async () => {
                    console.log('🏺 Project create button clicked!');
                    console.log('🏺 Form state:', { title: form.title, clay: form.clay });
                    console.log('🏺 Auth state:', { user: user, userId: user?.id, isAuthenticated });

                    if (!form.title || !form.clay) {
                      console.log('🏺 Form validation failed - missing title or clay');
                      alert('Please fill in both piece name and clay body');
                      return;
                    }

                    if (isSupabaseConfigured() && !offlineMode && !user?.id) {
                      console.error('🏺 No user ID available!');
                      alert('You must be logged in to create a piece. User ID is missing.');
                      return;
                    }

                    try {
                      console.log('🏺 Creating project...', { isSupabaseConfigured: isSupabaseConfigured(), offlineMode, hasPhoto: !!form.photoFile });
                      if (isSupabaseConfigured() && !offlineMode) {
                        // Check Supabase session
                        const { data: sessionData } = await import('./lib/supabase').then(m => m.supabase.auth.getSession());
                        console.log('🧪 Supabase session:', sessionData);
                        if (!sessionData?.session) {
                          console.error('🏺 No Supabase session!');
                          alert('Session expired. Please log out and log back in.');
                          return;
                        }
                        console.log('🏺 Using Supabase to create project, user.id:', user?.id);
                        const newProject = await projectsApi.create({ title: form.title, clay: form.clay, stage: form.pieceStage }, user?.id);
                        console.log('🏺 Project created:', newProject);

                        // Upload photo if one was selected
                        let photos = [];
                        if (form.photoFile) {
                          console.log('🏺 Uploading photo...');
                          try {
                            const photo = await projectsApi.addPhoto(newProject.id, form.photoFile, form.pieceStage, user?.id);
                            console.log('🏺 Photo uploaded:', photo);
                            photos = [{ id: photo.id, url: photo.url, storage_path: photo.storage_path }];
                          } catch (photoError) {
                            console.error('🏺 Photo upload failed:', photoError);
                            // Continue without photo - project was still created
                          }
                        }

                        setProjects([{
                          id: newProject.id,
                          title: newProject.title,
                          clay: newProject.clay_body,
                          stage: newProject.stage,
                          date: newProject.created_at?.split('T')[0],
                          photos: photos,
                          notes: {},
                          glazeIds: form.pieceGlazes,
                          customGlaze: form.customGlaze
                        }, ...projects]);
                      } else {
                        console.log('🏺 Using localStorage to create project');
                        setProjects([{ id: Date.now().toString(), title: form.title, clay: form.clay, stage: form.pieceStage, date: new Date().toISOString().split('T')[0], photos: form.photo ? [{ id: Date.now().toString(), url: form.photo }] : [], notes: {}, glazeIds: form.pieceGlazes, customGlaze: form.customGlaze }, ...projects]);
                      }
                      setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' });
                      setShowModal(false);
                      console.log('🏺 Project creation complete');
                    } catch (error) {
                      console.error('🔥 FULL Supabase error:', error);
                      alert('Failed to create project:\n' + JSON.stringify(error, null, 2));
                    }
                  }} disabled={!form.title || !form.clay} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Create</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Glaze name" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Firing type" className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <textarea value={form.recipe} onChange={(e) => setForm({ ...form, recipe: e.target.value })} placeholder="Recipe..." rows={4} className="w-full px-3 py-2 border border-stone-200 rounded-xl" />
                <div className="flex gap-3" onClick={(e) => {
                  console.log('🎨 Button container clicked. Button disabled?', !form.name || !form.type);
                  console.log('🎨 Current form values:', { name: form.name, type: form.type });
                }}>
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' }); }} className="flex-1 px-4 py-2 border border-stone-200 rounded-xl">Cancel</button>
                  <button onClick={async () => {
                    console.log('🎨 Glaze create button clicked!');
                    console.log('🎨 Form state:', { name: form.name, type: form.type, recipe: form.recipe });
                    console.log('🎨 Auth state:', { user: user, userId: user?.id, isAuthenticated });

                    if (!form.name || !form.type) {
                      console.log('🎨 Form validation failed - missing name or type');
                      alert('Please fill in both glaze name and firing type');
                      return;
                    }

                    if (isSupabaseConfigured() && !offlineMode && !user?.id) {
                      console.error('🎨 No user ID available!');
                      alert('You must be logged in to create a glaze. User ID is missing.');
                      return;
                    }

                    try {
                      console.log('🎨 Creating glaze...', { isSupabaseConfigured: isSupabaseConfigured(), offlineMode });
                      if (isSupabaseConfigured() && !offlineMode) {
                        console.log('🎨 Using Supabase to create glaze, user.id:', user?.id);
                        const newGlaze = await glazesApi.create({ name: form.name, type: form.type, recipe: form.recipe, notes: '' }, user?.id);
                        console.log('🎨 Glaze created:', newGlaze);
                        setGlazes([{
                          id: newGlaze.id,
                          name: newGlaze.name,
                          type: newGlaze.firing_type,
                          recipe: newGlaze.recipe || '',
                          notes: newGlaze.notes || '',
                          tiles: []
                        }, ...glazes]);
                      } else {
                        console.log('🎨 Using localStorage to create glaze');
                        setGlazes([{ id: Date.now().toString(), name: form.name, type: form.type, recipe: form.recipe, notes: '', tiles: [] }, ...glazes]);
                      }
                      setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, photoFile: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', resourceUrl: '', resourceFile: null, feedback: '', pieceStage: 'wedging', pieceGlazes: [], customGlaze: '' });
                      setShowModal(false);
                      console.log('🎨 Glaze creation complete');
                    } catch (error) {
                      console.error('🎨 Error creating glaze:', error);
                      alert('Failed to create glaze: ' + (error.message || 'Unknown error'));
                    }
                  }} disabled={!form.name || !form.type} className="flex-1 px-4 py-2 bg-accent text-white rounded-xl disabled:bg-stone-300">Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && renderSettingsModal()}
    </div>
  );
}

export default CoastalKilnApp;
