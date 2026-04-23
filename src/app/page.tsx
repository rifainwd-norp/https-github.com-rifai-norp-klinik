"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  User, 
  ChevronRight, 
  UserCircle, 
  Menu, 
  X,
  Mail,
  Lock,
  Fingerprint,
  Globe,
  Loader2,
  Clock,
  Phone,
  Camera,
  Link as LinkIcon,
  Sparkles as StarIcon
} from "lucide-react";
import { useRef, useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginState, setIsLoginState] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">
      {/* Dynamic Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 py-4 px-6 md:px-12"
      >
        <div className="max-w-screen-2xl mx-auto glass-panel rounded-3xl px-8 py-4 flex justify-between items-center shadow-premium">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white"
            >
              <Sparkles size={20} />
            </motion.div>
            <span className="text-2xl font-bold tracking-tighter text-primary">SERENE</span>
          </Link>
          
          <div className="hidden md:flex gap-12 items-center">
            {["Treatments", "About", "Gallery", "Locations"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-all uppercase tracking-[0.2em]"
              >
                {item}
              </Link>
            ))}
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-all uppercase tracking-[0.2em]"
            >
              Portal
            </button>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/booking" 
              className="hidden sm:flex bg-primary text-white px-8 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
            >
              Book Now
            </Link>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="hidden sm:flex text-primary hover:opacity-70 transition-all active:scale-95"
            >
              <UserCircle size={28} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-primary p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-2xl font-bold tracking-tighter text-primary">SERENE</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary p-2">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {["Treatments", "About", "Gallery", "Locations"].map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-serif text-on-surface hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
                className="text-left text-4xl font-serif text-on-surface hover:text-primary transition-colors"
              >
                Portal Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-primary uppercase">Portal</span>
                  </div>
                  <button onClick={() => setIsLoginOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-10">
                  <h2 className="font-serif text-3xl text-on-surface mb-2">
                    {isLoginState ? "Welcome Back" : "New Patient"}
                  </h2>
                  <p className="text-on-surface-variant text-sm font-medium">
                    {isLoginState ? "Sign in to your clinical dashboard." : "Create your private skin journey profile."}
                  </p>
                </div>

                <form 
                  className="space-y-5" 
                  onSubmit={async (e) => { 
                    e.preventDefault();
                    setIsAuthenticating(true);
                    await new Promise(r => setTimeout(r, 1500));
                    setIsAuthenticating(false);
                    window.location.href = isLoginState ? '/dashboard' : '/patient';
                  }}
                >
                  {!isLoginState && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Eleanor Rigby" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl border border-outline-variant bg-background/50 outline-none focus:border-primary transition-all" 
                      />
                    </motion.div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={16} />
                      <input 
                        type="email" 
                        placeholder="name@example.com" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border border-outline-variant bg-background/50 outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" size={16} />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border border-outline-variant bg-background/50 outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      isLoginState ? "Sign In" : "Get Started"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-xs font-medium text-on-surface-variant">
                    {isLoginState ? "Don't have an account?" : "Already a patient?"} {" "}
                    <button 
                      onClick={() => setIsLoginState(!isLoginState)}
                      className="text-primary font-bold hover:underline"
                    >
                      {isLoginState ? "Join Serene" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 p-6 flex gap-3">
                 <button className="flex-1 bg-white border border-outline-variant py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest">
                    <Globe size={14} /> Google
                 </button>
                 <button className="flex-1 bg-white border border-outline-variant py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest">
                    <Fingerprint size={14} /> Biometric
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main>
        {/* Parallax Hero */}
        <section ref={heroRef} className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden px-6">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="/images/hero.png"
              alt="Hero"
              fill
              className="object-cover scale-110 opacity-40"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
          </motion.div>
          
          <div className="container max-w-7xl mx-auto relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-12 backdrop-blur-md border border-primary/10"
              >
                <Sparkles size={16} />
                Clinical Precision, Spa Serenity
              </motion.div>
              
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="font-serif text-6xl md:text-8xl lg:text-[10rem] mb-12 text-on-surface leading-[0.85] tracking-tighter"
                >
                  Refined<br />
                  <span className="text-gradient">Aesthetics.</span>
                </motion.h1>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-xl md:text-2xl text-on-surface-variant mb-16 max-w-xl leading-relaxed font-medium"
              >
                Where clinical science meets absolute peace. Experience the new gold standard of restorative medicine.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Link href="/booking" className="group bg-primary text-white px-12 py-6 rounded-[32px] font-bold text-xl hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-4">
                  Start Your Journey
                  <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="#treatments" className="border-2 border-outline text-on-surface px-12 py-6 rounded-[32px] font-bold text-xl hover:bg-surface-variant transition-all active:scale-95 text-center">
                  Our Treatments
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Treatment Bento */}
        <section id="treatments" className="py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
              <div className="max-w-3xl">
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="font-serif text-5xl md:text-8xl text-on-surface leading-[0.9] tracking-tighter"
                >
                  Curated for your <span className="italic text-primary-light">radiance.</span>
                </motion.h2>
              </div>
              <Link href="/booking" className="text-sm font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-2 hover:opacity-70 transition-opacity">
                Full Menu
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <TreatmentCard 
                span="md:col-span-8"
                label="Rejuvenate"
                title="Signature Facials"
                desc="A multi-modal approach to skin health, combining clinical efficacy with the ritual of relaxation."
                img="/images/facials.png"
                horizontal
              />
              <TreatmentCard 
                span="md:col-span-4"
                label="Resurface"
                title="Precision Laser"
                desc="Targeted light therapy for pigmentation and texture correction."
                img="/images/laser.png"
              />
              <TreatmentCard 
                span="md:col-span-4"
                label="Refine"
                title="Injectables"
                desc="Subtle, expert enhancements to restore youthful contours."
                img="/images/hero.png"
              />
              <TreatmentCard 
                span="md:col-span-8"
                label="Nurture"
                title="Body Sculpting"
                desc="Advanced non-invasive technologies for silhouette refinement."
                img="/images/facials.png"
                horizontal
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-40 px-6 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[64px] overflow-hidden shadow-2xl"
             >
               <Image src="/images/hero.png" alt="Clinical Excellence" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
               <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
               <div className="absolute bottom-10 left-10 glass-panel p-8 rounded-3xl max-w-xs">
                  <StarIcon className="text-primary mb-4" fill="currentColor" />
                  <p className="font-bold text-on-surface leading-tight">Board-Certified Excellence in every procedure.</p>
               </div>
             </motion.div>
             
             <div className="space-y-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6 block">Our Philosophy</span>
                  <h2 className="font-serif text-5xl md:text-7xl text-on-surface leading-[1.1] mb-8">Science meets <span className="italic text-primary-light">serenity.</span></h2>
                  <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-xl">
                    Founded on the belief that aesthetic results should be as natural as they are transformative. We combine state-of-the-art medical technology with the tranquil environment of a high-end spa.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <AboutItem title="Clinical Precision" desc="Every treatment is backed by rigorous medical standards and elite training." />
                   <AboutItem title="Natural Results" desc="We focus on enhancing your unique features, never over-treating." />
                </div>

                <Link href="/booking" className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary group">
                   Meet Our Team <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
             </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-40 px-6">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-24">
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6 block">Visual Journey</span>
                <h2 className="font-serif text-5xl md:text-7xl text-on-surface">Clinical Outcomes.</h2>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 0.98 }}
                    className={`relative rounded-3xl overflow-hidden bg-surface-variant ${i % 3 === 0 ? 'aspect-[4/5] md:col-span-2' : 'aspect-square'}`}
                  >
                    <Image 
                      src={i % 2 === 0 ? "/images/facials.png" : "/images/laser.png"} 
                      alt={`Gallery ${i}`} 
                      fill 
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* Global Stats */}
        <section className="py-40 border-y border-outline-variant/30">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-20">
             <StatItem value="15k+" label="Procedures" />
             <StatItem value="98%" label="Satisfaction" />
             <StatItem value="12" label="Specialists" />
             <StatItem value="4.9" label="Rating" />
          </div>
        </section>

        {/* Location Section */}
        <section id="locations" className="py-40 px-6 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12">
                <div>
                   <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary-container mb-6 block">Visit Us</span>
                   <h2 className="font-serif text-5xl md:text-8xl leading-tight mb-8">Beverly Hills<br /><span className="italic opacity-60">Flagship.</span></h2>
                   <p className="text-xl text-primary-container/80 font-medium max-w-md leading-relaxed">
                     Experience serenity in the heart of the Golden Triangle. Valet parking available for all patients.
                   </p>
                </div>

                <div className="space-y-8">
                   <LocationDetail icon={<MapPin />} title="Address" desc="455 North Canon Drive, Beverly Hills, CA 90210" />
                   <LocationDetail icon={<Phone />} title="Concierge" desc="+1 (310) 555-0192" />
                   <LocationDetail icon={<Clock />} title="Clinical Hours" desc="Mon-Sat: 9AM - 7PM • Sun: Closed" />
                </div>
             </div>

             <div className="relative aspect-video lg:aspect-square bg-white/5 rounded-[64px] border border-white/10 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                         <MapPin size={32} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-60">Interactive Map Loading...</p>
                   </div>
                </div>
                {/* Decorative UI elements for "Map" feel */}
                <div className="absolute top-10 left-10 w-32 h-1 bg-white/20 rounded-full" />
                <div className="absolute top-16 left-10 w-24 h-1 bg-white/10 rounded-full" />
             </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="py-40 bg-white px-6 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-primary mb-12 flex items-center gap-3">
               <Sparkles className="fill-primary" /> SERENE
            </h2>
            <p className="text-2xl text-on-surface-variant font-medium max-w-sm leading-relaxed mb-16">
              Redefining aesthetic medicine through the lens of absolute serenity.
            </p>
            <div className="flex gap-8">
               <SocialIcon icon={<Camera />} />
               <SocialIcon icon={<LinkIcon />} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <FooterCol title="Services" links={["Injectables", "Skin Health", "Laser", "Body"]} />
            <FooterCol title="Clinic" links={["About Us", "Team", "Contact", "Privacy"]} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-40 pt-10 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">© 2024 Serene Aesthetics Clinic. Medical Excellence.</p>
           <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-primary">
              <button onClick={() => setIsLoginOpen(true)}>Practitioner Portal</button>
              <Link href="/dashboard">Staff Login</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function TreatmentCard({ span, label, title, desc, img, horizontal = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`${span} group relative overflow-hidden rounded-[48px] bg-white border border-outline-variant shadow-premium transition-all duration-700 hover:shadow-hover`}
    >
      <div className={`flex h-full ${horizontal ? "flex-col md:flex-row" : "flex-col"}`}>
        <div className={`relative ${horizontal ? "md:w-1/2 h-80 md:h-full" : "h-80"} overflow-hidden`}>
          <Image 
            src={img} 
            alt={title} 
            fill 
            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out grayscale-[20%] group-hover:grayscale-0" 
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className={`p-14 ${horizontal ? "md:w-1/2" : ""} flex flex-col justify-center`}>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6 block">{label}</span>
          <h3 className="font-serif text-4xl mb-6">{title}</h3>
          <p className="text-on-surface-variant mb-12 leading-relaxed font-medium text-lg">{desc}</p>
          <Link href="/booking" className="mt-auto inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Explore <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ value, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h3 className="font-serif text-5xl md:text-7xl text-primary mb-4">{value}</h3>
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
    </motion.div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className="space-y-8">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">{title}</h4>
      <ul className="space-y-4">
        {links.map(l => <li key={l}><Link href="#" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{l}</Link></li>)}
      </ul>
    </div>
  );
}

function AboutItem({ title, desc }) {
  return (
    <div className="space-y-3">
       <h4 className="font-bold text-on-surface">{title}</h4>
       <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}

function GalleryItem({ img, large = false }) {
  return (
    <motion.div 
      whileHover={{ scale: 0.98 }}
      className={`relative rounded-3xl overflow-hidden bg-surface-variant ${large ? 'md:col-span-2 aspect-[4/5]' : 'aspect-square'}`}
    >
       <Image src={img} alt="Gallery" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" sizes="25vw" />
    </motion.div>
  );
}

function LocationDetail({ icon, title, desc }) {
  return (
    <div className="flex gap-6 items-start">
       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-container shrink-0">
          {icon}
       </div>
       <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1 opacity-60">{title}</h4>
          <p className="text-lg font-medium leading-tight">{desc}</p>
       </div>
    </div>
  );
}

function SocialIcon({ icon }) {
  return (
    <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white hover:border-primary transition-all">
       {icon}
    </button>
  );
}
