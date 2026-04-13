import { motion } from 'framer-motion';
import { FaPhoneAlt as Phone, FaEnvelope as Envelope, FaMapMarkerAlt as MapMarker, FaPaw as PawPrint } from 'react-icons/fa';

export default function ContactUs() {
  const contactInfo = [
    {
      icon: <Phone className="text-2xl" />,
      label: 'Phone Number',
      value: '0760589218',
      href: 'tel:0760589218',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: <Envelope className="text-2xl" />,
      label: 'Email Address',
      value: 'assankasampath@gmail.com',
      href: 'mailto:assankasampath@gmail.com',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: <MapMarker className="text-2xl" />,
      label: 'Our Location',
      value: 'Galle, Sri Lanka',
      href: '#',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="container max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4"
          >
            <PawPrint className="text-xs" />
            <span>Get in Touch</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold text-foreground"
          >
            Contact <span className="text-primary italic">PawConnect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Have questions about a stray animal or our platform? Reach out directly through the channels below.
          </motion.p>
        </section>

        {/* Contact Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactInfo.map((info, idx) => (
            <motion.a
              key={idx}
              href={info.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-card border rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-6"
            >
              <div className={`w-16 h-16 ${info.color} rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12`}>
                {info.icon}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{info.label}</p>
                <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{info.value}</p>
              </div>
            </motion.a>
          ))}
        </section>

        {/* Footer info */}
        <section className="pt-12">
           <div className="p-8 bg-muted/30 border border-dashed rounded-[2rem] text-center max-w-2xl mx-auto">
              <p className="text-muted-foreground leading-relaxed">
                As a community-driven platform, your feedback helps us save more lives. 
                Whether you're a rescuer, an adopter, or just someone who loves animals, we're here to support you.
              </p>
           </div>
        </section>

      </div>
    </div>
  );
}
