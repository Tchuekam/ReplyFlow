import React from 'react';
import { motion } from 'motion/react';
import { Layers, User } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 items-start max-w-[740px] mx-auto w-full ${!isAI ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAI ? 'bg-accent-dim border border-accent/25 text-accent' : 'bg-surface-3 border border-border-2 text-text-secondary'}`}>
        {isAI ? <Layers className="w-[13px] h-[13px]" /> : <User className="w-[13px] h-[13px]" />}
      </div>
      
      <div 
        className={`p-[11px_16px] text-[14px] leading-[1.72] max-w-[calc(100%-40px)] relative ${
          isAI 
            ? 'bg-surface-2 border border-border rounded-[4px_16px_16px_16px] text-text-primary' 
            : 'bg-accent text-[#051a12] font-medium rounded-[16px_4px_16px_16px]'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: message.content }} />
        {message.type === 'handoff' && (
          <button 
            onClick={() => window.open('https://wa.me/237600000000', '_blank')}
            className="mt-3 w-full p-2 rounded-lg bg-accent text-[#051a12] font-bold text-xs transition-all hover:opacity-90"
          >
            Open WhatsApp →
          </button>
        )}
      </div>
    </motion.div>
  );
};
