import { motion } from 'framer-motion';
import { FaShieldAlt as Shield, FaUserCircle as User, FaCamera as Camera, FaLock as Lock } from 'react-icons/fa';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <User className="text-lg" />,
      title: 'Information We Collect',
      content: 'We collect your name and mobile number to facilitate contact between rescuers and adopters.'
    },
    {
      icon: <Camera className="text-lg" />,
      title: 'Photos & Media',
      content: 'Animal photos you upload are used solely for identification and promotion on our platform.'
    },
    {
      icon: <Lock className="text-lg" />,
      title: 'Data Security',
      content: 'We implement standard measures to protect your data. We do not sell your info to third parties.'
    },
    {
      icon: <Shield className="text-lg" />,
      title: 'User Control',
      content: 'You can update your profile or delete your account and posts anytime you want through your settings.'
    },
    {
      icon: <Lock className="text-lg" />,
      title: 'Public Visibility',
      content: 'Adding your phone number is entirely voluntary. By providing it, you acknowledge that it will be publicly displayed on your animal listings to help potential adopters contact you directly.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        
        {/* Header - Compact */}
        <section className="space-y-2 text-center border-b pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary mb-1">
            <Shield className="text-2xl" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-heading font-bold text-foreground"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Effective: April 13, 2024</p>
        </section>

        {/* Content */}
        <div className="space-y-8">
          <section className="text-center max-w-2xl mx-auto">
            <p className="text-base text-muted-foreground leading-relaxed italic">
              At PawConnect, we are committed to protecting your privacy while helping save stray animals.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4 p-5 rounded-2xl bg-card border shadow-sm items-start"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 text-primary">
                  {section.icon}
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold font-heading">{section.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.section>
            ))}
          </div>

          <section className="bg-muted/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 border border-dashed">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-lg font-bold font-heading">Privacy Contact</h2>
              <p className="text-sm text-muted-foreground">For any data concerns, reach out to our admin.</p>
            </div>
            <div className="text-sm font-bold text-foreground text-center md:text-right">
              <p>Asanka Sampath</p>
              <p className="text-primary">assankasampath@gmail.com</p>
              <p className="text-muted-foreground font-normal">Galle, Sri Lanka</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
