import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PawPrint, ArrowRight, Heart, ShieldCheck, Clock, Star, Phone, MapPin, Mail } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '#' },
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="bg-lime-700 p-1.5 rounded-xl">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-stone-800">Pets Mart</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l.name} href={l.href} className="text-stone-500 hover:text-lime-700 text-sm font-medium transition-colors">{l.name}</a>
            ))}
            <Link to="/login" className="text-sm font-semibold text-stone-600 hover:text-lime-700 transition-colors">Log in</Link>
            <Link to="/login" className="bg-lime-700 hover:bg-lime-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
              Book Appointment
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-stone-600 p-2">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3 shadow-lg">
            {NAV_LINKS.map(l => (
              <a key={l.name} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-2 text-stone-600 font-medium hover:text-lime-700 transition-colors">{l.name}</a>
            ))}
            <hr className="border-stone-100" />
            <Link to="/login" className="block py-2 text-center bg-stone-100 text-stone-700 rounded-xl font-semibold">Log in</Link>
            <Link to="/login" className="block py-2 text-center bg-lime-700 text-white rounded-xl font-semibold">Book Appointment</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-[#faf9f6] to-lime-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="slide-up">
              <span className="inline-flex items-center gap-2 bg-lime-100 text-lime-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-lime-600 rounded-full animate-pulse" />
                Trusted by 2,000+ Pet Owners
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-stone-900 leading-tight mb-6">
                Caring for Your<br />
                <span className="text-lime-700">Pets, Like Family</span>
              </h1>
              <p className="text-stone-500 text-lg mb-10 max-w-md">
                Expert veterinary care, premium supplies, and seamless appointment booking — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/login')}
                  className="bg-lime-700 hover:bg-lime-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-lime-200 transition-all flex items-center justify-center gap-2 text-base active:scale-95">
                  View Products <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/login')}
                  className="bg-white border-2 border-stone-200 hover:border-lime-400 text-stone-700 font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base">
                  📅 Book Appointment
                </button>
              </div>
              {/* Trust signals */}
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {['🐕', '🐈', '🐇', '🦜'].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-base">{e}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill="#ca8a04" className="text-yellow-600" />)}
                    <span className="font-bold text-stone-800 text-sm ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">from 500+ reviews</p>
                </div>
              </div>
            </div>

            {/* Hero image grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 fade-in">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden h-56 bg-stone-200 flex items-center justify-center text-6xl shadow-md">🐕</div>
                <div className="rounded-3xl overflow-hidden h-40 bg-amber-100 flex items-center justify-center text-5xl shadow-md">🐇</div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-3xl overflow-hidden h-40 bg-lime-100 flex items-center justify-center text-5xl shadow-md">🐈</div>
                <div className="rounded-3xl overflow-hidden h-56 bg-sky-100 flex items-center justify-center text-6xl shadow-md">🦜</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">Why Choose Pets Mart?</h2>
            <p className="text-stone-400 max-w-xl mx-auto">A complete ecosystem for every aspect of your pet's health and happiness.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Heart size={28} className="text-rose-500" />, bg: 'bg-rose-50', title: 'Expert Vet Care', desc: 'Experienced doctors provide compassionate, state-of-the-art medical care for all breeds and species.' },
              { icon: <ShieldCheck size={28} className="text-lime-600" />, bg: 'bg-lime-50', title: 'Premium Products', desc: 'Curated selection of top-tier food, toys, and accessories designed specifically for your pet.' },
              { icon: <Clock size={28} className="text-sky-600" />, bg: 'bg-sky-50', title: 'Easy Scheduling', desc: "Book appointments online in seconds. Manage your pet's health history all in one place." },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-stone-100 rounded-3xl p-8 hover:shadow-xl transition-shadow group card-hover">
                <div className={`${s.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>{s.icon}</div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">{s.title}</h3>
                <p className="text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-lime-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[['2,000+', 'Happy Pets'], ['15+', 'Expert Doctors'], ['10+', 'Years Experience'], ['4.9★', 'Average Rating']].map(([val, label], i) => (
              <div key={i}>
                <div className="text-4xl font-extrabold mb-1">{val}</div>
                <div className="text-lime-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-4xl font-bold text-stone-800 mb-4">Ready to Give Your Pet the Best?</h2>
          <p className="text-stone-400 mb-10 max-w-xl mx-auto">Join thousands of happy pet owners who trust Pets Mart for all their needs.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="bg-lime-700 hover:bg-lime-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg text-base">
              Create Free Account →
            </Link>
            <Link to="/login" className="bg-white border-2 border-stone-200 hover:border-lime-400 text-stone-700 font-bold px-8 py-4 rounded-2xl transition-all text-base">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-lime-700 p-1.5 rounded-xl"><PawPrint size={16} className="text-white" /></div>
                <span className="text-white font-bold text-lg">Pets Mart</span>
              </div>
              <p className="text-sm leading-relaxed">Your trusted partner for premium pet care and supplies.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone size={14}/> +1 (555) 123-4567</div>
                <div className="flex items-center gap-2"><Mail size={14}/> hello@petsmart.com</div>
                <div className="flex items-center gap-2"><MapPin size={14}/> 123 Pet Street, NY 10001</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/login" className="block hover:text-lime-400 transition-colors">Login</Link>
                <Link to="/signup" className="block hover:text-lime-400 transition-colors">Sign Up</Link>
                <a href="#services" className="block hover:text-lime-400 transition-colors">Services</a>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 text-center text-xs">
            &copy; {new Date().getFullYear()} Pets Mart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
