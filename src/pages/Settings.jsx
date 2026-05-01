import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Globe, Smartphone, Mail, MapPin, Palette, Layout, Bell, Shield } from 'lucide-react';
import { clsx } from 'clsx';

const Settings = () => {
  const { selectedStore } = useStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'content', label: 'Page Content', icon: Layout },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Settings</h1>
        <p className="text-slate-500 font-medium">Manage your {selectedStore} store configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
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

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Store Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}
                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Store Email</label>
                  <input 
                    type="email" 
                    defaultValue={`hello@${selectedStore}.com`}
                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Support Phone</label>
                  <input 
                    type="text" 
                    defaultValue="+880 1712 345678"
                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Currency Symbol</label>
                  <input 
                    type="text" 
                    defaultValue="৳"
                    className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Store Address</label>
                <textarea 
                  rows={3}
                  defaultValue="123 Artisanal Way, Foodie District, Dhaka 1212"
                  className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-800 resize-none"
                />
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Layout className="text-slate-200" size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800">{tabs.find(t => t.id === activeTab).label} coming soon</h3>
              <p className="text-slate-400 font-medium">This module is currently being optimized for the next phase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
