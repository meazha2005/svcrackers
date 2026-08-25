import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 pb-24 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border border-amber-400">
                <Image src="/logo.png" alt="Sri Vinayaga Crackers" fill sizes="40px" className="object-contain" />
              </div>
              <span className="text-lg font-extrabold text-amber-400 tracking-wide font-serif">
                SRI VINAYAGA CRACKERS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium quality fireworks & crackers delivered directly from Sivakasi factory. Safe, certified, and 100% genuine products at wholesale price.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Safety Certified Green Crackers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-amber-400 font-bold text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Price List & Order</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div className="space-y-3">
            <h3 className="text-amber-400 font-bold text-sm tracking-wider uppercase">Safety Instructions</h3>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
              <li>Always burst crackers in open outdoor spaces.</li>
              <li>Keep a bucket of water & sand nearby.</li>
              <li>Wear cotton clothes while lighting fireworks.</li>
              <li>Supervise children closely at all times.</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-amber-400 font-bold text-sm tracking-wider uppercase">Contact Information</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>D/No :229. Subramaniyapuram (Near Ruby Sparklers), Sivakasi- Taluk, Virudhunagar- Dist. Tamilnadu- 626128.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 7780967465 / +91 9566383227</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>srivinayagacrackers26@gmail.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SRI VINAYAGA CRACKERS. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
