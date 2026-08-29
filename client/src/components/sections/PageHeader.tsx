import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumb?: string;
  icon?: ReactNode;
  backgroundGradient?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  breadcrumb, 
  icon,
  backgroundGradient = "from-blue-600 to-blue-700"
}: PageHeaderProps) {
  return (
    <div className={`relative py-20 bg-gradient-to-r ${backgroundGradient} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {breadcrumb && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blue-100 text-sm font-semibold mb-4 uppercase tracking-wider"
          >
            {breadcrumb}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="flex items-start gap-4 mb-6">
            {icon && (
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
                {title}
              </h1>
            </div>
          </div>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
