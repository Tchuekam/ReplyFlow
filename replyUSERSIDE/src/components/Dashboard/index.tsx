import * as React from "react";
import { Overview } from "./Overview";
import { Leads } from "./Leads";
import { KnowledgeBase } from "./KnowledgeBase";
import { Catalog } from "./Catalog";
import { Settings } from "./Settings";
import { ChatPreview } from "./ChatPreview";
import { Service, Lead, KBDocument, AppConfig } from "@/src/types";
import { supabase } from "@/src/lib/supabase";
import { Home, Users, BrainCircuit, Grid, MessageSquare, Settings as SettingsIcon, LayoutDashboard, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DEFAULT_SERVICES: Service[] = [
  { id: '1', title: 'Website Creation', description: 'Landing pages, e-commerce stores, and custom web applications.', price: 'From 150,000 FCFA', emoji: '🌐', bg: 'linear-gradient(135deg,#0d1f3c,#1a3a6b)', followUp: "Are you looking for a landing page or a full e-commerce store?" },
  { id: '2', title: 'Brand Identity', description: 'Logo, color system, typography, and full brand guidelines.', price: 'From 80,000 FCFA', emoji: '🎨', bg: 'linear-gradient(135deg,#1f0d1a,#4a1535)', followUp: 'Do you have an existing logo, or are you starting fresh?' },
  { id: '3', title: 'Social Media', description: 'Content creation, scheduling, and community management.', price: 'From 50,000 FCFA/mo', emoji: '📱', bg: 'linear-gradient(135deg,#0d2a1a,#1a5c3a)', followUp: 'Do you need content creation only, or full community management?' },
  { id: '4', title: 'SEO & Digital Marketing', description: 'Search optimisation, paid ads, and performance analytics.', price: 'From 70,000 FCFA/mo', emoji: '📈', bg: 'linear-gradient(135deg,#1a1a0d,#3a3a1a)', followUp: 'Are you targeting local or international audiences?' },
];

const DEFAULT_LEADS: Lead[] = [
  { id: '1', name: 'Jean-Paul Mbarga', phone: '+237 655 123 456', email: 'jp@example.com', serviceInterest: 'Website Creation', status: 'Hot', timestamp: new Date().toISOString(), source: 'chat', sessionId: 's1' },
  { id: '2', name: 'Aminata Diallo', phone: '+221 77 890 1234', status: 'Warm', timestamp: new Date().toISOString(), source: 'booking', sessionId: 's2' },
];

const DEFAULT_KB: KBDocument[] = [
  { id: '1', name: 'Company Profile.txt', type: 'txt', size: '2.1 KB', content: 'Ayo Media is a full-service digital agency specialising in web design, brand identity, and social media. Founded in 2019, we have helped over 150 businesses across West and Central Africa. Our team of 12 specialists delivers bold, conversion-focused digital experiences. We believe every business deserves a world-class digital presence.' },
  { id: '2', name: '48 Laws of Power (Summary).txt', type: 'txt', size: '1.5 KB', content: `LAW 1: NEVER OUTSHINE THE MASTER. Always make those above you feel comfortably superior. In your desire to please or impress them, do not go too far in displaying your talents or you might accomplish the opposite—inspire fear and insecurity.
LAW 2: NEVER PUT TOO MUCH TRUST IN FRIENDS, LEARN HOW TO USE ENEMIES. Be wary of friends—they will betray you more quickly, for they are easily aroused to envy. They also become spoiled and tyrannical. But hire a former enemy and he will be more loyal than a friend.
LAW 3: CONCEAL YOUR INTENTIONS. Keep people off-balance and in the dark by never revealing the purpose behind your actions. If they have no clue what you are up to, they cannot prepare a defense.
LAW 4: ALWAYS SAY LESS THAN NECESSARY. When you are trying to impress people with words, the more you say, the more common you appear, and the less in control. Powerful people impress and intimidate by saying less.
LAW 5: SO MUCH DEPENDS ON REPUTATION—GUARD IT WITH YOUR LIFE. Reputation is the cornerstone of power. Through reputation alone you can intimidate and win; once it slips, however, you are vulnerable, and will be attacked on all sides.` },
];

export default function Dashboard({ clientId }: { clientId: string }) {
  const [page, setPage] = React.useState('overview');
  const [services, setServices] = React.useState<Service[]>(DEFAULT_SERVICES);
  const [leads, setLeads] = React.useState<Lead[]>(DEFAULT_LEADS);
  const [kb, setKb] = React.useState<KBDocument[]>(DEFAULT_KB);
  const [isSaving, setIsSaving] = React.useState(false);

  const [config, setConfig] = React.useState<AppConfig>({
    businessName: 'Loading...',
    tagline: '',
    phone: '',
    whatsapp: '',
    bookingUrl: '',
    primaryColor: '#10b981',
    language: 'auto',
    leadWebhook: '',
    clientId: clientId,
    aiActive: true,
    theme: 'dark'
  });

  React.useEffect(() => {
    async function loadData() {
      const { data: bData } = await supabase.from('businesses').select('*').eq('id', clientId).single();
      if (bData) {
        setConfig(c => ({
          ...c,
          businessName: bData.business_name || '',
          tagline: bData.tagline || '',
          phone: bData.phone || '',
          whatsapp: bData.whatsapp || '',
          primaryColor: bData.primary_color || '#10b981',
          bookingUrl: bData.booking_url || ''
        }));
      }

      const { data: sData } = await supabase.from('services').select('*').eq('client_id', clientId);
      if (sData) setServices(sData as Service[]);
      const { data: kbData } = await supabase.from('knowledge_base').select('*').eq('client_id', clientId);
      if (kbData) setKb(kbData as KBDocument[]);
      const { data: lData } = await supabase.from('leads').select('*').eq('client_id', clientId);
      if (lData) setLeads(lData as Lead[]);
    }
    loadData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          toast.success("🚨 INCOMING CONNECTION: Client engaged.", {
            description: `Identity Vector: ${payload.new.name || 'Anonymous Vector'}`,
            duration: 8000,
          });
          setLeads(prev => [payload.new as Lead, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const handleSaveSettings = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    const { error } = await supabase.from('businesses').update({
      business_name: newConfig.businessName,
      tagline: newConfig.tagline,
      phone: newConfig.phone,
      whatsapp: newConfig.whatsapp,
      primary_color: newConfig.primaryColor,
      booking_url: newConfig.bookingUrl
    }).eq('id', clientId);
    
    if (error) {
      toast.error("Failed to commit settings to secure storage.");
    } else {
      toast.success("Settings synchronized with secure storage.");
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'leads', label: 'Leads CRM', icon: Users, badge: leads.filter(l => l.status === 'Hot').length },
    { id: 'knowledge', label: 'Knowledge Base', icon: BrainCircuit },
    { id: 'catalog', label: 'Catalog', icon: Grid },
    { id: 'chat', label: 'AI Chat Preview', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="font-black text-lg tracking-tight">ReplyFlow</div>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">AI</Badge>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Navigation</div>
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={page === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-10 ${page === item.id ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? <Badge className="bg-emerald-500 text-white border-none h-5 min-w-5 flex items-center justify-center p-0">{item.badge}</Badge> : null}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
                {config.businessName.substring(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{config.businessName}</div>
                <div className="text-[10px] text-muted-foreground truncate">ID: {clientId.substring(0,8)}...</div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={() => supabase.auth.signOut()}
            >
              Log Out / Terminate Session
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-10 shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight capitalize">{page.replace('-', ' ')}</h2>
            <p className="text-xs text-muted-foreground">Manage your AI sales assistant and leads</p>
          </div>
          <div className="flex items-center gap-4">
            {page === 'chat' && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">🤖 AI Active</Badge>}
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => window.open('/demo', '_blank')}>
              <LayoutDashboard className="w-4 h-4 mr-2" /> View Widget
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {page === 'overview' && <Overview leads={leads} services={services} aiActive={config.aiActive} setAiActive={(v) => setConfig(c => ({ ...c, aiActive: v }))} />}
            {page === 'leads' && <Leads leads={leads} setLeads={setLeads} clientId={clientId} />}
            {page === 'knowledge' && <KnowledgeBase kb={kb} setKb={setKb} clientId={clientId} />}
            {page === 'catalog' && <Catalog services={services} setServices={setServices} clientId={clientId} />}
            {page === 'chat' && <ChatPreview services={services} kb={kb} config={config} />}
            {page === 'settings' && <Settings config={config} setConfig={handleSaveSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
}
