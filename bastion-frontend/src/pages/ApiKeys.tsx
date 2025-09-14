import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApiKeys() {
  const [keys] = useState([
    { id: "key_01", name: "Production Key", prefix: "sk_live_", createdAt: "2024-09-01" },
    { id: "key_02", name: "Development Key", prefix: "sk_test_", createdAt: "2024-09-10" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">API Keys</h2>
        <Button variant="default" disabled>
          Generate Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Your Keys</CardTitle>
          <CardDescription className="text-muted-foreground">Placeholder - wire to backend when ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <div className="text-sm text-muted-foreground">{k.name}</div>
                  <div className="font-mono text-sm text-foreground">{k.prefix}••••••••••••</div>
                </div>
                <div className="text-xs text-muted-foreground">Created {k.createdAt}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
