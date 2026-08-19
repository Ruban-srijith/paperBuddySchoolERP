import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F9FD] dark:bg-[#0b0f19]">
      <div className="w-64 h-64 md:w-96 md:h-96">
        <DotLottieReact
          src="/lottie/loader.lottie"
          loop
          autoplay
        />
      </div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xl font-bold text-brand-blue tracking-tight"
      >
        Genesis ERP
      </motion.h2>
    </div>
  );
}
