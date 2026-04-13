import { motion } from 'framer-motion';
import { FaPhoneAlt as Phone, FaEnvelope as Envelope, FaMapMarkerAlt as MapMarker, FaPaw as PawPrint } from 'react-icons/fa';

export default function ContactUs() {
  const contactInfo = [
    {
      icon: <Phone className="text-xl" />,
      label: 'Phone Number',
      value: '0760589218',
      href: 'tel:0760589218',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: <Envelope className="text-xl" />,
      label: 'Email Address',
      value: 'assankasampath@gmail.com',
      href: 'mailto:assankasampath@gmail.com',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: <MapMarker className="text-xl" />,
      label: 'Our Location',
      value: 'Galle, Sri Lanka',
      href: '#',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container max-w-5xl mx-auto space-y-10">
        
        {/* Header - Streamlined */}
        <section className="text-center space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <PawPrint className="text-[10px]" />
            <span>Get in Touch</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-heading font-bold text-foreground"
          >
            Contact <span className="text-primary italic">PawConnect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base text-muted-foreground max-w-lg mx-auto"
          >
            Have questions about a stray animal or our platform? Reach out directly through the channels below.
          </motion.p>
        </section>

        {/* Contact Grid - Compact */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {contactInfo.map((info, idx) => (
            <motion.a
              key={idx}
              href={info.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group p-6 bg-card border rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
                {info.icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{info.label}</p>
                <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{info.value}</p>
              </div>
            </motion.a>
          ))}
        </section>

        {/* Footer info - Condensed */}
        <section className="pt-6">
           <div className="p-6 bg-muted/30 border border-dashed rounded-[1.5rem] text-center max-w-xl mx-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your feedback helps us save more lives. 
                Whether you're a rescuer, an adopter, or just someone who loves animals, we're here to support you in Galle.
              </p>
           </div>
        </section>

      </div>
    </div>
  );
}
