'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-10">
        
        {/* Title */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 uppercase tracking-widest mb-2 shadow">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl font-extrabold text-[#0b255a] font-serif uppercase">
            Contact Sri Vinayaga Crackers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Have questions about product availability or bulk orders? We are here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Contact Cards */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl w-fit">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Store Address</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                123 Fireworks Market Road, Sivakasi, Tamil Nadu - 626123
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl w-fit">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Call / WhatsApp</h3>
              <p className="text-xs text-slate-600 font-mono">
                +91 9876543210<br />+91 9876543211
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
              <p className="text-xs text-slate-600 font-mono">
                info@srivinayagacrackers.com
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-[#0b255a] font-serif mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" /> Send Us an Inquiry
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-200 text-center space-y-2">
                <h3 className="font-bold text-base">Message Sent Successfully!</h3>
                <p className="text-xs text-emerald-700">Thank you for reaching out. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message / Requirements *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry or order requirement..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#0b255a] hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-sm py-3 rounded-xl shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
