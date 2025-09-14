import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, Eye, EyeOff, MoreVertical, Plus, Shield, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  secret: string; // full secret, masked in UI by default
  env: "live" | "test";
  createdAt: string; // ISO date
  lastUsed?: string; // relative or date string
};

function maskSecret(secret: string, show: boolean) {
  if (show) return secret;
  const prefix = secret.slice(0, 7);
  return `${prefix}••••••••••••••••••••••`;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "key_live_01", name: "Primary Live", secret: "sk_live_1H0J3kN9pQ2rT5u", env: "live", createdAt: "2025-08-28", lastUsed: "2d ago" },
    { id: "key_test_01", name: "CI Test", secret: "sk_test_j82mZP0sQt9LvX1", env: "test", createdAt: "2025-09-01", lastUsed: "1h ago" },
  ]);
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({});

  const liveKeys = useMemo(() => keys.filter(k => k.env === "live"), [keys]);
  const testKeys = useMemo(() => keys.filter(k => k.env === "test"), [keys]);

  // Create Key modal state
  const [open, setOpen] = useState(false);
  const [creatingEnv, setCreatingEnv] = useState<"live" | "test">("live");
  const [formName, setFormName] = useState("");

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // no-op fallback
    }
  };

  const onToggleReveal = (id: string) => {
    setRevealMap((m) => ({ ...m, [id]: !m[id] }));
  };

  const onRevoke = (id: string) => {
    setKeys((arr) => arr.filter((k) => k.id !== id));
  };

  const generateSecret = (env: "live" | "test") => {
    const prefix = env === "live" ? "sk_live_" : "sk_test_";
    const rand = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    return prefix + rand;
  };

  const onCreateKey = () => {
    const secret = generateSecret(creatingEnv);
    const id = `${creatingEnv}_${Date.now()}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    setKeys((arr) => [{ id, name: formName || (creatingEnv === "live" ? "New Live Key" : "New Test Key"), secret, env: creatingEnv, createdAt }, ...arr]);
    setFormName("");
    setOpen(false);
  };

  const renderTable = (data: ApiKey[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Name</TableHead>
          <TableHead>Secret</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last used</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((k) => {
          const revealed = !!revealMap[k.id];
          return (
            <TableRow key={k.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">{k.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={k.env === "live" ? "default" : "secondary"} className="h-5 px-2 text-xs">
                        {k.env === "live" ? "Live" : "Test"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{k.id}</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="truncate max-w-[280px]">{maskSecret(k.secret, revealed)}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onToggleReveal(k.id)} aria-label={revealed ? "Hide secret" : "Reveal secret"}>
                          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{revealed ? "Hide" : "Reveal"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onCopy(k.secret)} aria-label="Copy secret">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{k.createdAt}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{k.lastUsed || "—"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(k.secret)}>Copy secret</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Revoke
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The application using this key will lose access immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRevoke(k.id)}>Revoke</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">API Keys</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create an API key</DialogTitle>
              <DialogDescription>Generate a new secret key for the selected environment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="env" className="text-right">Environment</Label>
                <div className="col-span-3">
                  <div className="inline-flex rounded-md border p-1 bg-muted/30">
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm ${creatingEnv === 'live' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                      onClick={() => setCreatingEnv('live')}
                      type="button"
                    >
                      Live
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm ${creatingEnv === 'test' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                      onClick={() => setCreatingEnv('test')}
                      type="button"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Backend Service" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onCreateKey}>Create key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Your API keys</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your Live and Test secrets. Treat them like passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="live">
            <TabsList>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="pt-4">
              {liveKeys.length === 0 ? (
                <div className="text-sm text-muted-foreground">No live keys yet.</div>
              ) : (
                renderTable(liveKeys)
              )}
            </TabsContent>
            <TabsContent value="test" className="pt-4">
              {testKeys.length === 0 ? (
                <div className="text-sm text-muted-foreground">No test keys yet.</div>
              ) : (
                renderTable(testKeys)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
