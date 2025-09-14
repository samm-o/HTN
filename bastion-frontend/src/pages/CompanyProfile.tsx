import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Tooltip as ReTooltip, Area, Sector } from 'recharts';
import { ShieldAlert, CheckCircle, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api';

// Interface for API data
interface DashboardData {
  suspiciousDisputes: Array<{ date: string; value: number }>;
  approvedDisputes: Array<{ date: string; value: number }>;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopDisputedItem {
  item: string;
  category: string;
  disputes: number;
  lastDispute: string;
  productLink: string;
}

interface SummaryStats {
  totalSuspiciousDisputes: number;
  totalApprovedDisputes: number;
  approvalRate: number;
}


export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '3m' | '1y'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<
    'suspiciousDisputes' | 'approvedDisputes' | 'percentage'
  >('suspiciousDisputes');
  
  // State for API data
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    suspiciousDisputes: [],
    approvedDisputes: []
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  // Hard-coded most disputed items (technology and luxury items)
  const [topDisputedItems, setTopDisputedItems] = useState<TopDisputedItem[]>([
    {
      item: "iPhone 15 Pro",
      category: "Electronics",
      disputes: 127,
      lastDispute: "2024-01-12",
      productLink: "https://apple.com/iphone-15-pro"
    },
    {
      item: "Headphones",
      category: "Electronics", 
      disputes: 89,
      lastDispute: "2024-01-11",
      productLink: "https://amazon.com/headphones"
    },
    {
      item: "Black T-Shirt",
      category: "Clothing",
      disputes: 76,
      lastDispute: "2024-01-10", 
      productLink: "https://amazon.com/t-shirt"
    },
    {
      item: "Nike Socks",
      category: "Clothing",
      disputes: 64,
      lastDispute: "2024-01-09",
      productLink: "https://amazon.com/socks"
    },
    {
      item: "Portable Charger",
      category: "Electronics",
      disputes: 52,
      lastDispute: "2024-01-08",
      productLink: "https://amazon.com/portable-charger"
    }
  ]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalSuspiciousDisputes: 0,
    totalApprovedDisputes: 0,
    approvalRate: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, categoryResponse, statsData] = await Promise.all([
          apiClient.getDashboardMetrics(timeRange),
          apiClient.getCategoryDistribution(),
          apiClient.getSummaryStats(timeRange)
        ]);

        setDashboardData(metricsData as DashboardData);
        setCategoryData(categoryResponse as CategoryData[]);
        setSummaryStats(statsData as SummaryStats);
        // topDisputedItems is now hard-coded above
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Derived helpers for percentage change calculations
  const getPercentageChange = (values: number[]) => {
    if (values.length < 2) return 0;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    if (firstValue === 0) return lastValue > 0 ? 100 : 0;
    return Math.round(((lastValue - firstValue) / firstValue) * 100);
  };

  const suspiciousValues = dashboardData.suspiciousDisputes.map(d => d.value);
  const approvedValues = dashboardData.approvedDisputes.map(d => d.value);
  const percentSeries = dashboardData.suspiciousDisputes.map((s, i) => {
    const val = s.value === 0 ? 0 : ((dashboardData.approvedDisputes[i]?.value || 0) / s.value) * 100;
    return parseFloat(val.toFixed(1));
  });

  const chgSuspicious = getPercentageChange(suspiciousValues);
  const chgApproved = getPercentageChange(approvedValues);
  const chgPercent = getPercentageChange(percentSeries);

  const getChartData = () => {
    if (selectedMetric === 'suspiciousDisputes') return dashboardData.suspiciousDisputes;
    if (selectedMetric === 'approvedDisputes') return dashboardData.approvedDisputes;

    return dashboardData.suspiciousDisputes.map((suspicious, index) => ({
      date: suspicious.date,
      value: suspicious.value === 0 ? 0 : ((dashboardData.approvedDisputes[index]?.value || 0) / suspicious.value) * 100,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-muted/60 border border-slate-800 rounded-lg animate-pulse" />
          <div className="h-28 bg-muted/60 border border-slate-800 rounded-lg animate-pulse" />
          <div className="h-28 bg-muted/60 border border-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted/60 border border-slate-800 rounded-lg animate-pulse" />
          <div className="h-96 bg-muted/60 border border-slate-800 rounded-lg animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header Skeleton */}
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-slate-700">
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
              
              {/* Table Rows Skeleton */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800/50">
                  <div className="h-4 w-32 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Company Profile</h2>
        <Select
          value={timeRange}
          onValueChange={(value: '7d' | '1m' | '3m' | '1y') =>
            setTimeRange(value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="1m">30 Days</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`relative cursor-pointer transition-colors hover:bg-slate-800/50 ${
            selectedMetric === 'suspiciousDisputes' ? 'ring-2 ring-primary/70' : ''
          }`}
          onClick={() => setSelectedMetric('suspiciousDisputes')}
        >
          <CardHeader>
            <ShieldAlert className="absolute top-4 right-4 h-5 w-5 text-primary/80" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspicious Disputes
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.totalSuspiciousDisputes.toLocaleString()}
            </CardDescription>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {chgSuspicious >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
{chgSuspicious >= 0 ? '+' : ''}{chgSuspicious}%
              </span>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={`relative cursor-pointer transition-colors hover:bg-slate-800/50 ${
            selectedMetric === 'approvedDisputes' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('approvedDisputes')}
        >
          <CardHeader>
            <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-muted-foreground/80" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Disputes
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.totalApprovedDisputes.toLocaleString()}
            </CardDescription>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {chgApproved >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
{chgApproved >= 0 ? '+' : ''}{chgApproved}%
              </span>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={`relative cursor-pointer transition-colors hover:bg-slate-800/50 ${
            selectedMetric === 'percentage' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('percentage')}
        >
          <CardHeader>
            <TrendingUp className="absolute top-4 right-4 h-5 w-5 text-muted-foreground/80" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.approvalRate}%
            </CardDescription>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {chgPercent >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
{chgPercent >= 0 ? '+' : ''}{chgPercent}%
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {selectedMetric === 'suspiciousDisputes' && 'Suspicious Dispute Trends'}
              {selectedMetric === 'approvedDisputes' && 'Approved Dispute Trends'}
              {selectedMetric === 'percentage' && 'Approval Rate Trends'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {selectedMetric === 'percentage'
                ? 'Percentage over time'
                : 'Volume over time'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--foreground))',
                      padding: '6px 8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (selectedMetric === 'percentage') {
                        return [`${value.toFixed(1)}%`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="none" fill="url(#lineGradient)" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                  />
                </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Disputed Categories
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribution of disputes by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <div className="max-h-80 overflow-y-auto pr-3 space-y-3 px-1 thin-scrollbar">
                {(showAllCategories ? categoryData : categoryData.slice(0, 6)).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border transform origin-center ${
                      hoveredCategoryIndex === index 
                        ? 'bg-slate-700/40 border-slate-600 scale-[1.01]' 
                        : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-700/30 hover:border-slate-600/50'
                    }`}
                    onMouseEnter={() => setHoveredCategoryIndex(index)}
                    onMouseLeave={() => setHoveredCategoryIndex(null)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-200">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300 bg-slate-400"
                          style={{ width: `${entry.value}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white min-w-[3rem] text-right">
                        {entry.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {categoryData.length > 6 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="flex items-center gap-2 w-full py-2 px-3 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/40 border border-slate-700/50 hover:border-slate-600"
                  >
                    {showAllCategories ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less ({categoryData.length - 6} hidden)
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show More ({categoryData.length - 6} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Disputed Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Most Disputed Items
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Items with the highest number of disputes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Item</TableHead>
                <TableHead className="text-muted-foreground">
                  Total Disputes
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Last Dispute
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Product Link
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDisputedItems.map((item, index) => (
                <TableRow key={index} className="border-border hover:bg-slate-800/40 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    {item.item}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {item.disputes}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lastDispute}
                  </TableCell>
                  <TableCell>
                    <a
                      href={item.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      View Item
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
