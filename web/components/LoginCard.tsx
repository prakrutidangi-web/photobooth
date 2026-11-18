'use client';
import { motion } from 'framer-motion';
export default function LoginCard({ children }: { children: React.ReactNode }) {
  return <motion.div className="login-card" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 110, damping: 16 }}>{children}</motion.div>;
}
