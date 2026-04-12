import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, RefreshCcw, User, Bot, Sparkles } from "lucide-react";
import { Service, KBDocument, AppConfig, ChatMessage, AIResponse } from "@/src/types";
import { generateSalesResponse } from "@/src/lib/gemini";

interface ChatPreviewProps {
  services: Service[];
  kb: KBDocument[];
  config: AppConfig;
}

export function ChatPreview({ services, kb, config }: ChatPreviewProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: `Hello 👋 Welcome to ${config.businessName}! I help businesses grow with bold design, brand identity, and digital marketing. How can I help you today?`, timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await generateSalesResponse(input, history, services, kb, config);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.response_text,
      uiAction: response.ui_action,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
            <CardDescription>Click a scenario to test the AI's response.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "What services do you offer?",
              "How much does a website cost?",
              "I want to book a call",
              "Can I speak to a human?",
              "My name is John, WhatsApp +237 600000000"
            ].map((s) => (
              <Button 
                key={s} 
                variant="outline" 
                className="w-full justify-start text-xs h-auto py-2 px-3 text-left whitespace-normal"
                onClick={() => setInput(s)}
              >
                {s}
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Debugger</CardTitle>
            <CardDescription>Monitor AI state and triggers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Last UI Action</div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {messages[messages.length - 1]?.uiAction || 'none'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Context Size</div>
              <div className="text-xs font-mono">{kb.length} docs · {services.length} services</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2 flex flex-col overflow-hidden border-emerald-500/20 shadow-xl shadow-emerald-500/5">
        <CardHeader className="border-b py-3 flex flex-row items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Live Preview</CardTitle>
              <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Online
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMessages([messages[0]])}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
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
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {services.slice(0, 3).map(s => (
                          <div key={s.id} className="shrink-0 w-32 rounded-lg border bg-card overflow-hidden text-[10px]">
                            <div className="h-12 flex items-center justify-center" style={{ background: s.bg }}>{s.emoji}</div>
                            <div className="p-2 space-y-1">
                              <div className="font-bold truncate">{s.title}</div>
                              <div className="text-emerald-500 font-bold">{s.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                  <div className="p-3 rounded-2xl bg-muted rounded-tl-none w-24 h-10" />
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-end gap-2 bg-background border rounded-xl p-2 focus-within:border-emerald-500/50 transition-all">
              <Textarea 
                className="flex-1 min-h-[40px] max-h-[120px] border-none focus-visible:ring-0 bg-transparent resize-none py-2"
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
              <Button size="icon" className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 shrink-0" onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
