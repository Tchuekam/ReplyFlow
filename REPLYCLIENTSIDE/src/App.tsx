import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Layers, Phone, Calendar, ShoppingBag, Printer, Package, Shirt, Video, GraduationCap, User } from 'lucide-react';
import { MessageBubble } from './components/MessageBubble';
import { ProductCatalog } from './components/ProductCatalog';
import { BookingForm } from './components/BookingForm';
import { Message, Product } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! Welcome. What are we building for you today?", id: Date.now().toString() }
  ]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; icon: string; title: string; sub: string }[]>([]);
  
  // Backend context states
  const [businessName, setBusinessName] = useState('Ayo Media');
  const [businessPhone, setBusinessPhone] = useState('');
  const [contextData, setContextData] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [resolvedClient, setResolvedClient] = useState<string | null>(null);
  const [pdfContextParts, setPdfContextParts] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientId = (window as any).ReplyFlowConfig?.clientId || new URLSearchParams(window.location.search).get('client_id');

  // Load contextual DB data
  useEffect(() => {
    async function initData() {
      let activeClientId = clientId;

      let bData = null;
      if (activeClientId) {
        const { data } = await supabase.from('businesses').select('*').eq('id', activeClientId).single();
        bData = data;
      } else {
        // Fallback: pick the latest business created by the user
        const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false }).limit(1).single();
        bData = data;
        if (bData) activeClientId = bData.id;
      }
      
      setResolvedClient(activeClientId || null);

      const bName = bData?.business_name || 'Ayo Media';
      setBusinessName(bName);
      if (bData?.whatsapp || bData?.phone) {
        setBusinessPhone(bData.whatsapp || bData.phone);
      }
      
      setMessages([{ role: 'assistant', content: `Hello! Welcome to ${bName}. How can we assist you today?`, id: Date.now().toString() }]);

      if (activeClientId) {
        const { data: sData } = await supabase.from('services').select('*').eq('client_id', activeClientId);
        const { data: kbData } = await supabase.from('knowledge_base').select('*').eq('client_id', activeClientId);
        
        if (sData) setServices(sData);

        let ctx = `You are a hyper-professional human sales agent representing ${bName}. Do not act like an AI. Act like an elite business consultant. Never reveal that you are an AI. Stick entirely to the facts provided below.\n\nSERVICES:\n`;
        (sData || []).forEach((s: any) => ctx += `- ${s.title}: ${s.description} (Price: ${s.price})\n`);
        ctx += `\nKNOWLEDGE BASE FOR CONTEXT:\n`;
        
        const extractedPdfParts: any[] = [];
        (kbData || []).forEach((k: any) => {
          if (k.content && typeof k.content === 'string' && !k.content.startsWith('data:')) {
            ctx += `- ${k.content}\n`;
          } else if (k.content && k.content.startsWith('data:')) {
             const [header, base64Data] = k.content.split(',');
             const mimeRaw = header.split(';')[0];
             const mimeType = mimeRaw.split(':')[1] || 'application/pdf';
             extractedPdfParts.push({ inlineData: { data: base64Data, mimeType } });
          }
        });
        setContextData(ctx);
        setPdfContextParts(extractedPdfParts);
      }
    }
    initData();
  }, [clientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const addToast = (icon: string, title: string, sub: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, icon, title, sub }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    if (messages.length === 1 && resolvedClient) {
      // First interaction -> Capture generic lead instantly
      supabase.from('leads').insert([{
        id: Date.now().toString(),
        name: 'Anonymous Caller',
        phone: 'Pending',
        service_interest: 'Chat Initiated',
        status: 'Cold',
        source: 'front-door',
        client_id: resolvedClient
      }]).then(({ error }) => { if (error) console.error(error) });
    }

    const userMsg: Message = { role: 'user', content: text, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lowerText = text.toLowerCase();
    if (lowerText.includes('service') || lowerText.includes('catalog') || lowerText.includes('offer') || lowerText.includes('price')) {
      setShowCatalog(true);
    }
    if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('consultation')) {
      setShowBooking(true);
    }
    if (lowerText.includes('human') || lowerText.includes('agent') || lowerText.includes('person')) {
      const handoffMsg: Message = {
        role: 'assistant',
        content: "I'm connecting you to a human agent. They'll be with you shortly on WhatsApp! 🧑‍💼",
        id: (Date.now() + 5).toString(),
        type: 'handoff'
      };
      setMessages(prev => [...prev, handoffMsg]);
      return; 
    }

    const phoneMatch = text.match(/([\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6})/);
    if (phoneMatch && resolvedClient) {
      supabase.from('leads').insert([{
        id: Date.now().toString(),
        name: 'Anonymous Caller',
        phone: phoneMatch[0],
        service_interest: 'Pre-Chat Request',
        status: 'Warm',
        source: 'chat',
        client_id: resolvedClient
      }]).then(({ error }) => { if (error) console.error(error) });
    }

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: resolvedClient,
          message: text,
          history: chatHistory,
          config: { businessName, tagline: 'Bold design. Real results.' } // Basic config as fallback
        })
      });

      if (!response.ok) throw new Error('Proxy infrastructure offline');

      const data = await response.json();
      
      if (data.ui_action === 'show_catalog') setShowCatalog(true);
      if (data.ui_action === 'show_booking') setShowBooking(true);

      const aiMsg: Message = { 
        role: 'assistant', 
        content: (data.response_text || "I'm sorry, I couldn't process that.").replace(/\n/g, '<br>'), 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { 
        role: 'assistant', 
        content: "I'm having a little trouble connecting right now. Please try again in a moment! 😊", 
        id: (Date.now() + 1).toString() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    handleSendMessage(`I'm interested in ${product.title}`);
    setShowCatalog(false);
  };

  const handleBookingSubmit = (data: { name: string; phone: string; need: string }) => {
    addToast('✅', 'Booking confirmed!', `${data.name} · ${data.phone}`);
    
    if (resolvedClient) {
      supabase.from('leads').insert([{
        id: Date.now().toString(),
        name: data.name,
        phone: data.phone,
        service_interest: data.need || 'General Consultation',
        status: 'Hot',
        source: 'booking_form',
        client_id: resolvedClient
      }]).then(({ error }) => { if (error) console.error(error) });
    }

    const userMsg: Message = { 
      role: 'user', 
      content: `📅 Booking request: <strong>${data.name}</strong> — ${data.phone}`, 
      id: Date.now().toString() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    const aiMsg: Message = { 
      role: 'assistant', 
      content: `Great, ${data.name}! 🎉 Your consultation is booked. We'll reach out on <strong>${data.phone}</strong> within 24 hours. Can't wait to work with you!`, 
      id: (Date.now() + 1).toString() 
    };
    setMessages(prev => [...prev, aiMsg]);
    setShowBooking(false);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-bg text-text-primary font-sans">
      <div className="flex flex-col h-full relative z-5">
        <header className="flex items-center justify-between p-[10px_20px] shrink-0 border-b border-border bg-bg/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.3)]">
              <Layers className="w-[15px] h-[15px] text-white" />
            </div>
            <div>
              <div className="text-[14px] font-semibold tracking-tight">{businessName}</div>
              <div className="text-[11px] text-accent flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-status-pulse" />
                <span>Online now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a 
              href={businessPhone ? `https://wa.me/${businessPhone.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 p-[7px_13px] rounded-[9px] border border-border-2 bg-transparent text-text-secondary text-[12px] cursor-pointer transition-all hover:bg-surface-3 hover:text-text-primary no-underline"
            >
              <Phone className="w-[13px] h-[13px]" />
              <span className="hidden sm:inline">Call</span>
            </a>
            <button 
              onClick={() => setShowBooking(true)}
              className="flex items-center gap-1.5 p-[7px_13px] rounded-[9px] border border-border-2 bg-transparent text-text-secondary text-[12px] cursor-pointer transition-all hover:bg-surface-3 hover:text-text-primary"
            >
              <Calendar className="w-[13px] h-[13px]" />
              <span className="hidden sm:inline">Book</span>
            </button>
            <button 
              onClick={() => setShowCatalog(true)}
              className="flex items-center gap-1.5 p-[7px_13px] rounded-[9px] border border-accent bg-accent text-[#051a12] text-[12px] font-semibold cursor-pointer transition-all hover:bg-accent/90 shadow-[0_2px_10px_rgba(16,185,129,0.2)]"
            >
              <ShoppingBag className="w-[13px] h-[13px]" />
              <span className="hidden sm:inline">Catalogue</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-[28px_20px_16px] flex flex-col gap-4 scroll-smooth">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {loading && (
            <div className="flex gap-3 items-start max-w-[740px] mx-auto w-full">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-accent-dim border border-accent/25 text-accent">
                <Layers className="w-[13px] h-[13px]" />
              </div>
              <div className="p-[11px_16px] bg-surface-2 border border-border rounded-[4px_16px_16px_16px]">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1 h-1 rounded-full bg-text-muted" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1 h-1 rounded-full bg-text-muted" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1 h-1 rounded-full bg-text-muted" />
                </div>
              </div>
            </div>
          )}

          {showBooking && <BookingForm onSubmit={handleBookingSubmit} />}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border shrink-0 bg-bg/60 backdrop-blur-md">
          <div className="p-[8px_20px_0] flex items-center justify-center gap-2 flex-wrap">
            {services.length > 0 ? services.slice(0,4).map((chip: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(`I'm interested in ${chip.title}`)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-2 bg-surface/50 text-text-secondary text-[12px] font-medium cursor-pointer transition-all hover:border-accent/50 hover:text-text-primary hover:bg-surface-3 whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                {chip.title}
              </button>
            )) : [
              { label: 'Imprimerie', text: 'Je souhaite des informations sur l\'imprimerie', icon: Printer },
              { label: 'Packaging', text: 'Je suis intéressé par le packaging', icon: Package },
              { label: 'Serigraphie', text: 'Parlez-moi de la sérigraphie', icon: Shirt },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSendMessage(chip.text)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-2 bg-surface/50 text-text-secondary text-[12px] font-medium cursor-pointer transition-all hover:border-accent/50 hover:text-text-primary hover:bg-surface-3 whitespace-nowrap"
              >
                <chip.icon className="w-3.5 h-3.5" />
                {chip.label}
              </button>
            ))}
          </div>
          
          <div className="p-[8px_20px_18px]">
            <div className="max-w-[740px] mx-auto flex items-end gap-2 bg-surface border border-border-2 rounded-[24px] p-[11px_11px_11px_17px] transition-all focus-within:border-accent/35 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.04)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(input);
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-text-primary font-sans resize-none leading-[1.55] min-h-[24px] max-h-[130px]"
                placeholder="Continue the conversation..."
                rows={1}
              />
              <button 
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center shrink-0 transition-all hover:opacity-85 hover:scale-95 disabled:opacity-25 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(16,185,129,0.25)]"
              >
                <Send className="w-[14px] h-[14px] text-[#0a0a0a]" />
              </button>
            </div>
            <p className="text-center text-[10px] text-text-muted font-mono mt-1.5 tracking-[0.04em]">
              Powered by ActionFlow AI · End-to-end encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Catalogue Overlay Modal */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowCatalog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="w-full max-w-[860px] max-h-[80vh] flex flex-col rounded-[22px] overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-[18px_22px] border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-[15px] font-semibold">Our Services</div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{services.length} service{services.length !== 1 ? 's' : ''} available</div>
                </div>
                <button
                  onClick={() => setShowCatalog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[18px] transition-all hover:opacity-70"
                  style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {services.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="text-[40px]">📦</div>
                    <div className="text-[14px] font-medium">No services available yet</div>
                    <div className="text-[12px]">Check back soon.</div>
                  </div>
                ) : (
                  <ProductCatalog items={services} onSelect={handleProductSelect} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-[9999] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-surface border border-accent/25 rounded-[14px] p-[14px_17px] flex items-center gap-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)] pointer-events-auto min-w-[230px]"
            >
              <div className="text-[22px]">{toast.icon}</div>
              <div>
                <div className="text-[12px] font-semibold text-accent">{toast.title}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{toast.sub}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
