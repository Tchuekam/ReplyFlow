import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, ChevronRight, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function Auth() {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [tagline, setTagline] = useState('');
  const [loading, setLoading] = useState(false);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim() || !tagline.trim()) {
      toast.error("Complete all systemic identity fields.");
      return;
    }

    setLoading(true);
    try {
      const generatedClientId = generateUUID();
      
      const { error: dbError } = await supabase.from('businesses').insert([{
        id: generatedClientId,
        business_name: businessName,
        phone,
        tagline,
        primary_color: '#10b981'
      }]);
      
      if (dbError) throw dbError;

      // Persist the mechanical token locally
      localStorage.setItem('REPLYFLOW_CLIENT_ID', generatedClientId);
      toast.success("Business Architecture Generated.");
      
      // Force reload to mount the Dashboard natively
      window.location.reload();
      
    } catch (err: any) {
      toast.error(err.message || "Database synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10b98115_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGgxdjFIMHoiIGZpbGw9IiMzMzMiLz4KPC9zdmc+')] opacity-20" />
      
      <div className="w-full max-w-sm relative z-10 border border-white/10 bg-black/50 backdrop-blur-2xl p-8 rounded-2xl shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">ReplyFlow AI</h1>
          <p className="text-[11px] text-emerald-500/80 font-mono tracking-widest uppercase">System Initialization</p>
        </div>

        <form onSubmit={handleOnboarding} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 ml-1 flex items-center gap-2"><Settings className="w-3 h-3"/> Organization Name</label>
              <Input 
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required
                placeholder="Ayo Media Ltd."
                className="bg-emerald-500/5 border-emerald-500/20 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 rounded-xl h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 ml-1">Core Tagline</label>
              <Input 
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                required
                placeholder="Bold design. Real results."
                className="bg-emerald-500/5 border-emerald-500/20 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 rounded-xl h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 ml-1">Primary Support Vector (Phone)</label>
              <Input 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+237XXXXXXXXX"
                className="bg-emerald-500/5 border-emerald-500/20 text-white focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 rounded-xl h-12"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm tracking-wide rounded-xl mt-4"
          >
            {loading ? <Layers className="w-4 h-4 animate-spin" /> : "Deploy Infrastructure"}
            {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground/50 tracking-wider">NO AUTHENTICATION PERMIT REQUIRED</p>
        </div>
      </div>
    </div>
  );
}
