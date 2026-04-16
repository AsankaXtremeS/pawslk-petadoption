import { motion } from 'framer-motion';
import { FaPaw as PawPrint, FaHeart as Heart, FaShieldAlt as Shield, FaGlobeAsia as Globe } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container max-w-5xl mx-auto space-y-10">
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://pawconnect.lk/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "About PawConnect",
                  "item": "https://pawconnect.lk/about"
                }
              ]
            })
          }}
        />

        {/* Compact Hero Section */}
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto"
          >
            <PawPrint className="text-3xl text-primary" />
          </motion.div>
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground"
            >
              About <span className="text-primary italic">PawConnect</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              PawConnect (pawconnect.lk) is Sri Lanka's leading community-driven platform
              for pet adoption, stray animal rescue, and rehoming — giving every stray 
              a second chance through transparent reporting and compassionate adoption.
            </motion.p>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Mission & Commitment */}
          <div className="space-y-6">
            <motion.div 
              whileHover={{ x: 5 }}
              className="p-6 bg-card border rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Heart className="text-lg" />
                </div>
                <h3 className="text-xl font-bold font-heading">Our Mission</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To create a world where no animal is left behind. PawConnect bridges the gap 
                between abandoned strays and forever homes across Sri Lanka — from Colombo to 
                Galle, Kandy to Jaffna. Paw Connect makes rescue accessible to everyone.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="p-6 bg-card border rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                  <Shield className="text-lg" />
                </div>
                <h3 className="text-xl font-bold font-heading">Our Commitment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Safety and transparency are at the core of PawConnect pet services. 
                We ensure every report has a trace and every adoption is handled with care. 
                Available in English, Sinhala, and Tamil on pawconnect.lk.
              </p>
            </motion.div>
          </div>

          {/* Context Section */}
          <section className="p-8 bg-muted/30 rounded-[2rem] border border-border/50 relative overflow-hidden group h-full">
            <Globe className="absolute -bottom-6 -right-6 text-7xl text-primary/5 group-hover:rotate-12 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-heading font-bold text-foreground">Why PawConnect?</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  In Sri Lanka, thousands of stray animals face harsh street conditions. Traditional rescue methods are often limited by resources.
                </p>
                <p>
                  PawConnect empowers citizens. By taking a photo and adding a location, anyone can start a rescue journey. We centralize these efforts to make findings and adoptions easier for everyone.
                </p>
                <p>
                  Whether you search for "PawConnect", "Paw Connect", or visit pawconnect.lk directly — 
                  you'll find a platform built with love for Sri Lanka's animals. PawConnect LK is your 
                  go-to pet platform for adoption and rescue.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Internal Links */}
        <section className="grid sm:grid-cols-3 gap-4">
          <Link to="/animals" className="p-5 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">Browse Animals</h3>
            <p className="text-xs text-muted-foreground">Find dogs & cats for adoption</p>
          </Link>
          <Link to="/dashboard" className="p-5 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">Impact Dashboard</h3>
            <p className="text-xs text-muted-foreground">See our community's impact</p>
          </Link>
          <Link to="/contact" className="p-5 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all group text-center">
            <h3 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">Contact PawConnect</h3>
            <p className="text-xs text-muted-foreground">Get in touch with our team</p>
          </Link>
        </section>

        {/* Developer Credit - Compact */}
        <section className="text-center pt-6 border-t">
          <p className="text-sm text-muted-foreground italic">
            Developed and maintained with ❤️ by Asanka Sampath in Galle, Sri Lanka.
          </p>
        </section>

      </div>
    </div>
  );
}
