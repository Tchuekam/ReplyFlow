import React from 'react';
import { motion } from 'motion/react';

interface BookingFormProps {
  onSubmit: (data: { name: string; phone: string; need: string }) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit }) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [need, setNeed] = React.useState('');

  const handleSubmit = () => {
    if (name && phone) {
      onSubmit({ name, phone, need });
    }
  };

  return (
    <div className="max-w-[740px] mx-auto w-full pl-[38px] mt-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-2 border border-border-2 rounded-[14px] p-[16px_18px] max-w-[340px]"
      >
        <h4 className="text-[14px] font-semibold mb-[6px]">📅 Book a Free Consultation</h4>
        <p className="text-[12px] text-text-secondary mb-[14px] leading-[1.5]">
          Fill in your details and we'll get back to you within 24 hours.
        </p>
        <div className="flex flex-col gap-2 mb-3">
          <input 
            className="bg-surface border border-border-2 rounded-[8px] p-[9px_13px] text-[13px] text-text-primary outline-none transition-all focus:border-accent/40 w-full placeholder:text-text-muted"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            className="bg-surface border border-border-2 rounded-[8px] p-[9px_13px] text-[13px] text-text-primary outline-none transition-all focus:border-accent/40 w-full placeholder:text-text-muted"
            placeholder="WhatsApp / Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            className="bg-surface border border-border-2 rounded-[8px] p-[9px_13px] text-[13px] text-text-primary outline-none transition-all focus:border-accent/40 w-full placeholder:text-text-muted"
            placeholder="What do you need? (optional)"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSubmit}
          className="w-full p-[9px] rounded-[9px] bg-accent border-none cursor-pointer text-[#051a12] text-[13px] font-semibold transition-all hover:opacity-90 tracking-[0.01em]"
        >
          Confirm Booking →
        </button>
      </motion.div>
    </div>
  );
};
