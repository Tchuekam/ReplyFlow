import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, Check, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { AppConfig } from "@/src/types";

import { toast } from "sonner";

interface SettingsProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export function Settings({ config, setConfig }: SettingsProps) {
  const [form, setForm] = React.useState({ ...config });
  const [copied, setCopied] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const save = () => {
    setConfig(form);
    toast.success("Settings updated", {
      description: "Your business profile and AI configuration have been saved."
    });
  };

  const embedCode = `<!-- ReplyFlow AI Widget -->
<script>
  window.ReplyFlowConfig = {
    clientId: "${form.clientId || 'your-client-id'}",
    businessName: "${form.businessName || 'Your Business'}",
    primaryColor: "${form.primaryColor || '#10b981'}",
    phone: "${form.phone || ''}",
    whatsapp: "${form.whatsapp || ''}",
    bookingUrl: "${form.bookingUrl || ''}",
    language: "${form.language || 'auto'}",
  };
</script>
<script src="${window.location.origin}/widget.js" async></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-500 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Configure your business identity and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name *</Label>
              <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={form.phone} placeholder="+237 6XX XXX XXX" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={form.whatsapp} placeholder="+2376XXXXXXXX" onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Booking URL</Label>
            <Input value={form.bookingUrl} placeholder="https://calendly.com/your-link" onChange={e => setForm(f => ({ ...f, bookingUrl: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Control how the AI behaves and where it sends data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language Detection</Label>
              <Select value={form.language} onValueChange={(v: any) => setForm(f => ({ ...f, language: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect (recommended)</SelectItem>
                  <SelectItem value="en">English only</SelectItem>
                  <SelectItem value="fr">Français only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} />
                <Input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Lead Capture Webhook URL</Label>
            <Input value={form.leadWebhook} placeholder="https://your-api.com/leads" onChange={e => setForm(f => ({ ...f, leadWebhook: e.target.value }))} />
          </div>
          <div className="space-y-2 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <Label className="text-emerald-500 flex items-center gap-2">
              <Lock className="w-3 h-3" /> System Integration ID (Read Only)
            </Label>
            <Input 
              value={form.clientId} 
              readOnly 
              className="font-mono text-xs bg-transparent border-none text-emerald-500 focus-visible:ring-0 shadow-none px-0" 
            />
            <p className="text-[10px] text-muted-foreground italic">Your autonomous authentication vector. Used for widget embedding.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embed Widget</CardTitle>
          <CardDescription>Paste this code on your website to enable the AI Sales Assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto border">
              {embedCode}
            </pre>
            <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyEmbed}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setForm({ ...config })}>Reset</Button>
        <Button onClick={save} className="bg-emerald-500 hover:bg-emerald-600">
          <Lock className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
