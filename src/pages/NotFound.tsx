import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaPaw as PawPrint, FaHome as Home } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <PawPrint className="h-9 w-9 text-primary/50" />
        </div>
        <h1 className="text-5xl font-heading font-bold text-foreground mb-3">{t('notFound.title')}</h1>
        <p className="text-base text-muted-foreground mb-8">
          {t('notFound.desc')}
        </p>
        <Link to="/">
          <Button variant="hero" size="lg">
            <Home className="mr-2 h-4 w-4" />
            {t('notFound.backHome')}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
