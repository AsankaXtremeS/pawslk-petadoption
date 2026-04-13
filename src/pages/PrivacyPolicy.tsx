import { motion } from 'framer-motion';
import { FaShieldAlt as Shield, FaUserCircle as User, FaCamera as Camera, FaLock as Lock } from 'react-icons/fa';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <User className="text-xl" />,
      title: 'Information We Collect',
      content: 'When you register or report a stray, we collect basic identification such as your full name and mobile number. This is necessary to facilitate contact between rescuers and prospective adopters.'
    },
    {
      icon: <Camera className="text-xl" />,
      title: 'Photos & Media',
      content: 'Any photos of animals you upload are used solely for the purpose of identification and promotion on our platform. By uploading, you grant PawConnect the right to display these images to help rescuers find animals.'
    },
    {
      icon: <Lock className="text-xl" />,
      title: 'Data Security',
      content: 'Your privacy is paramount. We implement standard security measures to protect your personal data from unauthorized access. We do not sell or trade your personal information to third parties.'
    },
    {
      icon: <Shield className="text-xl" />,
      title: 'User Control',
      content: 'You have full control over your data. You can update your profile information or delete your account and all associated listings permanently at any time through your profile settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="container max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <section className="space-y-4 text-center border-b pb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-2">
            <Shield className="text-3xl" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold text-foreground"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-muted-foreground">Effective Date: April 13, 2024</p>
        </section>

        {/* Content */}
        <div className="space-y-12">
          <section className="prose prose-slate max-w-none">
            <p className="text-lg text-foreground/80 leading-relaxed italic">
              At PawConnect, we are committed to protecting the privacy of our users while providing a platform that helps save stray animals. This policy explains how we handle your data.
            </p>
          </section>

          <div className="grid gap-8">
            {sections.map((section, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 p-6 rounded-3xl bg-card border shadow-sm"
              >
                <div className="hidden sm:flex w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center shrink-0 text-primary">
                  {section.icon}
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-bold font-heading">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.section>
            ))}
          </div>

          <section className="bg-muted/30 p-8 rounded-3xl space-y-4">
            <h2 className="text-2xl font-bold font-heading">Contact for Privacy Concerns</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or how your data is handled, please contact our administrator:
            </p>
            <div className="font-bold text-foreground">
              <p>Asanka Sampath</p>
              <p>assankasampath@gmail.com</p>
              <p>Galle, Sri Lanka</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
