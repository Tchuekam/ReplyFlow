import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, Phone, Calendar, Bot, User, Sparkles } from "lucide-react";
import { Service, AppConfig, ChatMessage } from "@/src/types";
import { generateSalesResponse } from "@/src/lib/ai-core";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/src/lib/supabase";

interface ChatWidgetProps {
  config: AppConfig;
  services: Service[];
  kb: any[];
}

export function ChatWidget({ config, services, kb }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: `Hello 👋 Welcome to ${config.businessName}! How can I help you today?`, timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [catalogVisible, setCatalogVisible] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput("");
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    
    let response;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          message: messageText,
          history,
          config
        })
      });
      response = await res.json();
    } catch (e) {
      console.error(e);
      response = { response_text: "System communication error.", ui_action: "none" };
    }

    if (response?.lead_extraction?.is_new_lead && response?.lead_extraction?.name) {
      await supabase.from('leads').insert([{
        id: Date.now().toString(),
        name: response.lead_extraction.name,
        phone: response.lead_extraction.phone_or_email || '',
        email: response.lead_extraction.phone_or_email?.includes('@') ? response.lead_extraction.phone_or_email : '',
        serviceInterest: response.lead_extraction.service_interest || '',
        status: 'Warm',
        timestamp: new Date().toISOString(),
        source: 'chat',
        sessionId: config.clientId,
        client_id: config.clientId
      }]);
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.response_text || "I am currently unavailable.",
      uiAction: response.ui_action,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, aiMsg]);
    
    if (response.ui_action === 'show_catalog') {
      setCatalogVisible(true);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[380px] h-[600px] bg-card border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">{config.businessName}</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Online now
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${m.role === 'assistant' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-emerald-500 text-white'}`}>
                      {m.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="space-y-2 max-w-[80%]">
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-muted rounded-tl-none' : 'bg-emerald-500 text-white rounded-tr-none font-medium'}`}>
                        {m.content}
                      </div>
                      
                      {m.uiAction === 'show_catalog' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {services.map(s => (
                            <button 
                              key={s.id} 
                              onClick={() => handleSend(`I'm interested in ${s.title}`)}
                              className="text-left rounded-xl border bg-card overflow-hidden hover:border-emerald-500 transition-all group"
                            >
                              <div className="h-16 flex items-center justify-center text-2xl" style={{ background: s.bg }}>{s.emoji}</div>
                              <div className="p-2">
                                <div className="font-bold text-[10px] truncate">{s.title}</div>
                                <div className="text-emerald-500 font-bold text-[10px]">{s.price}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {m.uiAction === 'show_booking' && (
                        <Button variant="outline" className="w-full text-xs h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5" onClick={() => window.open(config.bookingUrl, '_blank')}>
                          <Calendar className="w-3 h-3 mr-2" /> Book a Consultation
                        </Button>
                      )}

                      {m.uiAction === 'human_handoff' && (
                        <Button className="w-full text-xs h-8 bg-emerald-500 hover:bg-emerald-600" onClick={() => window.open(`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}>
                          <Phone className="w-3 h-3 mr-2" /> Chat on WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                    <div className="p-3 rounded-2xl bg-muted rounded-tl-none w-16 h-10 flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex items-end gap-2 bg-background border rounded-2xl p-2 focus-within:border-emerald-500/50 transition-all shadow-sm">
                <Textarea 
                  className="flex-1 min-h-[40px] max-h-[100px] border-none focus-visible:ring-0 bg-transparent resize-none py-2 text-sm"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button size="icon" className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 shrink-0 rounded-xl" onClick={() => handleSend()} disabled={loading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-[9px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-bold opacity-50">
                Powered by ReplyFlow AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </motion.button>
    </div>
  );
}
