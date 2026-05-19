import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { 
  Save, 
  Globe, 
  Layout, 
  Bell, 
  Loader2, 
  Users, 
  Clock, 
  Plus, 
  Trash2,
  MonitorPlay,
  BarChart3,
  Timer,
  Users2,
  ShoppingBag,
  Sparkles,
  RotateCw,
  Share2,
  Camera
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

// Default About data for first-time setup
const defaultAbout = {
  hero_title: 'Crafted with Passion, Rooted in Heritage',
  hero_subtitle: 'Born in Cox\'s Bazar, raised on tradition. Every jar carries decades of culinary wisdom.',
  stats: [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Products', value: '50+' },
    { label: 'Years of Craft', value: '7+' },
    { label: 'Quality Guarantee', value: '100%' },
  ],
  timeline: [
    { year: '2018', title: 'Humble Beginnings', description: 'Founded in a small kitchen in Cox\'s Bazar with grandma\'s secret recipes.' },
    { year: '2019', title: 'First 100 Customers', description: 'Reached our first 100 loyal customers through local markets.' },
    { year: '2020', title: 'Online Store Launched', description: 'Took the leap to e-commerce. Nationwide delivery launched.' },
    { year: '2021', title: 'Certified Organic', description: 'Partnered with organic farmers and received quality certification.' },
    { year: '2023', title: '10,000+ Orders', description: 'A milestone — 10,000 happy customers across Bangladesh.' },
    { year: '2025', title: 'Premium Collection', description: 'Launched flagship Premium Collection for the true connoisseur.' },
  ],
  team: [
    { name: 'Rahima Begum', role: 'Founder & Master Pickler', bio: 'With 30+ years of culinary experience, Rahima is the heart and soul of our brand.', initials: 'RB', image: '' },
    { name: 'Kamal Hossain', role: 'Head of Operations', bio: 'Kamal ensures every order is packed fresh and dispatched on time.', initials: 'KH', image: '' },
    { name: 'Sadia Islam', role: 'Quality & Sourcing', bio: 'Sadia works directly with farmers to source the finest, freshest ingredients.', initials: 'SI', image: '' },
    { name: 'Tariq Miah', role: 'Customer Experience', bio: 'Tariq is obsessed with customer happiness. Fast replies, always.', initials: 'TM', image: '' },
  ],
  cta_title: 'Taste the Heritage',
  cta_subtitle: 'Every jar is a chapter in our story. Now it\'s time to make it yours.',
};

const defaultHome = {
  why_us: [
    { icon: 'Leaf', title: 'All-Natural Ingredients', desc: 'Zero preservatives, zero artificial flavors.' },
    { icon: 'ShieldCheck', title: '100% Homemade', desc: 'Every batch is crafted in small quantities.' },
    { icon: 'Truck', title: 'Fast Delivery', desc: 'Carefully packed and delivered to your doorstep.' },
    { icon: 'Award', title: 'Certified Quality', desc: 'Our production facility meets BSTI standards.' },
    { icon: 'Heart', title: 'Family Recipes', desc: 'Passed down through three generations.' },
    { icon: 'Flame', title: 'Bold Flavors', desc: 'Bold, unapologetic flavors you love.' },
  ],
  process: [
    { step: '01', title: 'Farm Sourced', desc: 'We partner directly with local farmers.', color: '#15803d' },
    { step: '02', title: 'Hand Crafted', desc: 'Each batch is mixed and spiced by hand.', color: '#800000' },
    { step: '03', title: 'Quality Checked', desc: 'Every jar passes a rigorous taste check.', color: '#b45309' },
    { step: '04', title: 'At Your Door', desc: 'Vacuum-sealed for maximum freshness.', color: '#7c3aed' },
  ],
  newsletter_title: '',
  newsletter_subtitle: '',
};

const inputCls = "w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none transition-all font-medium text-slate-800 text-sm";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";

const Settings = () => {
  const { selectedStore, setSettings: setGlobalSettings } = useStore();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    store_name: '',
    store_email: '',
    support_phone: '',
    whatsapp_number: '',
    currency: '৳',
    address: '',
    delivery_inside: '70',
    delivery_outside: '120',
    delivery_per_kg: '10',
    bkash_number: '',
    free_delivery_threshold: '2500',
    website: '',
    logo_url: '',
    notifications: {
      new_order_email: true,
      low_stock_alerts: true,
      notice_bar_enabled: false,
      notice_bar_text: '',
    },
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      whatsapp: ''
    },
    about: defaultAbout,
    home: defaultHome,
    tagline: '',
    security: {
      inactivity_timeout_enabled: true,
      inactivity_timeout: 15,
      working_hours_enabled: false,
      working_hours_start: '09:00',
      working_hours_end: '18:00',
      working_days: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchSettings();
  }, [selectedStore]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings(siteId);
      if (data) {
        const parsedSocial = data.social_links ? (typeof data.social_links === 'string' ? JSON.parse(data.social_links) : data.social_links) : {};
        const parsedAbout = data.about ? (typeof data.about === 'string' ? JSON.parse(data.about) : data.about) : {};
        const parsedHome = data.home ? (typeof data.home === 'string' ? JSON.parse(data.home) : data.home) : {};
        const parsedSecurity = data.security ? (typeof data.security === 'string' ? JSON.parse(data.security) : data.security) : {};

        setSettings({
          store_name: data.store_name || '',
          store_email: data.store_email || '',
          support_phone: data.support_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          currency: data.currency || '৳',
          address: data.address || '',
          delivery_inside: data.delivery_inside || '70',
          delivery_outside: data.delivery_outside || '120',
          delivery_per_kg: data.delivery_per_kg || '10',
          bkash_number: data.bkash_number || '',
          free_delivery_threshold: data.free_delivery_threshold || '2500',
          website: data.website || (selectedStore === 'acharu' ? 'www.acharu.com' : 'www.tajashutki.com'),
          tagline: data.tagline || '',
          logo_url: data.logo_url || '',
          notifications: data.notifications ? (typeof data.notifications === 'string' ? JSON.parse(data.notifications) : data.notifications) : {
            new_order_email: true,
            low_stock_alerts: true,
            notice_bar_enabled: false,
            notice_bar_text: '',
          },
          social_links: {
            facebook: '',
            instagram: '',
            twitter: '',
            tiktok: '',
            youtube: '',
            whatsapp: '',
            ...parsedSocial
          },
          about: { ...defaultAbout, ...parsedAbout },
          home: { ...defaultHome, ...parsedHome },
          security: {
            inactivity_timeout_enabled: true,
            inactivity_timeout: 15,
            working_hours_enabled: false,
            working_hours_start: '09:00',
            working_hours_end: '18:00',
            working_days: [0, 1, 2, 3, 4, 5, 6],
            ...parsedSecurity
          },
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(siteId, settings);
      setGlobalSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateAbout = (key, value) => {
    setSettings(s => ({ ...s, about: { ...s.about, [key]: value } }));
  };

  const updateHome = (key, value) => {
    setSettings(s => ({ ...s, home: { ...s.home, [key]: value } }));
  };

  const updateTimelineItem = (idx, field, value) => {
    const updated = [...settings.about.timeline];
    updated[idx] = { ...updated[idx], [field]: value };
    updateAbout('timeline', updated);
  };

  const addTimelineItem = () => {
    updateAbout('timeline', [...settings.about.timeline, { year: '', title: '', description: '' }]);
  };

  const removeTimelineItem = (idx) => {
    updateAbout('timeline', settings.about.timeline.filter((_, i) => i !== idx));
  };

  const updateTeamMember = (idx, field, value) => {
    const updated = [...settings.about.team];
    updated[idx] = { ...updated[idx], [field]: value };
    updateAbout('team', updated);
  };

  const addTeamMember = () => {
    updateAbout('team', [...settings.about.team, { name: '', role: '', bio: '', initials: '', image: '' }]);
  };

  const removeTeamMember = (idx) => {
    updateAbout('team', settings.about.team.filter((_, i) => i !== idx));
  };

  const handleTeamImageUpload = async (idx, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      toast.loading('Uploading image...', { id: 'team-img' });
      const data = await api.uploadSettingsMedia(formData);
      updateTeamMember(idx, 'image', data.url);
      toast.success('Image uploaded', { id: 'team-img' });
    } catch (error) {
      toast.error('Upload failed', { id: 'team-img' });
    }
  };

  const handleLogoUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      toast.loading('Uploading logo...', { id: 'logo-upload' });
      const data = await api.uploadSettingsMedia(formData);
      setSettings(prev => ({ ...prev, logo_url: data.url }));
      toast.success('Logo updated', { id: 'logo-upload' });
    } catch (error) {
      toast.error('Upload failed', { id: 'logo-upload' });
    }
  };

  const updateStat = (idx, field, value) => {
    const updated = [...settings.about.stats];
    updated[idx] = { ...updated[idx], [field]: value };
    updateAbout('stats', updated);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'home', label: 'Home Page', icon: Layout },
    { id: 'about', label: 'About Page', icon: Users },
    { id: 'social', label: 'Social Media', icon: Plus },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Clock },
  ];

  const SaveButton = () => (
    <div className="pt-6 border-t border-slate-100 flex justify-end mt-8">
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Save Changes
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Loader2 className="animate-spin mr-3" />
      Loading configurations...
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Settings</h1>
        <p className="text-slate-500 font-medium">Manage your {selectedStore} store configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              )}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">

          {/* ── GENERAL TAB ── */}
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                { [
                  ['Store Name', 'store_name', 'text'],
                  ['Store Email', 'store_email', 'email'],
                  ['Support Phone', 'support_phone', 'text'],
                  ['Currency Symbol', 'currency', 'text'],
                  ['WhatsApp Number', 'whatsapp_number', 'text'],
                  ['Store Website', 'website', 'text'],
                  ['Store Tagline', 'tagline', 'text'],
                  ['Delivery Charge (Inside City)', 'delivery_inside', 'text'],
                  ['Delivery Charge (Outside City)', 'delivery_outside', 'text'],
                  ['Per KG Extra Charge', 'delivery_per_kg', 'text'],
                  ['Free Delivery Threshold (৳)', 'free_delivery_threshold', 'number'],
                  ['bKash Number', 'bkash_number', 'text'],
                ].map(([label, key, type]) => (
                  <div key={key} className="space-y-2">
                    <label className={labelCls}>{label}</label>
                    <input
                      type={type}
                      value={settings[key] || ''}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Logo Upload Section */}
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                <h4 className={labelCls + " mb-4"}>Store Logo</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Store Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Layout size={32} className="text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-xs font-medium text-slate-500 max-w-xs">
                      Upload your store logo. Recommended size: 512x512px. Supports PNG, JPG, WEBP.
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                      <Camera size={18} />
                      Choose Image
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Store Address</label>
                <textarea
                  rows={3}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className={inputCls + ' resize-none'}
                />
              </div>
              <SaveButton />
            </div>
          )}

          {/* ── ABOUT PAGE TAB ── */}
          {activeTab === 'about' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Hero Section */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <MonitorPlay size={20} className="text-slate-400" /> Hero Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Hero Title</label>
                    <input
                      type="text"
                      value={settings.about.hero_title}
                      onChange={(e) => updateAbout('hero_title', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={settings.about.hero_subtitle}
                      onChange={(e) => updateAbout('hero_subtitle', e.target.value)}
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <BarChart3 size={20} className="text-slate-400" /> Stats Bar (4 items)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(settings.about.stats || []).map((stat, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4 flex gap-3">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className={labelCls}>Value</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => updateStat(idx, 'value', e.target.value)}
                            className={inputCls}
                            placeholder="e.g. 10,000+"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStat(idx, 'label', e.target.value)}
                            className={inputCls}
                            placeholder="e.g. Happy Customers"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Timer size={20} className="text-slate-400" /> Timeline Events
                  </h3>
                  <button
                    onClick={addTimelineItem}
                    className="flex items-center gap-1 text-xs font-black text-maroon bg-maroon/5 hover:bg-maroon/10 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={14} /> Add Event
                  </button>
                </div>
                <div className="space-y-4">
                  {(settings.about.timeline || []).map((event, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 relative">
                      <button
                        onClick={() => removeTimelineItem(idx)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className={labelCls}>Year</label>
                          <input
                            type="text"
                            value={event.year}
                            onChange={(e) => updateTimelineItem(idx, 'year', e.target.value)}
                            className={inputCls}
                            placeholder="e.g. 2020"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Title</label>
                          <input
                            type="text"
                            value={event.title}
                            onChange={(e) => updateTimelineItem(idx, 'title', e.target.value)}
                            className={inputCls}
                            placeholder="Event title"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea
                          rows={2}
                          value={event.description}
                          onChange={(e) => updateTimelineItem(idx, 'description', e.target.value)}
                          className={inputCls + ' resize-none'}
                          placeholder="What happened this year..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Users2 size={20} className="text-slate-400" /> Team Members
                  </h3>
                  <button
                    onClick={addTeamMember}
                    className="flex items-center gap-1 text-xs font-black text-maroon bg-maroon/5 hover:bg-maroon/10 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(settings.about.team || []).map((member, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 relative">
                      <button
                        onClick={() => removeTeamMember(idx)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="relative group">
                              <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                                 {member.image ? (
                                   <img src={member.image} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-slate-400 font-black">{member.initials || '?'}</span>
                                 )}
                              </div>
                              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                                <Camera size={14} className="text-slate-600" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => e.target.files?.[0] && handleTeamImageUpload(idx, e.target.files[0])}
                                />
                              </label>
                           </div>
                           <div className="flex-1">
                             <label className={labelCls}>Initials</label>
                             <input
                               type="text"
                               maxLength={2}
                               value={member.initials}
                               onChange={(e) => updateTeamMember(idx, 'initials', e.target.value.toUpperCase())}
                               className={inputCls + ' text-center font-black !py-1'}
                               placeholder="AB"
                             />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className={labelCls}>Name</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                              className={inputCls}
                              placeholder="Full name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Role / Position</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                            className={inputCls}
                            placeholder="e.g. Head of Operations"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Bio</label>
                          <textarea
                            rows={2}
                            value={member.bio}
                            onChange={(e) => updateTeamMember(idx, 'bio', e.target.value)}
                            className={inputCls + ' resize-none'}
                            placeholder="Short bio..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-slate-400" /> Bottom CTA
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>CTA Title</label>
                    <input
                      type="text"
                      value={settings.about.cta_title}
                      onChange={(e) => updateAbout('cta_title', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CTA Subtitle</label>
                    <input
                      type="text"
                      value={settings.about.cta_subtitle}
                      onChange={(e) => updateAbout('cta_subtitle', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <SaveButton />
            </div>
          )}

          {/* ── HOME PAGE TAB ── */}
          {activeTab === 'home' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Why Us Section */}
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-slate-400" /> Why Us Cards (Max 6)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(settings.home.why_us || []).map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className={labelCls}>Icon Name (Lucide)</label>
                          <input 
                            type="text" 
                            value={item.icon} 
                            onChange={(e) => {
                              const updated = [...settings.home.why_us];
                              updated[idx] = { ...updated[idx], icon: e.target.value };
                              updateHome('why_us', updated);
                            }}
                            className={inputCls} 
                            placeholder="e.g. Leaf, Truck, Star"
                          />
                        </div>
                        <div className="flex-1">
                          <label className={labelCls}>Title</label>
                          <input 
                            type="text" 
                            value={item.title} 
                            onChange={(e) => {
                              const updated = [...settings.home.why_us];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              updateHome('why_us', updated);
                            }}
                            className={inputCls} 
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea 
                          rows={2} 
                          value={item.desc}
                          onChange={(e) => {
                            const updated = [...settings.home.why_us];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            updateHome('why_us', updated);
                          }}
                          className={inputCls + ' resize-none'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Section */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <RotateCw size={20} className="text-slate-400" /> Process Steps (4)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(settings.home.process || []).map((step, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-20">
                          <label className={labelCls}>Step #</label>
                          <input type="text" value={step.step} readOnly className={inputCls + " opacity-50"} />
                        </div>
                        <div className="flex-1">
                          <label className={labelCls}>Title</label>
                          <input 
                            type="text" 
                            value={step.title} 
                            onChange={(e) => {
                              const updated = [...settings.home.process];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              updateHome('process', updated);
                            }}
                            className={inputCls} 
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea 
                          rows={2} 
                          value={step.desc}
                          onChange={(e) => {
                            const updated = [...settings.home.process];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            updateHome('process', updated);
                          }}
                          className={inputCls + ' resize-none'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              <SaveButton />
            </div>
          )}

          {/* ── SOCIAL MEDIA TAB ── */}
          {activeTab === 'social' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Share2 size={20} className="text-slate-400" /> Social Media Links
                </h3>
                <p className="text-slate-500 text-sm mb-8">Leave blank to hide the icon from your store footer.</p>
                
                <div className="space-y-6 max-w-2xl">
                  {[
                    ['Facebook Page URL', 'facebook'],
                    ['Instagram Profile URL', 'instagram'],
                    ['Twitter (X) URL', 'twitter'],
                    ['TikTok Profile URL', 'tiktok'],
                    ['YouTube Channel URL', 'youtube'],
                    ['WhatsApp Number (with country code)', 'whatsapp'],
                  ].map(([label, key]) => (
                    <div key={key} className="space-y-2">
                      <label className={labelCls}>{label}</label>
                      <input
                        type="url"
                        value={settings.social_links[key]}
                        onChange={(e) => setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, [key]: e.target.value }
                        })}
                        className={inputCls}
                        placeholder={`https://${key}.com/yourprofile`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* ── ALERTS / NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Bell size={20} className="text-slate-400" /> Store Alerts & Notifications
                </h3>
                <p className="text-slate-500 text-sm mb-8">Configure how your store communicates with you and your customers.</p>
                
                <div className="space-y-8 max-w-2xl">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Admin Alerts</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">New Order Email</p>
                          <p className="text-xs text-slate-500">Receive an email for every new order.</p>
                        </div>
                        <button 
                          onClick={() => setSettings({
                            ...settings, 
                            notifications: { ...settings.notifications, new_order_email: !settings.notifications?.new_order_email }
                          })}
                          className={clsx(
                            "w-12 h-6 rounded-full flex items-center px-1 transition-all",
                            settings.notifications?.new_order_email ? "bg-slate-900" : "bg-slate-200"
                          )}
                        >
                          <div className={clsx(
                            "w-4 h-4 bg-white rounded-full transition-all",
                            settings.notifications?.new_order_email && "translate-x-6"
                          )}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">Low Stock Alerts</p>
                          <p className="text-xs text-slate-500">Notify when products fall below 10 units.</p>
                        </div>
                        <button 
                          onClick={() => setSettings({
                            ...settings, 
                            notifications: { ...settings.notifications, low_stock_alerts: !settings.notifications?.low_stock_alerts }
                          })}
                          className={clsx(
                            "w-12 h-6 rounded-full flex items-center px-1 transition-all",
                            settings.notifications?.low_stock_alerts ? "bg-slate-900" : "bg-slate-200"
                          )}
                        >
                          <div className={clsx(
                            "w-4 h-4 bg-white rounded-full transition-all",
                            settings.notifications?.low_stock_alerts && "translate-x-6"
                          )}></div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-maroon/5 rounded-2xl p-6 border border-maroon/10">
                    <h4 className="text-sm font-black text-maroon uppercase tracking-wider mb-2">Notice Bar (Storefront)</h4>
                    <p className="text-xs text-slate-500 mb-4">Display a high-visibility message at the top of your website.</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={labelCls}>Notice Text</label>
                        <input 
                          type="text" 
                          className={inputCls} 
                          placeholder="e.g. Free shipping on orders over ৳2500!"
                          value={settings.notifications?.notice_bar_text || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, notice_bar_text: e.target.value }
                          })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-maroon focus:ring-maroon" 
                          checked={settings.notifications?.notice_bar_enabled || false}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, notice_bar_enabled: e.target.checked }
                          })}
                        />
                        <span className="text-sm font-bold text-slate-700">Enable Notice Bar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" /> Security & Access Controls
                </h3>
                <p className="text-slate-500 text-sm mb-8">Manage admin session idle timeout and working hours access limits.</p>
                
                <div className="space-y-8 max-w-2xl">
                  {/* Session Timeout */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Auto Logout (Idle Inactivity)</p>
                        <p className="text-xs text-slate-500 font-medium">Log out admins automatically after a period of inactivity.</p>
                      </div>
                      <button 
                        onClick={() => setSettings({
                          ...settings,
                          security: { 
                            ...settings.security, 
                            inactivity_timeout_enabled: !settings.security?.inactivity_timeout_enabled 
                          }
                        })}
                        className={clsx(
                          "w-12 h-6 rounded-full flex items-center px-1 transition-all",
                          settings.security?.inactivity_timeout_enabled ? "bg-slate-900" : "bg-slate-200"
                        )}
                      >
                        <div className={clsx(
                          "w-4 h-4 bg-white rounded-full transition-all",
                          settings.security?.inactivity_timeout_enabled && "translate-x-6"
                        )}></div>
                      </button>
                    </div>

                    {settings.security?.inactivity_timeout_enabled && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <label className={labelCls}>Inactivity Timeout (Minutes)</label>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={settings.security?.inactivity_timeout || 15}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { 
                              ...settings.security, 
                              inactivity_timeout: Math.max(1, parseInt(e.target.value) || 1) 
                            }
                          })}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>

                  {/* Working Hours */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Restrict Working Hours</p>
                        <p className="text-xs text-slate-500 font-medium">Lock admin panel access outside of specified days and hours.</p>
                      </div>
                      <button 
                        onClick={() => setSettings({
                          ...settings,
                          security: { 
                            ...settings.security, 
                            working_hours_enabled: !settings.security?.working_hours_enabled 
                          }
                        })}
                        className={clsx(
                          "w-12 h-6 rounded-full flex items-center px-1 transition-all",
                          settings.security?.working_hours_enabled ? "bg-slate-900" : "bg-slate-200"
                        )}
                      >
                        <div className={clsx(
                          "w-4 h-4 bg-white rounded-full transition-all",
                          settings.security?.working_hours_enabled && "translate-x-6"
                        )}></div>
                      </button>
                    </div>

                    {settings.security?.working_hours_enabled && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-1">
                          <p className="font-bold">⚠️ Warning: Access Restriction</p>
                          <p>Enabling this will restrict all admin actions to the selected days and hours (based on Bangladesh Time UTC+6). Setting this incorrectly can lock you out.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className={labelCls}>Start Time</label>
                            <input
                              type="time"
                              value={settings.security?.working_hours_start || '09:00'}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: { 
                                  ...settings.security, 
                                  working_hours_start: e.target.value 
                                }
                              })}
                              className={inputCls}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={labelCls}>End Time</label>
                            <input
                              type="time"
                              value={settings.security?.working_hours_end || '18:00'}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: { 
                                  ...settings.security, 
                                  working_hours_end: e.target.value 
                                }
                              })}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className={labelCls}>Working Days</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Sunday', val: 0 },
                              { label: 'Monday', val: 1 },
                              { label: 'Tuesday', val: 2 },
                              { label: 'Wednesday', val: 3 },
                              { label: 'Thursday', val: 4 },
                              { label: 'Friday', val: 5 },
                              { label: 'Saturday', val: 6 },
                            ].map((day) => {
                              const isChecked = (settings.security?.working_days || []).map(Number).includes(day.val);
                              return (
                                <label key={day.val} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer select-none hover:bg-slate-50 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentDays = settings.security?.working_days || [];
                                      const newDays = e.target.checked
                                        ? [...currentDays, day.val]
                                        : currentDays.filter(d => Number(d) !== day.val);
                                      setSettings({
                                        ...settings,
                                        security: {
                                          ...settings.security,
                                          working_days: newDays
                                        }
                                      });
                                    }}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <span className="text-xs font-bold text-slate-700">{day.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* Placeholder tabs for any others */}
          {!['general', 'about', 'home', 'social', 'notifications', 'security'].includes(activeTab) && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Layout className="text-slate-200" size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-slate-400 font-medium">This module is currently being synced with your storefront.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
