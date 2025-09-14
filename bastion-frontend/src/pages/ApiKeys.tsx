import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Eye, EyeOff, Plus, RefreshCcw, Trash2, Lock, Globe } from "lucide-react";

type Env = "live" | "test";

type ApiKey = {
  id: string;
  name: string;
  environment: Env;
  prefix: string; // e.g., sk_live_ or sk_test_
  createdAt: string; // ISO
  lastUsedAt?: string; // ISO | undefined
  scopes: string[]; // e.g. ["claims:write", "users:read"]
  ipAllowlist?: string[]; // CIDRs or IPs
  active: boolean;
  revealed?: boolean; // local-only flag to toggle mask
};

function mask(prefix: string) {
  return `${prefix}${"•".repeat(16)}`;
}

function format(date?: string) {
  if (!date) return "—";
  try { return new Date(date).toLocaleString(); } catch { return date; }
}

export default function ApiKeys() {
  const [env, setEnv] = useState<Env>("test");
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "k_live_01", name: "Production Key", environment: "live", prefix: "sk_live_", createdAt: "2024-09-01T10:00:00Z", lastUsedAt: "2025-09-10T08:30:00Z", scopes: ["claims:write", "users:read"], ipAllowlist: ["0.0.0.0/0"], active: true },
    { id: "k_test_01", name: "Dev Key", environment: "test", prefix: "sk_test_", createdAt: "2024-09-10T10:00:00Z", lastUsedAt: "2025-09-12T12:00:00Z", scopes: ["claims:write", "users:read"], active: true },
  ]);

  const [isGenOpen, setIsGenOpen] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<Env>("test");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["claims:write"]);
  const [newKeyIPs, setNewKeyIPs] = useState("");
  const [oneTimeSecret, setOneTimeSecret] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleKeys = useMemo(() => keys.filter(k => k.environment === env), [keys, env]);

  const toggleReveal = (id: string) => setKeys(prev => prev.map(k => k.id === id ? { ...k, revealed: !k.revealed } : k));

  const copyKey = async (id: string) => {
    const k = keys.find(x => x.id === id);
    if (!k) return;
    const text = k.revealed && oneTimeSecret && k.id === "__one_time__" ? oneTimeSecret : mask(k.prefix);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const revokeKey = (id: string) => setKeys(prev => prev.map(k => k.id === id ? { ...k, active: false } : k));
  const regenerateKey = (id: string) => {
    // Locally just bump createdAt and clear lastUsed
    setKeys(prev => prev.map(k => k.id === id ? { ...k, createdAt: new Date().toISOString(), lastUsedAt: undefined } : k));
  };

  const handleGenerate = () => {
    const id = `${newKeyEnv === "live" ? "k_live" : "k_test"}_${Math.random().toString(36).slice(2, 8)}`;
    const prefix = newKeyEnv === "live" ? "sk_live_" : "sk_test_";
    // Simulate a one-time full secret
    const full = `${prefix}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 40);
    const ipList = newKeyIPs.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
    const created: ApiKey = {
      id,
      name: newKeyName || (newKeyEnv === "live" ? "New Production Key" : "New Dev Key"),
      environment: newKeyEnv,
      prefix,
      createdAt: new Date().toISOString(),
      scopes: newKeyScopes,
      ipAllowlist: ipList.length ? ipList : undefined,
      active: true,
      revealed: false,
    };
    setKeys(prev => [created, ...prev]);
    setOneTimeSecret(full);
    setIsGenOpen(false);
    setIsRevealOpen(true);
    setNewKeyName("");
    setNewKeyIPs("");
    setNewKeyScopes(["claims:write"]);
    setNewKeyEnv("test");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">API Keys</h2>
        <div className="flex items-center gap-2">
          <div className="bg-muted/60 border rounded-lg p-1 flex items-center">
            <button onClick={() => setEnv("test")} className={`px-3 py-1 rounded ${env === "test" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
              Test
            </button>
            <button onClick={() => setEnv("live")} className={`px-3 py-1 rounded ${env === "live" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
              Live
            </button>
          </div>
          <Button onClick={() => setIsGenOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Generate key</Button>
        </div>
      </div>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{env === "live" ? "Live" : "Test"} keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleKeys.length === 0 && (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No keys yet. Click "Generate key" to create your first {env} key.
              </div>
            )}
            {visibleKeys.map((k) => (
              <div key={k.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  {k.environment === "live" ? <Lock className="h-4 w-4 text-red-400" /> : <Globe className="h-4 w-4 text-green-400" />}
                  <div>
                    <div className="text-sm text-muted-foreground">{k.name} {k.active ? '' : '(revoked)'}</div>
                    <div className="font-mono text-sm text-foreground">{k.revealed ? `${k.prefix}REDACTED` : mask(k.prefix)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Created {format(k.createdAt)} • Last used {format(k.lastUsedAt)}</div>
                    {k.scopes?.length ? (
                      <div className="text-xs mt-2 text-muted-foreground">
                        Scopes: {k.scopes.join(', ')}
                      </div>
                    ) : null}
                    {k.ipAllowlist?.length ? (
                      <div className="text-xs mt-1 text-muted-foreground">
                        IP allowlist: {k.ipAllowlist.join(', ')}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyKey(k.id)} className="gap-2">
                    <Copy className="h-4 w-4" /> {copiedId === k.id ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleReveal(k.id)} className="gap-2">
                    {k.revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {k.revealed ? 'Hide' : 'Reveal'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => regenerateKey(k.id)} className="gap-2">
                    <RefreshCcw className="h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => revokeKey(k.id)} className="gap-2 text-red-400">
                    <Trash2 className="h-4 w-4" /> Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Key Modal */}
      <Dialog open={isGenOpen} onOpenChange={setIsGenOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Generate API key</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure environment, scopes, and restrictions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Environment</label>
                <div className="bg-muted/60 border rounded-lg p-1 flex items-center w-fit">
                  <button onClick={() => setNewKeyEnv("test")} className={`px-3 py-1 rounded ${newKeyEnv === "test" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
                    Test
                  </button>
                  <button onClick={() => setNewKeyEnv("live")} className={`px-3 py-1 rounded ${newKeyEnv === "live" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
                    Live
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Key name</label>
                <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Backend service" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Scopes</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { val: "claims:write", label: "Claims: Write" },
                  { val: "users:read", label: "Users: Read" },
                  { val: "analytics:read", label: "Analytics: Read" },
                  { val: "webhooks:manage", label: "Webhooks: Manage" },
                ].map(s => (
                  <label key={s.val} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={newKeyScopes.includes(s.val)} onCheckedChange={(v) => {
                      const checked = Boolean(v);
                      setNewKeyScopes(prev => checked ? Array.from(new Set([...prev, s.val])) : prev.filter(x => x !== s.val));
                    }} />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">IP allowlist (optional)</label>
              <Textarea
                value={newKeyIPs}
                onChange={(e) => setNewKeyIPs(e.target.value)}
                placeholder="One per line or comma separated (e.g., 203.0.113.0/24, 198.51.100.5)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">Only requests from these IPs will be accepted.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsGenOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerate}>Generate</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* One-time reveal dialog */}
      <Dialog open={isRevealOpen} onOpenChange={setIsRevealOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Your new API key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This is the only time we’ll show the full secret. Store it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/60 border rounded-lg p-4">
            <div className="font-mono text-sm break-all text-foreground">{oneTimeSecret ?? ""}</div>
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={() => {
              if (oneTimeSecret) navigator.clipboard.writeText(oneTimeSecret);
              setIsRevealOpen(false);
              setOneTimeSecret(null);
            }} className="gap-2">
              <Copy className="h-4 w-4" /> Copy & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
