import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ShieldCheck, Award, Truck, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-10">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0b255a] via-[#103073] to-[#0b255a] text-white rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-amber-400 text-center space-y-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white p-1 border-2 border-amber-400 mx-auto shadow-md">
            <Image src="/logo.png" alt="Sri Vinayaga Crackers" fill sizes="80px" className="object-contain" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif uppercase tracking-tight text-amber-400">
            SRI VINAYAGA CRACKERS
          </h1>
          <p className="text-slate-200 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Your trusted source for 100% genuine Sivakasi fireworks and crackers at factory direct wholesale prices.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-[#0b255a] font-serif">Welcome to Sri Vinayaga Crackers</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Established in Sivakasi, the fireworks capital of India, <strong>Sri Vinayaga Crackers</strong> has been lighting up celebrations across the country for years with premium quality fireworks.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We specialize in offering direct factory price estimates without any middleman markup. Our catalog includes single & multi-sound crackers, sparklers, ground chakkars, flower pots, rockets, and spectacular fancy aerial shots.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-2">
              <Award className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">100% Quality</h3>
              <p className="text-xs text-slate-600">Fresh stock tested for maximum safety & sound.</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Green Crackers</h3>
              <p className="text-xs text-slate-600">Certified eco-friendly low emission fireworks.</p>
            </div>

            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Best Discounts</h3>
              <p className="text-xs text-slate-600">Up to 80% discount on MRP rates!</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 text-center space-y-2">
              <Truck className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Safe Shipping</h3>
              <p className="text-xs text-slate-600">Secure transport & packing guarantees.</p>
            </div>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-md">
          <h2 className="text-xl font-bold text-[#0b255a] font-serif mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" /> Fireworks Safety Guidelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Always ignite fireworks outdoors in an open area away from dry grass and buildings.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Keep a bucket of water or sand nearby for emergency extinguishing.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Wear loose cotton garments while bursting fireworks; avoid synthetic fabrics.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Never try to re-ignite a dud or unexploded cracker. Wait 15 minutes before soaking in water.</span>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
