import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { CATALOG } from '../constants';

interface ProductCatalogProps {
  items: any[];
  onSelect: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ items, onSelect }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[10px]">
        {items.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(s)}
            className="group bg-surface border border-border-2 rounded-[18px] overflow-hidden cursor-pointer transition-all hover:border-accent hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(16,185,129,0.15)]"
          >
            <div 
              className="h-[72px] flex items-center justify-center text-[24px] relative overflow-hidden"
              style={{ background: s.bg || 'var(--color-surface-3)' }}
            >
              {s.image ? (
                <img 
                  src={s.image} 
                  alt={s.title} 
                  className="w-full h-full object-cover absolute inset-0" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative z-1 text-[26px]">{s.emoji || '🔧'}</div>
              )}
            </div>
            <div className="p-[10px_12px_13px]">
              <div className="text-[12px] font-semibold mb-[3px] leading-[1.3]">{s.title}</div>
              <div className="text-[11px] text-text-secondary leading-[1.45] mb-[7px]">{s.description}</div>
              <div className="text-[11px] text-accent font-mono mb-[9px] font-medium">{s.price}</div>
              <button className="w-full p-[6px_8px] rounded-[8px] border border-accent/30 bg-accent-dim text-accent text-[11px] font-semibold transition-all group-hover:bg-accent group-hover:text-[#051a12] group-hover:border-accent">
                Select →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
