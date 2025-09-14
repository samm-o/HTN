import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">API Docs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Developer Documentation</CardTitle>
          <CardDescription className="text-muted-foreground">
            Placeholder docs. Add your OpenAPI spec and guides here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none text-sm text-muted-foreground">
            <p>Welcome to the Bastion Developer API. Use this area to publish endpoints, SDK usage, and examples.</p>
            <ul>
              <li>Authentication</li>
              <li>Error handling</li>
              <li>Rate limits</li>
              <li>Webhooks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
