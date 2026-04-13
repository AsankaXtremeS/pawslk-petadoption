import { motion } from 'framer-motion';
import { FaPaw as PawPrint, FaHeart as Heart, FaShieldAlt as Shield, FaGlobeAsia as Globe } from 'react-icons/fa';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="container max-w-4xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto"
          >
            <PawPrint className="text-4xl text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground"
          >
            About <span className="text-primary italic">PawConnect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            We are dedicated to giving every stray animal in Sri Lanka a second chance at life through community-driven reporting and transparent adoption.
          </motion.p>
        </section>

        {/* Mission Cards */}
        <section className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-card border rounded-3xl shadow-sm space-y-4"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Heart className="text-xl" />
            </div>
            <h3 className="text-2xl font-bold font-heading">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To create a world where no animal is left behind. By connecting compassionate rescuers with loving families, we bridge the gap between abandoned strays and forever homes.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-card border rounded-3xl shadow-sm space-y-4"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
              <Shield className="text-xl" />
            </div>
            <h3 className="text-2xl font-bold font-heading">Our Commitment</h3>
            <p className="text-muted-foreground leading-relaxed">
              Safety and transparency are at our core. We ensure that every animal reported has a trace, and every adoption process is handled with the utmost care for the pet's well-being.
            </p>
          </motion.div>
        </section>

        {/* The Sri Lankan Context */}
        <section className="p-8 md:p-12 bg-muted/30 rounded-[2.5rem] border border-border/50 relative overflow-hidden group">
          <Globe className="absolute -bottom-10 -right-10 text-9xl text-primary/5 group-hover:rotate-12 transition-transform duration-700" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-heading font-bold text-foreground">Why PawConnect?</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                In Sri Lanka, thousands of stray animals face harsh conditions on the streets every day. Traditional rescue methods are often limited by resources and geographic reach.
              </p>
              <p>
                PawConnect leverages technology to empower citizens. By simply taking a photo and adding a location, anyone can start the rescue journey for a stray in need. Our platform centralizes these efforts, making it easier for rescuers to find animals and for prospective owners to discover their new best friends.
              </p>
            </div>
          </div>
        </section>

        {/* Developer Credit */}
        <section className="text-center pt-8 border-t">
          <p className="text-muted-foreground italic">
            Developed and maintained with ❤️ by Asanka Sampath in Galle, Sri Lanka.
          </p>
        </section>

      </div>
    </div>
  );
}
