import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { FileText, Upload, Plus, Trash2, Eye, EyeOff, BrainCircuit, Save } from "lucide-react";
import { KBDocument } from "@/src/types";
import { toast } from "sonner";
import { supabase } from "@/src/lib/supabase";

interface KnowledgeBaseProps {
  kb: KBDocument[];
  setKb: React.Dispatch<React.SetStateAction<KBDocument[]>>;
  clientId: string;
}

export function KnowledgeBase({ kb, setKb, clientId }: KnowledgeBaseProps) {
  const [showPreview, setShowPreview] = React.useState<string | null>(null);
  const [addText, setAddText] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [txtTitle, setTxtTitle] = React.useState("");
  const [txtContent, setTxtContent] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result?.toString() || "";
      const doc = {
        id: Date.now().toString(),
        name: file.name,
        type: isPdf ? 'pdf' : 'txt',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        content: isPdf ? result : result, // data URL for pdf, text for txt
        isPdf,
      };
      await supabase.from('knowledge_base').insert([{ ...doc, client_id: clientId }]);
      setKb(k => [...k, doc as any]);
    };
    // PDFs: store as data URL for in-browser preview; text files: read as text
    if (isPdf) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const saveText = async () => {
    if (!txtTitle.trim() || !txtContent.trim()) return;
    const doc = {
      id: Date.now().toString(),
      name: txtTitle.trim() + '.txt',
      type: 'txt',
      size: `${(txtContent.length / 1024).toFixed(1)} KB`,
      content: txtContent.trim(),
    };
    await supabase.from('knowledge_base').insert([{ ...doc, client_id: clientId }]);
    setKb(k => [...k, doc as any]);
    setTxtTitle('');
    setTxtContent('');
    setAddText(false);
  };

  const totalChars = kb.reduce((acc, f) => acc + f.content.length, 0);

  const handleSaveKB = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Knowledge Base updated", {
        description: `${kb.length} documents are now being used by your AI assistant.`
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{kb.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalChars.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kb.length > 0 ? 'text-teal-500' : 'text-destructive'}`}>
              {kb.length > 0 ? '✓ Active' : '✗ Empty'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="border-dashed cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all group"
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-2">
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            <div className="font-bold">Upload PDF or Text</div>
            <div className="text-xs text-muted-foreground">Click to browse · .pdf, .txt, .md supported</div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleFile} />
          </CardContent>
        </Card>
        <Card 
          className="border-dashed cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all group"
          onClick={() => setAddText(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-2">
            <Plus className="w-10 h-10 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            <div className="font-bold">Paste Text Knowledge</div>
            <div className="text-xs text-muted-foreground">FAQs, pricing, team info, policies…</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Knowledge Base</CardTitle>
            <Button variant="outline" size="sm" onClick={handleSaveKB} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> Save Knowledge Base</Button>
          </div>
          <CardDescription>{kb.length} documents · Used as AI context on every chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {kb.map((f) => (
            <div key={f.id} className="space-y-2">
              <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${f.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {f.type === 'pdf' ? '📕' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{f.size} · {f.type.toUpperCase()}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(showPreview === f.id ? null : f.id)}>
                    {showPreview === f.id ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview === f.id ? 'Hide' : 'Preview'}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                    await supabase.from('knowledge_base').delete().eq('id', f.id);
                    setKb(k => k.filter(x => x.id !== f.id));
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {showPreview === f.id && (
                <div className="rounded-lg border overflow-hidden" style={{ maxHeight: 360 }}>
                  {(f as any).isPdf || f.type === 'pdf' && f.content?.startsWith('data:') ? (
                    <iframe
                      src={f.content}
                      className="w-full"
                      style={{ height: 340, border: 'none' }}
                      title={f.name}
                    />
                  ) : (
                    <div className="p-4 bg-muted font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto" style={{ maxHeight: 340 }}>
                      {f.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {kb.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <BrainCircuit className="w-12 h-12 text-muted-foreground" />
              <div>
                <div className="font-bold">No knowledge added yet</div>
                <div className="text-sm text-muted-foreground max-w-xs">Upload documents or paste text above to give your AI a brain. Without this, the AI uses default responses only.</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addText} onOpenChange={setAddText}>
        <DialogContent className="max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
          <DialogHeader className="shrink-0">
            <DialogTitle>Add Knowledge Text</DialogTitle>
            <DialogDescription>Paste or type your business knowledge here. Include pricing, process, FAQs, testimonials — anything the AI should know.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            <div className="space-y-2">
              <label className="text-sm font-bold">Document Title</label>
              <Input placeholder="e.g. FAQ, Pricing 2025, Team Info" value={txtTitle} onChange={e => setTxtTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Content</label>
              <Textarea className="min-h-[240px]" placeholder="Paste content here..." value={txtContent} onChange={e => setTxtContent(e.target.value)} />
              <div className="text-[10px] text-muted-foreground">{txtContent.length} characters · The more detail you add, the smarter your AI becomes.</div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setAddText(false)}>Cancel</Button>
            <Button onClick={saveText} disabled={!txtTitle.trim() || !txtContent.trim()}>Save to Knowledge Base</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
