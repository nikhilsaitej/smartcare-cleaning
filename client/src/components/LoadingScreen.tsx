import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-4 mb-12">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden"
          >
            <img src={logo} alt="SmartCare Logo" className="h-full w-full object-cover" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight leading-none">
              SmartCare
            </span>
            <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
              Cleaning Solutions
            </span>
          </div>
        </div>

        <div className="w-72 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
            }}
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
