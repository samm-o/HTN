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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Tooltip as ReTooltip, Area, Sector } from 'recharts';
import { ShieldAlert, CheckCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import CountUp from '@/components/ui/count-up';
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

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#E5E7EB"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={0.5}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
  const [topDisputedItems, setTopDisputedItems] = useState<TopDisputedItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalSuspiciousDisputes: 0,
    totalApprovedDisputes: 0,
    approvalRate: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, categoryResponse, topItemsData, statsData] = await Promise.all([
          apiClient.getDashboardMetrics(timeRange),
          apiClient.getCategoryDistribution(),
          apiClient.getTopDisputedItems(5),
          apiClient.getSummaryStats(timeRange)
        ]);

        setDashboardData(metricsData as DashboardData);
        setCategoryData(categoryResponse as CategoryData[]);
        setTopDisputedItems(topItemsData as TopDisputedItem[]);
        setSummaryStats(statsData as SummaryStats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Derived helpers for secondary metrics
  const average = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1));
  const change = (values: number[]) => (values.length > 1 ? values[values.length - 1] - values[0] : 0);

  const suspiciousValues = dashboardData.suspiciousDisputes.map(d => d.value);
  const approvedValues = dashboardData.approvedDisputes.map(d => d.value);
  const percentSeries = dashboardData.suspiciousDisputes.map((s, i) => {
    const val = ((dashboardData.approvedDisputes[i]?.value || 0) / s.value) * 100;
    return parseFloat(val.toFixed(1));
  });

  const avgSuspicious = average(suspiciousValues);
  const chgSuspicious = change(suspiciousValues);
  const avgApproved = average(approvedValues);
  const chgApproved = change(approvedValues);
  const avgPercent = Math.round(average(percentSeries));
  const chgPercent = Math.round(change(percentSeries));

  const getChartData = () => {
    if (selectedMetric === 'suspiciousDisputes') return dashboardData.suspiciousDisputes;
    if (selectedMetric === 'approvedDisputes') return dashboardData.approvedDisputes;

    return dashboardData.suspiciousDisputes.map((suspicious, index) => ({
      date: suspicious.date,
      value: ((dashboardData.approvedDisputes[index]?.value || 0) / suspicious.value) * 100,
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
        <div className="bg-muted/60 border border-slate-800 rounded-lg p-6">
          <SkeletonLoader rows={5} />
        </div>
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
            <SelectItem value="1m">1 Month</SelectItem>
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
              <CountUp to={summaryStats.totalSuspiciousDisputes} separator="," duration={0.6} />
            </CardDescription>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Avg: {avgSuspicious.toLocaleString()}</span>
              <span className="flex items-center gap-1">
                {chgSuspicious >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                {Math.abs(chgSuspicious).toLocaleString()} since start
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
              <CountUp to={summaryStats.totalApprovedDisputes} separator="," duration={0.6} />
            </CardDescription>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Avg: {avgApproved.toLocaleString()}</span>
              <span className="flex items-center gap-1">
                {chgApproved >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                {Math.abs(chgApproved).toLocaleString()} since start
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
              <CountUp to={summaryStats.approvalRate} separator="," duration={0.6} />%
            </CardDescription>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Avg: {avgPercent}%</span>
              <span className="flex items-center gap-1">
                {chgPercent >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                )}
                {Math.abs(chgPercent)}% since start
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
            <div className="h-80">
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
            <div className="h-96 flex flex-col">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      labelLine={false}
                      label={renderCustomLabel}
                      dataKey="value"
                      activeIndex={hoveredCategoryIndex ?? -1}
                      activeShape={(props: any) => (
                        <Sector {...props} outerRadius={props.outerRadius + 6} />
                      )}
                      onMouseEnter={(_, idx) => setHoveredCategoryIndex(idx)}
                      onMouseLeave={() => setHoveredCategoryIndex(null)}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={
                            hoveredCategoryIndex === null || hoveredCategoryIndex === index ? 1 : 0.5
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 cursor-pointer rounded hover:bg-slate-800/40 transition-colors"
                    onMouseEnter={() => setHoveredCategoryIndex(index)}
                    onMouseLeave={() => setHoveredCategoryIndex(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground font-medium">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm text-foreground font-semibold">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
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
