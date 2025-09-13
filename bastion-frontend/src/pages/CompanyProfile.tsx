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
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CompanyProfile() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard data...</div>
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
          className={`cursor-pointer transition-colors ${
            selectedMetric === 'suspiciousDisputes' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('suspiciousDisputes')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspicious Disputes
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.totalSuspiciousDisputes.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            selectedMetric === 'approvedDisputes' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('approvedDisputes')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Disputes
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.totalApprovedDisputes.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            selectedMetric === 'percentage' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedMetric('percentage')}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {summaryStats.approvalRate}%
            </CardDescription>
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                  <PieChart
                    margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                  >
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={75}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
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
                <TableRow key={index} className="border-border">
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
