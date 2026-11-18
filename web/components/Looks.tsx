'use client';
import { motion } from 'framer-motion';
import { Scene } from './Scene';
import { STYLES } from '@/lib/filters';

export default function Looks() {
  return (
    <div className="looks">
      {STYLES.map((s, i) => (
        <motion.figure key={s.id} className="look" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: i * 0.07 }} whileHover={{ y: -8, rotate: i % 2 ? 1.5 : -1.5 }}>
          <div className="look-img" style={{ filter: s.css }}><Scene shift={i} /></div>
          <figcaption>{s.name}</figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
