import React, { useState, useEffect } from 'react';
import { Plus, Home, Settings, Flame, Palette, ArrowLeft, Camera, CheckCircle, Trash2, X, Leaf, ChevronDown, ChevronUp, Users, MessageSquare, Calendar, BookOpen, Send, ChevronRight } from 'lucide-react';

// Add Inter font
const style = document.createElement('style');
style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif !important; }`;
if (!document.head.querySelector('style[data-font="inter"]')) {
  style.setAttribute('data-font', 'inter');
  document.head.appendChild(style);
}

// Storage helper functions
const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};

// Welcome Screen Component
function WelcomeScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 flex flex-col items-center justify-center z-50 transition-opacity duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center space-y-6">
        <img 
          src="/CoastalKilnLogo.png" 
          alt="Coastal Kiln" 
          className="w-48 h-48 animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        <h1 className="text-3xl font-bold text-slate-800">Coastal Kiln</h1>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

function CoastalKilnApp() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(() => storage.get('user', { username: 'Daniel', email: 'potter@coastalkiln.com', bio: 'Potter & ceramic artist', location: 'Wellington, NZ', units: 'metric' }));
  const [currentView, setCurrentView] = useState('studio');
  const [tab, setTab] = useState('pieces');
  const [sustainableTab, setSustainableTab] = useState('reclaim');
  const [guildTab, setGuildTab] = useState('my-guilds');
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState('main');
  const [selected, setSelected] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedGuild, setSelectedGuild] = useState(null);
  
  const [projects, setProjects] = useState(() => storage.get('projects', [
    { id: '1', title: 'Celadon Bowl', clay: 'Porcelain', stage: 'glazing', date: '2026-01-10', photos: [], notes: {} },
    { id: '2', title: 'Yunomi Set', clay: 'Stoneware', stage: 'bisque', date: '2026-01-15', photos: [], notes: {} }
  ]));
  
  const [glazes, setGlazes] = useState(() => storage.get('glazes', [
    { id: '1', name: 'Leach Blue', type: 'Cone 6', recipe: 'Nepheline Syenite 40%\nSilica 25%', notes: '', tiles: [] }
  ]));
  
  const [reclaimBatches, setReclaimBatches] = useState(() => storage.get('reclaimBatches', [
    { id: '1', weight: 5.5, source: 'Trimming scraps', date: '2026-01-10', status: 'drying', notes: 'Mixed porcelain and stoneware' }
  ]));
  
  const [studioTips, setStudioTips] = useState(() => storage.get('studioTips', [
    { id: '1', category: 'clay_reclaim', title: 'Clay Reclaim Process', content: 'Collect scraps in a bucket, separate by clay type when possible. Add water to fully submerge, let slake for 24-48 hours. Pour onto plaster bats or canvas to dry to workable consistency. Wedge thoroughly before use.', tags: ['Clay Reuse', 'Water Conservation'] },
    { id: '2', category: 'diy_tools', title: 'Make Your Own Ribbon Tools', content: 'Cut old hacksaw blades into 6-inch strips. Bend into loops and secure with wire or tape. File any sharp edges. Free tools that work as well as store-bought!', tags: ['Cost Saving', 'Recycling'] },
    { id: '3', category: 'plaster_bats', title: 'Casting Plaster Bats', content: 'Use pottery #1 plaster, mix ratio 100 parts plaster to 70 parts water by weight. Pour into a level mold (bucket lids work great). Let set 45 minutes before removing. Cure for 2-3 days before first use.', tags: ['Cost Saving', 'Studio Setup'] }
  ]));
  
  const [guilds, setGuilds] = useState(() => storage.get('guilds', [
    { id: '1', name: 'Wellington Potters Guild', members: 24, memberList: ['Daniel', 'Sarah', 'Mike'], location: 'Wellington, NZ', description: 'Weekly throws and quarterly exhibitions', isMember: true, isAdmin: true, event: 'Wood Firing Workshop - Jan 25', posts: [{ id: '1', author: 'Sarah', content: 'Anyone interested in a group wood firing next month?', time: '2 hours ago' }], resources: [{ id: '1', title: 'Studio Safety Guidelines', type: 'PDF', addedBy: 'Admin' }], inviteCode: 'WPG2026' },
    { id: '2', name: 'Auckland Clay Collective', members: 18, memberList: [], location: 'Auckland, NZ', description: 'Community studio for all skill levels', isMember: false, isAdmin: false, event: null, posts: [], resources: [], inviteCode: 'ACC2026' }
  ]));

  // Save to localStorage whenever state changes
  useEffect(() => { storage.set('user', user); }, [user]);
  useEffect(() => { storage.set('projects', projects); }, [projects]);
  useEffect(() => { storage.set('glazes', glazes); }, [glazes]);
  useEffect(() => { storage.set('reclaimBatches', reclaimBatches); }, [reclaimBatches]);
  useEffect(() => { storage.set('studioTips', studioTips); }, [studioTips]);
  useEffect(() => { storage.set('guilds', guilds); }, [guilds]);
  
  const [expandedTips, setExpandedTips] = useState({ clay_reclaim: true, diy_tools: false, plaster_bats: false });
  
  const [form, setForm] = useState({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', feedback: '' });
  
  const stages = ['wedging', 'throwing', 'trimming', 'drying', 'bisque', 'glazing', 'firing', 'complete'];
  
  const stageColors = {
    wedging: 'bg-amber-100 text-amber-800', throwing: 'bg-orange-100 text-orange-800',
    trimming: 'bg-yellow-100 text-yellow-800', drying: 'bg-lime-100 text-lime-800',
    bisque: 'bg-amber-100 text-cyan-800', glazing: 'bg-pink-100 text-pink-800',
    firing: 'bg-purple-100 text-purple-800', complete: 'bg-green-100 text-green-800'
  };
  
  const formatStage = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  
  const nextStage = (current) => {
    const idx = stages.indexOf(current);
    return idx < stages.length - 1 ? stages[idx + 1] : null;
  };
  
  const handlePhotoUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Please select an image under 5MB');
      return;
    }
    
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
  };
  
  const deletePhoto = (pid, type) => {
    if (type === 'project') {
      setProjects(p => p.map(x => x.id === selected.id ? { ...x, photos: x.photos.filter(ph => ph.id !== pid) } : x));
      setSelected({ ...selected, photos: selected.photos.filter(ph => ph.id !== pid) });
    } else {
      setGlazes(g => g.map(x => x.id === selected.id ? { ...x, tiles: x.tiles.filter(t => t.id !== pid) } : x));
      setSelected({ ...selected, tiles: selected.tiles.filter(t => t.id !== pid) });
    }
  };

  // Show welcome screen
  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-br from-slate-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-end items-center">
          <button onClick={() => { setShowSettings(true); setSettingsView('main'); }} className="p-2 text-slate-600 hover:bg-white/50 rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {currentView === 'sustainable' && selectedBatch ? (
          /* Batch Detail View */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{selectedBatch.source}</h1>
                <p className="text-sm text-slate-600">{selectedBatch.weight ? `${selectedBatch.weight} kg` : 'Weight not specified'}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select value={selectedBatch.status} onChange={(e) => {
                  const newStatus = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, status: newStatus } : b));
                  setSelectedBatch({ ...selectedBatch, status: newStatus });
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="drying">Drying</option>
                  <option value="soaking">Soaking</option>
                  <option value="ready">Ready to Use</option>
                  <option value="wedging">Needs Wedging</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                <input type="number" step="0.1" value={selectedBatch.weight || ''} onChange={(e) => {
                  const newWeight = e.target.value ? parseFloat(e.target.value) : null;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, weight: newWeight } : b));
                  setSelectedBatch({ ...selectedBatch, weight: newWeight });
                }} placeholder="Optional" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Source</label>
                <input type="text" value={selectedBatch.source} onChange={(e) => {
                  const newSource = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, source: newSource } : b));
                  setSelectedBatch({ ...selectedBatch, source: newSource });
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea value={selectedBatch.notes} onChange={(e) => {
                  const newNotes = e.target.value;
                  setReclaimBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, notes: newNotes } : b));
                  setSelectedBatch({ ...selectedBatch, notes: newNotes });
                }} placeholder="Clay type, mixing notes..." rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Started</span>
                  <span className="font-medium text-slate-800">{selectedBatch.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
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
              <button onClick={() => setSelectedBatch(null)} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
                Save
              </button>
            </div>
          </div>
        ) : currentView === 'sustainable' ? (
          /* Sustainable Studio View */
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Sustainable Studio</h1>
              <p className="text-lg text-slate-600">Track reclaim, reduce waste, save resources</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
              <button onClick={() => setSustainableTab('reclaim')} className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${sustainableTab === 'reclaim' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-600'}`}>
                Clay Reclaim
              </button>
              <button onClick={() => setSustainableTab('tips')} className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${sustainableTab === 'tips' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-600'}`}>
                Studio Tips
              </button>
            </div>

            {sustainableTab === 'reclaim' ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Total Reclaimed</h3>
                  <p className="text-4xl font-bold text-green-700">
                    {reclaimBatches.filter(b => b.weight).reduce((sum, b) => sum + b.weight, 0).toFixed(1)} kg
                  </p>
                  <p className="text-sm text-green-700 mt-1">{reclaimBatches.length} batches in progress</p>
                </div>

                <div className="space-y-3">
                  {reclaimBatches.map(batch => (
                    <button key={batch.id} onClick={() => setSelectedBatch(batch)} className="w-full bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-left shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">{batch.source}</h3>
                          {batch.weight && <p className="text-sm text-slate-600">{batch.weight} kg</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${batch.status === 'ready' ? 'bg-green-100 text-green-800' : batch.status === 'drying' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{batch.notes}</p>
                      <p className="text-xs text-slate-500">Started: {batch.date}</p>
                    </button>
                  ))}
                </div>

                {reclaimBatches.length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg shadow-sm">
                    <Leaf size={48} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-700 mb-1">No reclaim batches yet</h3>
                    <p className="text-slate-500">Start tracking your clay reclaim</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {['clay_reclaim', 'diy_tools', 'plaster_bats'].map(category => {
                  const categoryTips = studioTips.filter(tip => tip.category === category);
                  const categoryLabels = { clay_reclaim: 'Clay Reclaim', diy_tools: 'DIY Tools', plaster_bats: 'Plaster Bats' };

                  return (
                    <div key={category} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <button onClick={() => setExpandedTips(p => ({ ...p, [category]: !p[category] }))} className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 transition-colors">
                        <h3 className="font-semibold text-slate-800">{categoryLabels[category]}</h3>
                        {expandedTips[category] ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </button>

                      {expandedTips[category] && (
                        <div className="p-4 pt-0 space-y-3">
                          {categoryTips.map(tip => (
                            <div key={tip.id} className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg p-4">
                              <h4 className="font-medium text-slate-800 mb-2">{tip.title}</h4>
                              <p className="text-sm text-slate-700 mb-3">{tip.content}</p>
                              <div className="flex flex-wrap gap-2">
                                {tip.tags.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">{tag}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                          {categoryTips.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No tips yet. Add your own!</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                <h1 className="text-2xl font-bold text-slate-800">{selectedGuild.name}</h1>
                <p className="text-sm text-slate-600">{selectedGuild.location} • {selectedGuild.members} members</p>
              </div>
              {selectedGuild.isAdmin && <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Admin</span>}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-2">About</h3>
              <p className="text-slate-700 mb-4">{selectedGuild.description}</p>
              
              {selectedGuild.isAdmin && (
                <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-800 mb-1">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-white border border-slate-300 rounded text-lg font-mono font-bold text-slate-800 flex-1 text-center shadow-sm">
                      {selectedGuild.inviteCode}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(selectedGuild.inviteCode); alert('Copied!'); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Share this code to invite members</p>
                </div>
              )}
            </div>

            {selectedGuild.event && (
              <div className="bg-orange-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="text-orange-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-teal-900 mb-1">Upcoming Event</h3>
                    <p className="text-orange-800">{selectedGuild.event}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedGuild.memberList && selectedGuild.memberList.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-3">Members ({selectedGuild.members})</h3>
                <div className="space-y-2">
                  {selectedGuild.memberList.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member[0]}
                      </div>
                      <span className="text-slate-800">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Message Board
              </h3>
              {selectedGuild.posts && selectedGuild.posts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {selectedGuild.posts.map(post => (
                    <div key={post.id} className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-slate-800">{post.author}</span>
                        <span className="text-xs text-slate-500">{post.time}</span>
                      </div>
                      <p className="text-slate-700 text-sm">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 mb-4">
                  <p>No messages yet</p>
                </div>
              )}
              <button onClick={() => setShowModal(true)} className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                New Post
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Shared Resources
              </h3>
              {selectedGuild.resources && selectedGuild.resources.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedGuild.resources.map(resource => (
                    <div key={resource.id} className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{resource.title}</p>
                        <p className="text-xs text-slate-600">Added by {resource.addedBy}</p>
                      </div>
                      <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded">{resource.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 mb-4">
                  <p>No resources yet</p>
                </div>
              )}
              <button onClick={() => setShowModal(true)} className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Add Resource
              </button>
            </div>
          </div>
        ) : currentView === 'guilds' ? (
          /* Guilds List View */
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-800 mb-1">My Guilds</h1>
              <p className="text-lg text-slate-600">Connect with local pottery communities</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
              <button onClick={() => setGuildTab('my-guilds')} className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${guildTab === 'my-guilds' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-600'}`}>
                My Guilds
              </button>
              <button onClick={() => setGuildTab('discover')} className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${guildTab === 'discover' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-600'}`}>
                Discover
              </button>
            </div>

            {guildTab === 'my-guilds' ? (
              <div className="space-y-4">
                {guilds.filter(g => g.isMember).map(guild => (
                  <button key={guild.id} onClick={() => setSelectedGuild(guild)} className="w-full bg-white rounded-lg p-6 hover:shadow-md transition-shadow text-left shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">{guild.name}</h3>
                        <p className="text-sm text-slate-600">{guild.location}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">Member</span>
                    </div>
                    <p className="text-slate-700 mb-3">{guild.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
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
                  <div className="text-center py-12 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg shadow-sm">
                    <Users size={48} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-700 mb-1">No guilds yet</h3>
                    <p className="text-slate-500">Create or join a local pottery guild</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-3">Have an Invite Code?</h3>
                  <button onClick={() => setShowModal(true)} className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
                    Join by Invite Code
                  </button>
                </div>

                <div className="space-y-3">
                  {guilds.filter(g => !g.isMember).map(guild => (
                    <div key={guild.id} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-1">{guild.name}</h3>
                          <p className="text-sm text-slate-600">{guild.location}</p>
                        </div>
                      </div>
                      <p className="text-slate-700 mb-3">{guild.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Users size={16} />
                          <span>{guild.members} members</span>
                        </div>
                        <button onClick={() => {
                          setGuilds(prev => prev.map(g => g.id === guild.id ? { ...g, isMember: true, members: g.members + 1, memberList: [...(g.memberList || []), user.username] } : g));
                        }} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                          Join Guild
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !selected ? (
          <div className="space-y-6">
            {/* Hero */}
            <div className="px-2">
              <p className="text-slate-600 mb-1">Hello, {user.username}</p>
              <h1 className="text-5xl font-normal text-slate-900 mb-6">What are we making today?</h1>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTab('pieces')} className={`p-6 rounded-2xl text-left transition-all ${tab === 'pieces' ? 'bg-gradient-to-br from-amber-100 to-orange-100 shadow-md' : 'bg-white shadow-sm'}`}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
                    <Flame size={22} className={tab === 'pieces' ? 'text-orange-600' : 'text-slate-600'} />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">Pieces</h3>
                </button>
                
                <button onClick={() => setTab('glazes')} className={`p-6 rounded-2xl text-left transition-all ${tab === 'glazes' ? 'bg-gradient-to-br from-blue-100 to-orange-100 shadow-md' : 'bg-white shadow-sm'}`}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
                    <Palette size={22} className={tab === 'glazes' ? 'text-orange-600' : 'text-slate-600'} />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">Glaze Garden</h3>
                </button>
              </div>
            </div>

            {/* Content */}
            {tab === 'pieces' ? (
              <div className="grid grid-cols-2 gap-3">
                {projects.map(p => (
                  <button key={p.id} onClick={() => setSelected(p)} className="bg-white rounded-lg p-3 hover:shadow-md text-left shadow-sm">
                    <div className="aspect-square bg-slate-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                      {p.photos.length > 0 ? <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover" /> : <Flame size={32} className="text-slate-400" />}
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-slate-600">{p.clay}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${stageColors[p.stage]}`}>
                      {formatStage(p.stage)}
                    </span>
                  </button>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 rounded-lg shadow-sm">
                    <Flame size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-500">No pieces yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {glazes.map(g => (
                  <button key={g.id} onClick={() => setSelected(g)} className="bg-white rounded-lg p-4 hover:shadow-md text-left shadow-sm">
                    <div className="aspect-square bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                      {g.tiles.length > 0 ? <img src={g.tiles[0].url} alt={g.name} className="w-full h-full object-cover" /> : <Palette size={32} className="text-slate-400" />}
                    </div>
                    <h3 className="font-semibold text-slate-800">{g.name}</h3>
                    <p className="text-sm text-slate-600">{g.type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'pieces' ? (
          /* Project Detail */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{selected.title}</h1>
                <p className="text-sm text-slate-600">{selected.clay}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Current Stage</p>
                  <span className={`inline-block px-4 py-2 rounded-full font-medium ${stageColors[selected.stage]}`}>
                    {formatStage(selected.stage)}
                  </span>
                </div>
                {nextStage(selected.stage) && (
                  <button onClick={() => {
                    const ns = nextStage(selected.stage);
                    setProjects(p => p.map(x => x.id === selected.id ? { ...x, stage: ns } : x));
                    setSelected({ ...selected, stage: ns });
                  }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <CheckCircle size={20} />
                    <span>Move to {formatStage(nextStage(selected.stage))}</span>
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800 mb-3">Photos</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {selected.photos.map(ph => (
                    <div key={ph.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={ph.url} alt="Piece" className="w-full h-full object-cover" />
                      <button onClick={() => deletePhoto(ph.id, 'project')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-orange-500 cursor-pointer">
                  <Camera size={20} />
                  <span className="font-medium">Add Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'project')} className="hidden" />
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea value={selected.notes[selected.stage] || ''} onChange={(e) => {
                  const n = e.target.value;
                  setProjects(p => p.map(x => x.id === selected.id ? { ...x, notes: { ...x.notes, [selected.stage]: n } } : x));
                  setSelected({ ...selected, notes: { ...selected.notes, [selected.stage]: n } });
                }} placeholder="Add notes..." rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>
        ) : (
          /* Glaze Detail */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{selected.name}</h1>
                <p className="text-sm text-slate-600">{selected.type}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Recipe</h3>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 p-4 rounded-lg">{selected.recipe || 'No recipe'}</pre>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Test Tiles</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {selected.tiles.map(t => (
                  <div key={t.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={t.url} alt="Test" className="w-full h-full object-cover" />
                    <button onClick={() => deletePhoto(t.id, 'glaze')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-orange-500 cursor-pointer">
                <Camera size={20} />
                <span className="font-medium">Add Test Tile</span>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'glaze')} className="hidden" />
              </label>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Notes</h3>
              <textarea value={selected.notes || ''} onChange={(e) => {
                const n = e.target.value;
                setGlazes(g => g.map(x => x.id === selected.id ? { ...x, notes: n } : x));
                setSelected({ ...selected, notes: n });
              }} placeholder="Application tips..." rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      {!selected && !selectedBatch && !selectedGuild && (currentView === 'studio' || currentView === 'sustainable' || currentView === 'guilds') && (
        <button onClick={() => setShowModal(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 z-30">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-2 flex justify-around h-16">
          <button onClick={() => { setCurrentView('studio'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'studio' ? 'text-orange-600' : 'text-slate-500'}`}>
            <Home size={24} strokeWidth={currentView === 'studio' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Studio</span>
          </button>
          <button onClick={() => { setCurrentView('sustainable'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'sustainable' ? 'text-orange-600' : 'text-slate-500'}`}>
            <Leaf size={24} strokeWidth={currentView === 'sustainable' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Studio Cycle</span>
          </button>
          <button onClick={() => { setCurrentView('guilds'); setSelected(null); setSelectedBatch(null); setSelectedGuild(null); }} className={`flex flex-col items-center justify-center flex-1 ${currentView === 'guilds' ? 'text-orange-600' : 'text-slate-500'}`}>
            <Users size={24} strokeWidth={currentView === 'guilds' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Guilds</span>
          </button>
        </div>
      </nav>

      {/* New Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedGuild && form.guildPost !== undefined ? 'New Post' :
                 selectedGuild && form.resourceTitle !== undefined ? 'Add Resource' :
                 currentView === 'guilds' && guildTab === 'discover' && form.inviteCode !== undefined ? 'Join by Invite Code' :
                 currentView === 'guilds' ? 'Create Guild' :
                 currentView === 'sustainable' && sustainableTab === 'reclaim' ? 'New Reclaim Batch' :
                 currentView === 'sustainable' && sustainableTab === 'tips' ? 'New Studio Tip' :
                 tab === 'pieces' ? 'New Piece' : 'New Glaze'}
              </h2>
              <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [], guildName: '', guildLocation: '', guildDesc: '', inviteCode: '', guildPost: '', resourceTitle: '', resourceType: 'PDF', feedback: '' }); }}>
                <X size={24} />
              </button>
            </div>
            
            {currentView === 'guilds' && guildTab === 'discover' && !selectedGuild ? (
              <div className="space-y-4">
                <input type="text" value={form.inviteCode} onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })} placeholder="Enter invite code" maxLength={8} className="w-full px-3 py-2 border rounded-lg uppercase text-center text-lg font-mono font-bold" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, inviteCode: '' }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    const guild = guilds.find(g => g.inviteCode === form.inviteCode);
                    if (guild && !guild.isMember) {
                      setGuilds(prev => prev.map(g => g.id === guild.id ? { ...g, isMember: true, members: g.members + 1, memberList: [...(g.memberList || []), user.username] } : g));
                      setForm({ ...form, inviteCode: '' });
                      setShowModal(false);
                      setGuildTab('my-guilds');
                    } else alert(guild ? 'Already a member' : 'Invalid code');
                  }} disabled={!form.inviteCode} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Join</button>
                </div>
              </div>
            ) : selectedGuild && form.guildPost !== undefined ? (
              <div className="space-y-4">
                <textarea value={form.guildPost} onChange={(e) => setForm({ ...form, guildPost: e.target.value })} placeholder="Share something..." rows={4} className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, guildPost: '' }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.guildPost) return;
                    const newPost = { id: Date.now().toString(), author: user.username, content: form.guildPost, time: 'Just now' };
                    setGuilds(prev => prev.map(g => g.id === selectedGuild.id ? { ...g, posts: [newPost, ...(g.posts || [])] } : g));
                    setSelectedGuild({ ...selectedGuild, posts: [newPost, ...(selectedGuild.posts || [])] });
                    setForm({ ...form, guildPost: '' });
                    setShowModal(false);
                  }} disabled={!form.guildPost} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Post
                  </button>
                </div>
              </div>
            ) : selectedGuild && form.resourceTitle !== undefined ? (
              <div className="space-y-4">
                <input type="text" value={form.resourceTitle} onChange={(e) => setForm({ ...form, resourceTitle: e.target.value })} placeholder="Resource title" className="w-full px-3 py-2 border rounded-lg" />
                <select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="PDF">PDF</option>
                  <option value="Link">Link</option>
                  <option value="Video">Video</option>
                </select>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, resourceTitle: '' }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.resourceTitle) return;
                    const newResource = { id: Date.now().toString(), title: form.resourceTitle, type: form.resourceType, addedBy: user.username };
                    setGuilds(prev => prev.map(g => g.id === selectedGuild.id ? { ...g, resources: [...(g.resources || []), newResource] } : g));
                    setSelectedGuild({ ...selectedGuild, resources: [...(selectedGuild.resources || []), newResource] });
                    setForm({ ...form, resourceTitle: '', resourceType: 'PDF' });
                    setShowModal(false);
                  }} disabled={!form.resourceTitle} className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg disabled:bg-slate-300">Add</button>
                </div>
              </div>
            ) : currentView === 'guilds' && !selectedGuild ? (
              <div className="space-y-4">
                <input type="text" value={form.guildName} onChange={(e) => setForm({ ...form, guildName: e.target.value })} placeholder="Guild name" className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={form.guildLocation} onChange={(e) => setForm({ ...form, guildLocation: e.target.value })} placeholder="Location" className="w-full px-3 py-2 border rounded-lg" />
                <textarea value={form.guildDesc} onChange={(e) => setForm({ ...form, guildDesc: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ ...form, guildName: '', guildLocation: '', guildDesc: '' }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.guildName || !form.guildLocation) return;
                    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    setGuilds([{ id: Date.now().toString(), name: form.guildName, members: 1, memberList: [user.username], location: form.guildLocation, description: form.guildDesc, isMember: true, isAdmin: true, event: null, posts: [], resources: [], inviteCode }, ...guilds]);
                    setForm({ ...form, guildName: '', guildLocation: '', guildDesc: '' });
                    setShowModal(false);
                  }} disabled={!form.guildName || !form.guildLocation} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Create</button>
                </div>
              </div>
            ) : currentView === 'sustainable' && sustainableTab === 'reclaim' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g., 5.5 (optional)" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source *</label>
                  <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g., Trimming scraps" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                  <textarea value={form.batchNotes} onChange={(e) => setForm({ ...form, batchNotes: e.target.value })} placeholder="Clay type, mixing notes..." rows={3} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.source) return;
                    setReclaimBatches([{ id: Date.now().toString(), weight: form.weight ? parseFloat(form.weight) : null, source: form.source, date: new Date().toISOString().split('T')[0], status: 'drying', notes: form.batchNotes }, ...reclaimBatches]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] });
                    setShowModal(false);
                  }} disabled={!form.source} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Create</button>
                </div>
              </div>
            ) : currentView === 'sustainable' && sustainableTab === 'tips' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select value={form.tipCategory} onChange={(e) => setForm({ ...form, tipCategory: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="clay_reclaim">Clay Reclaim</option>
                    <option value="diy_tools">DIY Tools</option>
                    <option value="plaster_bats">Plaster Bats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tip Title *</label>
                  <input type="text" value={form.tipTitle} onChange={(e) => setForm({ ...form, tipTitle: e.target.value })} placeholder="e.g., Quick Dry Method" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
                  <textarea value={form.tipContent} onChange={(e) => setForm({ ...form, tipContent: e.target.value })} placeholder="Describe your tip..." rows={4} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                  <input type="text" value={form.tipTags.join(', ')} onChange={(e) => setForm({ ...form, tipTags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })} placeholder="e.g., Water Conservation, Energy" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.tipTitle || !form.tipContent) return;
                    setStudioTips([...studioTips, { id: Date.now().toString(), category: form.tipCategory, title: form.tipTitle, content: form.tipContent, tags: form.tipTags }]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] });
                    setShowModal(false);
                  }} disabled={!form.tipTitle || !form.tipContent} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Add Tip</button>
                </div>
              </div>
            ) : tab === 'pieces' ? (
              <div className="space-y-4">
                {form.photo ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2">
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, photo: null })} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-500">
                    <Camera size={48} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Add photo (optional)</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setForm({ ...form, photo: reader.result });
                      reader.readAsDataURL(file);
                    }} className="hidden" />
                  </label>
                )}
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Piece name" className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={form.clay} onChange={(e) => setForm({ ...form, clay: e.target.value })} placeholder="Clay body" className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.title || !form.clay) return;
                    setProjects([{ id: Date.now().toString(), title: form.title, clay: form.clay, stage: 'wedging', date: new Date().toISOString().split('T')[0], photos: form.photo ? [{ id: Date.now().toString(), url: form.photo }] : [], notes: {} }, ...projects]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] });
                    setShowModal(false);
                  }} disabled={!form.title || !form.clay} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Create</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Glaze name" className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Firing type" className="w-full px-3 py-2 border rounded-lg" />
                <textarea value={form.recipe} onChange={(e) => setForm({ ...form, recipe: e.target.value })} placeholder="Recipe..." rows={4} className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={() => {
                    if (!form.name || !form.type) return;
                    setGlazes([{ id: Date.now().toString(), name: form.name, type: form.type, recipe: form.recipe, notes: '', tiles: [] }, ...glazes]);
                    setForm({ title: '', clay: '', name: '', type: '', recipe: '', photo: null, weight: '', source: '', batchNotes: '', tipCategory: 'clay_reclaim', tipTitle: '', tipContent: '', tipTags: [] });
                    setShowModal(false);
                  }} disabled={!form.name || !form.type} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-slate-300">Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {settingsView === 'main' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                    <button onClick={() => setShowSettings(false)} className="p-2"><X size={24} /></button>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="p-6 space-y-2">
                    <button onClick={() => setSettingsView('profile')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl hover:from-orange-100 hover:to-amber-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {user.username[0]}
                        </div>
                        <span className="font-semibold text-slate-800">Your Profile</span>
                      </div>
                      <ChevronRight size={20} className="text-slate-400" />
                    </button>

                    <button onClick={() => setSettingsView('preferences')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                      <span className="font-medium text-slate-800">Preferences</span>
                      <ChevronRight size={20} className="text-slate-400" />
                    </button>

                    <button onClick={() => setSettingsView('feedback')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                      <span className="font-medium text-slate-800">Give Feedback</span>
                      <ChevronRight size={20} className="text-slate-400" />
                    </button>

                    <button onClick={() => setSettingsView('legal')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                      <span className="font-medium text-slate-800">Legal & Privacy</span>
                      <ChevronRight size={20} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </>
            ) : settingsView === 'profile' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-slate-800">Your Profile</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-3 shadow-lg">
                      {user.username[0]}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input type="text" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} placeholder="Username" className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                    <textarea value={user.bio} onChange={(e) => setUser({ ...user, bio: e.target.value })} placeholder="Bio" rows={3} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                    <input type="text" value={user.location} onChange={(e) => setUser({ ...user, location: e.target.value })} placeholder="Location" className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
                  </div>
                  <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-md">Save Changes</button>
                </div>
              </>
            ) : settingsView === 'preferences' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-slate-800">Preferences</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Units of Measurement</label>
                    <select value={user.units || 'metric'} onChange={(e) => setUser({ ...user, units: e.target.value })} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                      <option value="metric">Metric (kg, cm)</option>
                      <option value="imperial">Imperial (lbs, inches)</option>
                    </select>
                  </div>
                  <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-md">Save Preferences</button>
                </div>
              </>
            ) : settingsView === 'feedback' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-slate-800">Give Feedback</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-slate-600">We'd love to hear your thoughts on Coastal Kiln!</p>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Feedback</label>
                    <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Tell us what you think..." rows={6} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
                  </div>
                  <button onClick={() => {
                    if (form.feedback.trim()) {
                      alert('Thank you for your feedback!');
                      setForm({ ...form, feedback: '' });
                      setSettingsView('main');
                    }
                  }} disabled={!form.feedback.trim()} className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-md disabled:from-slate-300 disabled:to-slate-300">
                    Submit Feedback
                  </button>
                </div>
              </>
            ) : settingsView === 'legal' ? (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSettingsView('main')} className="p-2"><ArrowLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-slate-800">Legal & Privacy</h2>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <button onClick={() => window.open('/privacy-policy', '_blank')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                    <span className="font-medium text-slate-800">Privacy Policy</span>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                  <button onClick={() => window.open('/terms-of-service', '_blank')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                    <span className="font-medium text-slate-800">Terms of Service</span>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-sm text-slate-600">Version 1.0.0</p>
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
      )}
    </div>
  );
}

export default CoastalKilnApp;
