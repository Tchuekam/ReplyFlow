/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import Dashboard from "./components/Dashboard";
import { ChatWidget } from "./components/ChatWidget/ChatWidget";
import { Auth } from "./components/Auth";
import { Toaster } from "@/components/ui/sonner";
import { Service, Lead, KBDocument, AppConfig } from "./types";
import { supabase } from "./lib/supabase";

const DEFAULT_SERVICES: Service[] = [
  { id: '1', title: 'Website Creation', description: 'Landing pages, e-commerce stores, and custom web applications.', price: 'From 150,000 FCFA', emoji: '🌐', bg: 'linear-gradient(135deg,#0d1f3c,#1a3a6b)', followUp: "Are you looking for a landing page or a full e-commerce store?" },
  { id: '2', title: 'Brand Identity', description: 'Logo, color system, typography, and full brand guidelines.', price: 'From 80,000 FCFA', emoji: '🎨', bg: 'linear-gradient(135deg,#1f0d1a,#4a1535)', followUp: 'Do you have an existing logo, or are you starting fresh?' },
  { id: '3', title: 'Social Media', description: 'Content creation, scheduling, and community management.', price: 'From 50,000 FCFA/mo', emoji: '📱', bg: 'linear-gradient(135deg,#0d2a1a,#1a5c3a)', followUp: 'Do you need content creation only, or full community management?' },
  { id: '4', title: 'SEO & Digital Marketing', description: 'Search optimisation, paid ads, and performance analytics.', price: 'From 70,000 FCFA/mo', emoji: '📈', bg: 'linear-gradient(135deg,#1a1a0d,#3a3a1a)', followUp: 'Are you targeting local or international audiences?' },
];

export default function App() {
  const [clientId, setClientId] = React.useState<string | null>(localStorage.getItem('REPLYFLOW_CLIENT_ID'));
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isDashboard, setIsDashboard] = React.useState(true);
  const [services, setServices] = React.useState<Service[]>(DEFAULT_SERVICES);
  const [kb, setKb] = React.useState<KBDocument[]>([]);
  const [config, setConfig] = React.useState<AppConfig>({
    businessName: 'Ayo Media',
    tagline: 'Bold design. Real results.',
    phone: '',
    whatsapp: '',
    bookingUrl: '',
    primaryColor: '#10b981',
    language: 'auto',
    leadWebhook: '',
    clientId: 'initializing',
    aiActive: true,
    theme: 'dark'
  });

  React.useEffect(() => {
    if (clientId) {
      setConfig(c => ({ ...c, clientId }));
    }
  }, [clientId]);

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/demo') {
      setIsDashboard(false);
    } else {
      setIsDashboard(true);
    }
  }, []);

  if (isInitializing) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center dark"><div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /></div>;
  }

  if (!clientId && isDashboard) {
    return (
      <div className={config.theme === 'dark' ? 'dark' : ''}>
        <Auth />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  return (
    <div className={config.theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30">
        {isDashboard && clientId ? (
          <Dashboard clientId={clientId} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">
                {config.businessName}
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                {config.tagline}
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.pathname = '/'}
                className="px-6 py-3 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
            <ChatWidget config={config} services={services} kb={kb} />
          </div>
        )}
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

