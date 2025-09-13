import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface CategoryAgg {
  product_category: string;
  count: number;
  total_value?: number;
}

async function fetchTopCategories(): Promise<CategoryAgg[]> {
  try {
    const res = await fetch("/api/top-categories");
    if (!res.ok) throw new Error("bad status");
    return await res.json();
  } catch (e) {
    // Fallback mock data
    return [
      { product_category: "Electronics", count: 128, total_value: 345999 },
      { product_category: "Clothing", count: 76, total_value: 89999 },
      { product_category: "Home & Garden", count: 52, total_value: 129999 },
      { product_category: "Sports", count: 31, total_value: 45999 },
      { product_category: "Books", count: 18, total_value: 15999 },
    ];
  }
}

export default function TopCategories() {
  const { data, isLoading } = useQuery({ queryKey: ["top-categories"], queryFn: fetchTopCategories });

  const sortedByCount = (data || []).slice().sort((a, b) => b.count - a.count);
  const sortedByValue = (data || []).slice().sort((a, b) => (b.total_value || 0) - (a.total_value || 0));
  const top10ByCount = sortedByCount.slice(0, 10);
  const top10ByValue = sortedByValue.slice(0, 10);

  const totalDisputes = (data || []).reduce((acc, d) => acc + d.count, 0);
  const totalValue = (data || []).reduce((acc, d) => acc + (d.total_value || 0), 0);
  const topByCount = sortedByCount[0];
  const topByValue = sortedByValue[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Categories</h2>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Disputes</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">{totalDisputes.toLocaleString()}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Disputed Value</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">${(totalValue/100).toLocaleString()}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Top by Count</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">{topByCount?.product_category ?? '—'}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Top by Value</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">{topByValue?.product_category ?? '—'}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Categories by Dispute Count (Top 10)</CardTitle>
          <CardDescription className="text-muted-foreground">Most frequently disputed categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 bg-muted/60 border border-slate-800 rounded-lg p-6">
              <SkeletonLoader rows={6} />
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10ByCount}
                  barCategoryGap="45%" barGap={2}
                  margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="product_category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} interval={0} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Categories by Total Disputed Value (Top 10)</CardTitle>
          <CardDescription className="text-muted-foreground">Highest total disputed amount</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 bg-muted/60 border border-slate-800 rounded-lg p-6">
              <SkeletonLoader rows={6} />
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10ByValue}
                  barCategoryGap="45%" barGap={2}
                  margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="product_category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} interval={0} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `$${(v/100).toLocaleString()}`} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="total_value" fill="hsl(var(--chart-5))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
