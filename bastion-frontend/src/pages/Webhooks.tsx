import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  Eye,
  EyeOff,
  Link2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";

type Webhook = {
  id: string;
  name: string;
  url: string;
  env: "live" | "test";
  createdAt: string;
  signingSecret: string;
  lastDelivery?: string; // relative time
};

function mask(secret: string, show: boolean) {
  if (show) return secret;
  const prefix = secret.slice(0, 7);
  return `${prefix}••••••••••••••••`;
}

export default function Webhooks() {
  const [hooks, setHooks] = useState<Webhook[]>([
    {
      id: "wh_live_01",
      name: "Production webhook",
      url: "https://example.com/webhooks/bastion",
      env: "live",
      createdAt: "2025-08-20",
      signingSecret: "whsec_live_gT2pLk9X1a",
      lastDelivery: "3h ago",
    },
    {
      id: "wh_test_01",
      name: "Staging webhook",
      url: "https://staging.example.com/hooks/bastion",
      env: "test",
      createdAt: "2025-09-05",
      signingSecret: "whsec_test_N2vZq8Lm0b",
    },
  ]);
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({});

  const liveHooks = useMemo(
    () => hooks.filter((h) => h.env === "live"),
    [hooks]
  );
  const testHooks = useMemo(
    () => hooks.filter((h) => h.env === "test"),
    [hooks]
  );

  // Modal state
  const [open, setOpen] = useState(false);
  const [env, setEnv] = useState<"live" | "test">("live");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };
  const onReveal = (id: string) =>
    setRevealMap((m) => ({ ...m, [id]: !m[id] }));
  const onDelete = (id: string) =>
    setHooks((arr) => arr.filter((h) => h.id !== id));

  const genSecret = (e: "live" | "test") =>
    (e === "live" ? "whsec_live_" : "whsec_test_") +
    Math.random().toString(36).slice(2, 10);
  const onCreate = () => {
    const id = `${env}_${Date.now()}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    setHooks((arr) => [
      {
        id,
        name:
          name || (env === "live" ? "New Live Webhook" : "New Test Webhook"),
        url,
        env,
        createdAt,
        signingSecret: genSecret(env),
      },
      ...arr,
    ]);
    setName("");
    setUrl("");
    setOpen(false);
  };

  const renderTable = (data: Webhook[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[38%]">Destination</TableHead>
          <TableHead>Signing secret</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last delivery</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((h) => {
          const reveal = !!revealMap[h.id];
          return (
            <TableRow key={h.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium">
                      {h.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={h.env === "live" ? "default" : "secondary"}
                        className="h-5 px-2 text-xs"
                      >
                        {h.env === "live" ? "Live" : "Test"}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {h.url}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="truncate max-w-[240px]">
                    {mask(h.signingSecret, reveal)}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReveal(h.id)}
                          aria-label={reveal ? "Hide" : "Reveal"}
                        >
                          {reveal ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {reveal ? "Hide" : "Reveal"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onCopy(h.signingSecret)}
                          aria-label="Copy secret"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {h.createdAt}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {h.lastDelivery || "—"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(h.signingSecret)}>
                      Copy signing secret
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy(h.url)}>
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete webhook endpoint?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Deliveries will stop
                            immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(h.id)}>
                            Delete
                          </AlertDialogAction>
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
        <h2 className="text-3xl font-bold text-foreground">Webhooks</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create endpoint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a webhook endpoint</DialogTitle>
              <DialogDescription>
                Register a URL to receive Bastion event deliveries.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Environment</Label>
                <div className="col-span-3">
                  <div className="inline-flex rounded-md border p-1 bg-muted/30">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        env === "live"
                          ? "bg-background shadow"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setEnv("live")}
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        env === "test"
                          ? "bg-background shadow"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setEnv("test")}
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wh-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="wh-name"
                  placeholder="e.g., Backend Service"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wh-url" className="text-right">
                  Destination URL
                </Label>
                <Input
                  id="wh-url"
                  placeholder="https://example.com/webhooks/bastion"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onCreate} disabled={!url}>
                Create endpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Your webhook endpoints
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage destinations and signing secrets for Live and Test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="live">
            <TabsList>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="pt-4">
              {liveHooks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No live endpoints yet.
                </div>
              ) : (
                renderTable(liveHooks)
              )}
            </TabsContent>
            <TabsContent value="test" className="pt-4">
              {testHooks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No test endpoints yet.
                </div>
              ) : (
                renderTable(testHooks)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
