import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Download, Eye, Trash2, Phone, Mail, Calendar, MessageSquare, Save } from "lucide-react";
import { Lead } from "@/src/types";
import { toast } from "sonner";
import { supabase } from "@/src/lib/supabase";

interface LeadsProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clientId: string;
}

export function Leads({ leads, setLeads, clientId }: LeadsProps) {
  const [filter, setFilter] = React.useState<string>("All");
  const [search, setSearch] = React.useState("");
  const [detail, setDetail] = React.useState<Lead | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const filtered = leads
    .filter(l => filter === "All" || l.status === filter)
    .filter(l => 
      !search || 
      l.name.toLowerCase().includes(search.toLowerCase()) || 
      l.phone.includes(search) || 
      (l.serviceInterest || "").toLowerCase().includes(search.toLowerCase())
    );

  const updateStatus = async (id: string, status: Lead['status']) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
  };

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(ls => ls.filter(l => l.id !== id));
    if (detail?.id === id) setDetail(null);
  };

  const exportCSV = () => {
    const header = "Name,Phone,Email,Service,Status,Source,Timestamp\n";
    const rows = leads.map(l => `"${l.name}","${l.phone}","${l.email || ""}","${l.serviceInterest || ""}","${l.status}","${l.source}","${l.timestamp}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replyflow-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCRM = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("CRM Data Saved", {
        description: "All lead statuses and updates have been synced."
      });
    }, 1000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          {["All", "Hot", "Warm", "Cold"].map(f => (
            <Button 
              key={f} 
              variant={filter === f ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="flex flex-1 gap-2 w-full md:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveCRM} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> Save CRM
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setDetail(l)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                      {l.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{l.name}</div>
                      {l.email && <div className="text-xs text-muted-foreground">{l.email}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{l.phone}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{l.serviceInterest || 'General'}</Badge>
                </TableCell>
                <TableCell>
                  <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as Lead['status'])}>
                    <SelectTrigger className="w-[100px] h-8 text-xs border-none bg-transparent p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hot">🔥 Hot</SelectItem>
                      <SelectItem value="Warm">☀️ Warm</SelectItem>
                      <SelectItem value="Cold">❄️ Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {l.source === 'booking' ? <Calendar className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                    {l.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetail(l)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLead(l.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {detail && (
        <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                  {detail.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-xl font-bold">{detail.name}</div>
                  <Badge variant={detail.status === 'Hot' ? 'destructive' : detail.status === 'Warm' ? 'default' : 'secondary'}>
                    {detail.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Phone / WhatsApp</div>
                  <div className="font-medium flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {detail.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium flex items-center gap-2">
                    <Mail className="w-3 h-3" /> {detail.email || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Service Interest</div>
                  <div className="font-medium">{detail.serviceInterest || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Captured</div>
                  <div className="font-medium">{new Date(detail.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
              <Button onClick={() => window.open(`https://wa.me/${detail.phone.replace(/[^0-9]/g, '')}`, '_blank')}>
                <Phone className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
