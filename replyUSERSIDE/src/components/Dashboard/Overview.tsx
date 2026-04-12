import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users, MessageSquare, Grid, Zap, Play, Pause, RefreshCcw, TrendingUp } from "lucide-react";
import { Lead, Service } from "@/src/types";

interface OverviewProps {
  leads: Lead[];
  services: Service[];
  aiActive: boolean;
  setAiActive: (active: boolean) => void;
}

export function Overview({ leads, services, aiActive, setAiActive }: OverviewProps) {
  const hotLeads = leads.filter(l => l.status === 'Hot').length;
  
  const stats = [
    { label: 'Total Leads', val: leads.length, delta: '+24%', icon: Users, color: 'text-emerald-500' },
    { label: 'Conversations', val: '147', delta: '+18%', icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Services Active', val: services.length, delta: '', icon: Grid, color: 'text-amber-500' },
    { label: 'Conversion Rate', val: '32%', delta: '+5%', icon: Zap, color: 'text-teal-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`flex items-center justify-between p-4 rounded-xl border ${aiActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted border-border'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${aiActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <div>
            <div className={`font-bold ${aiActive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              AI Sales Agent — {aiActive ? 'Active' : 'Paused'}
            </div>
            <div className="text-sm text-muted-foreground">
              {aiActive ? 'Responding to visitors automatically · Gemini powered' : 'Visitors will not receive automated replies while paused'}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAiActive(!aiActive)}>
          {aiActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {aiActive ? 'Pause AI' : 'Resume AI'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.val}</div>
              {s.delta && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {s.delta}
                  </span>{" "}
                  this week
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { text: 'Jean-Paul Mbarga asked about website pricing', time: '2 min ago', color: 'bg-emerald-500' },
              { text: 'Aminata Diallo requested a branding consultation', time: '14 min ago', color: 'bg-blue-500' },
              { text: 'Kwame Osei captured as lead — Social Media', time: '1 hr ago', color: 'bg-teal-500' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${a.color}`} />
                <div className="flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>This month · 420 visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: 'Unique Visitors', val: 420, pct: 100, color: 'bg-muted' },
              { label: 'Started Chat', val: 210, pct: 50, color: 'bg-blue-500' },
              { label: 'Showed Interest', val: 98, pct: 23, color: 'bg-amber-500' },
              { label: 'Leads Captured', val: leads.length, pct: Math.round((leads.length / 420) * 100), color: 'bg-emerald-500' },
            ].map((r) => (
              <div key={r.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-bold">
                    {r.val} <span className="text-xs font-normal text-muted-foreground">({r.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
