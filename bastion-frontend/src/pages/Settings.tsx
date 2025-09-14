import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("Acme Retail, Inc.");
  const [companyWebsite, setCompanyWebsite] = useState("https://acme.example");
  const [contactEmail, setContactEmail] = useState("ops@acme.example");
  const [dataRetentionDays, setDataRetentionDays] = useState(365);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyBilling, setNotifyBilling] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Company Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your organization details used across invoices and compliance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="companyWebsite">Website</Label>
              <Input id="companyWebsite" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="contactEmail">Primary contact email</Label>
              <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Save profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Security & Access</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure team access, API credentials, and webhook endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-card">
              <div className="font-medium text-foreground mb-1">API Keys</div>
              <p className="text-sm text-muted-foreground">Manage Live and Test secrets used to authenticate API requests.</p>
              <div className="mt-3"><Button variant="secondary" onClick={() => navigate("/api-keys")}>Open API Keys</Button></div>
            </div>
            <div className="rounded-lg border p-4 bg-card">
              <div className="font-medium text-foreground mb-1">Webhooks</div>
              <p className="text-sm text-muted-foreground">Manage outbound webhooks. Configure endpoints and view delivery logs.</p>
              <div className="mt-3"><Button variant="secondary" onClick={() => navigate("/webhooks")}>Open Webhooks</Button></div>
            </div>
            <div className="rounded-lg border p-4 bg-card">
              <div className="font-medium text-foreground mb-1">Team & Roles</div>
              <p className="text-sm text-muted-foreground">Invite teammates and manage least-privilege access with roles.</p>
              <div className="mt-3"><Button variant="secondary" disabled>Manage Team (coming soon)</Button></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Data & Compliance</CardTitle>
          <CardDescription className="text-muted-foreground">
            Control retention, export requests, and compliance notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention">Data retention (days)</Label>
              <Input
                id="retention"
                type="number"
                min={30}
                max={1825}
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="complianceNotes">Compliance notes</Label>
              <Textarea id="complianceNotes" placeholder="e.g., SOC 2 Type II in progress; PCI DSS SAQ A" rows={4} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Save data settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Notifications</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose when Bastion should notify your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">High-risk events</div>
                <div className="text-sm text-muted-foreground">Notify security contacts when a user risk score exceeds thresholds.</div>
              </div>
              <Switch checked={notifyHighRisk} onCheckedChange={setNotifyHighRisk} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Billing updates</div>
                <div className="text-sm text-muted-foreground">Send notices for upcoming invoices or payment failures.</div>
              </div>
              <Switch checked={notifyBilling} onCheckedChange={setNotifyBilling} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing & Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Billing & Invoices</CardTitle>
          <CardDescription className="text-muted-foreground">
            View current plan, usage, and download invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Plan</Label>
              <Input value="Enterprise" readOnly />
            </div>
            <div>
              <Label>Current month usage</Label>
              <Input value="1,204 API calls" readOnly />
            </div>
            <div>
              <Label>Billing email</Label>
              <Input value="billing@acme.example" readOnly />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="secondary">Download last invoice</Button>
            <Button disabled>Manage payment method (coming soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
