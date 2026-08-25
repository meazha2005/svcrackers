'use client';

import { useState, useEffect } from 'react';
import { Store, Send, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setStoreName(s.store_name || 'SRI VINAYAGA CRACKERS');
          setStoreAddress(s.store_address || '');
          setStorePhone(s.store_phone || '');
          setStoreEmail(s.store_email || '');
          setBotToken(s.telegram_bot_token || '');
          setChatId(s.telegram_chat_id || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: {
            store_name: storeName.trim(),
            store_address: storeAddress.trim(),
            store_phone: storePhone.trim(),
            store_email: storeEmail.trim(),
            telegram_bot_token: botToken.trim(),
            telegram_chat_id: chatId.trim()
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Store settings updated successfully!', type: 'success' });
      } else {
        setMsg({ text: data.message || 'Failed to save settings', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error saving settings', type: 'error' });
    } finally {
      setSavingStore(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!botToken || !chatId) {
      alert('Please fill in both Telegram Bot Token and Chat ID first.');
      return;
    }

    setTestingTelegram(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_token: botToken.trim(), chat_id: chatId.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Telegram test message sent! Check your Telegram channel/chat.', type: 'success' });
      } else {
        setMsg({ text: data.message || 'Telegram test failed.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error testing Telegram', type: 'error' });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;
    if (newPass !== confirmPass) {
      setMsg({ text: 'New passwords do not match!', type: 'error' });
      return;
    }

    setSavingPass(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          current_password: currentPass,
          new_password: newPass
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setMsg({ text: data.message || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error updating password', type: 'error' });
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0b255a] font-serif">System Settings</h1>
        <p className="text-xs text-slate-500">Configure store info, Telegram notifications, and security credentials</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Store Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#0b255a] font-serif flex items-center gap-2 border-b pb-3">
            <Store className="w-5 h-5 text-amber-500" /> Store Information
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Address</label>
              <textarea
                rows={3}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Phone</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingStore}
              className="bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Store Info
            </button>
          </form>
        </div>

        {/* Telegram Notifications */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#0b255a] font-serif flex items-center gap-2 border-b pb-3">
            <Send className="w-5 h-5 text-blue-500" /> Telegram Order Alerts
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                placeholder="1234567890:ABCdefGHIjkl..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl outline-none"
              />
              <span className="text-[10px] text-slate-400">Created via @BotFather on Telegram</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat / Channel ID</label>
              <input
                type="text"
                placeholder="-100123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl outline-none"
              />
              <span className="text-[10px] text-slate-400">Channel ID or Group ID for receiving order alerts</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={savingStore}
                className="bg-[#0b255a] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-slate-900"
              >
                Save Telegram Config
              </button>

              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-100 flex items-center gap-1.5"
              >
                {testingTelegram ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Test Telegram
              </button>
            </div>
          </form>
        </div>

        {/* Change Admin Password */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-base font-bold text-[#0b255a] font-serif flex items-center gap-2 border-b pb-3">
            <Lock className="w-5 h-5 text-red-500" /> Change Security Password
          </h2>

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingPass}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                {savingPass ? 'Updating...' : 'Update Admin Password'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
