import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Image as ImageIcon, Sparkles, Upload, Save } from "lucide-react";
import { Service } from "@/src/types";
import { toast } from "sonner";
import { supabase } from "@/src/lib/supabase";

interface CatalogProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  clientId: string;
}

export function Catalog({ services, setServices, clientId }: CatalogProps) {
  const [modal, setModal] = React.useState<Service | 'add' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    price: '',
    emoji: '🚀',
    bg: 'linear-gradient(135deg,#0d1f3c,#1a3a6b)',
    followUp: '',
    image: ''
  });
  const fileRef = React.useRef<HTMLInputElement>(null);

  const emojis = ['🌐', '🎨', '📱', '📈', '🚀', '💡', '🎯', '🔥', '✨', '🛒', '📧', '🎬', '🖥️', '📊', '🎵', '🏋️', '🍕', '✈️', '💼', '🎓'];
  const bgs = [
    'linear-gradient(135deg,#0d1f3c,#1a3a6b)',
    'linear-gradient(135deg,#1f0d1a,#4a1535)',
    'linear-gradient(135deg,#0d2a1a,#1a5c3a)',
    'linear-gradient(135deg,#1a1a0d,#3a3a1a)',
    'linear-gradient(135deg,#1a0d0d,#5c1a1a)',
    'linear-gradient(135deg,#0d1a1a,#1a4a4a)',
    'linear-gradient(135deg,#1a0d2a,#3a1a5c)',
    'linear-gradient(135deg,#0d2a2a,#1a5c5c)',
  ];

  const openAdd = () => {
    setForm({ title: '', description: '', price: '', emoji: '🚀', bg: bgs[0], followUp: '', image: '' });
    setModal('add');
  };

  const openEdit = (s: Service) => {
    setForm({ ...s });
    setModal(s);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target?.result?.toString() || '' }));
    reader.readAsDataURL(file);
  };

  const handleSaveCatalog = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Catalog saved successfully", {
        description: `${services.length} services are now live in your chat widget.`
      });
    }, 1000);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    if (modal === 'add') {
      const newService = { ...form, id: Date.now().toString() };
      await supabase.from('services').insert([{ ...newService, client_id: clientId }]);
      setServices(ss => [...ss, newService]);
    } else if (typeof modal === 'object') {
      await supabase.from('services').update(form).eq('id', modal.id);
      setServices(ss => ss.map(s => s.id === modal.id ? { ...form, id: modal.id } : s));
    }
    setModal(null);
  };

  const del = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setServices(ss => ss.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{services.length} services · Displayed in chat widget</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveCatalog} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> Save Catalog</Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((s) => (
          <Card key={s.id} className="overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="h-32 flex items-center justify-center text-4xl relative overflow-hidden" style={{ background: s.bg }}>
              {s.image && <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />}
              <span className="relative z-10">{s.emoji}</span>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1">{s.description}</CardDescription>
              </div>
              <div className="text-emerald-500 font-bold font-mono text-sm">{s.price}</div>
              {s.followUp && (
                <div className="text-[10px] text-muted-foreground italic bg-muted p-2 rounded border border-border/50">
                  "{s.followUp}"
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(s)}>
                  <Edit2 className="w-3 h-3 mr-2" /> Edit
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 text-destructive" onClick={() => del(s.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card 
          className="border-dashed flex flex-col items-center justify-center py-10 space-y-4 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all group"
          onClick={openAdd}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="text-sm font-medium text-muted-foreground group-hover:text-emerald-500 transition-colors">Add new service</div>
        </Card>
      </div>

      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
          <DialogHeader className="shrink-0">
            <DialogTitle>{modal === 'add' ? 'Add Service' : 'Edit Service'}</DialogTitle>
            <DialogDescription>Configure how this service appears in the catalog and how the AI handles it.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 overflow-y-auto pr-2 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-bold">Title *</label>
              <Input placeholder="e.g. Website Creation" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Price *</label>
              <Input placeholder="e.g. From 150,000 FCFA" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold">Description *</label>
              <Textarea placeholder="Short description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold">AI Follow-up Question</label>
              <Input placeholder="What the AI asks when this is selected..." value={form.followUp} onChange={e => setForm(f => ({ ...f, followUp: e.target.value }))} />
              <div className="text-[10px] text-muted-foreground italic">e.g. "Are you looking for a landing page or an e-commerce store?"</div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold">Card Visuals</label>
              <div className="flex gap-4 items-center">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
                {form.image && (
                  <div className="relative w-12 h-12 rounded border overflow-hidden">
                    <img src={form.image} className="w-full h-full object-cover" alt="preview" />
                    <button className="absolute top-0 right-0 bg-destructive text-white p-0.5" onClick={() => setForm(f => ({ ...f, image: '' }))}>
                      <Trash2 className="w-2 h-2" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold">Icon</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map(em => (
                  <button 
                    key={em} 
                    onClick={() => setForm(f => ({ ...f, emoji: em }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-all ${form.emoji === em ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-muted'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold">Background</label>
              <div className="flex flex-wrap gap-2">
                {bgs.map((bg, i) => (
                  <button 
                    key={i} 
                    onClick={() => setForm(f => ({ ...f, bg }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${form.bg === bg ? 'border-emerald-500' : 'border-transparent'}`}
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={!form.title.trim()}>
              <Sparkles className="w-4 h-4 mr-2" /> {modal === 'add' ? 'Add Service' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
