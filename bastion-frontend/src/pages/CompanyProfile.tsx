import { useState } from 'react';
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

// Sample data with real dates
const timeRangeData = {
  '7d': {
    suspiciousDisputes: [
      { date: 'Sep 6', value: 145 },
      { date: 'Sep 7', value: 162 },
      { date: 'Sep 8', value: 178 },
      { date: 'Sep 9', value: 156 },
      { date: 'Sep 10', value: 187 },
      { date: 'Sep 11', value: 203 },
      { date: 'Sep 12', value: 198 },
    ],
    approvedDisputes: [
      { date: 'Sep 6', value: 118 },
      { date: 'Sep 7', value: 135 },
      { date: 'Sep 8', value: 142 },
      { date: 'Sep 9', value: 125 },
      { date: 'Sep 10', value: 149 },
      { date: 'Sep 11', value: 162 },
      { date: 'Sep 12', value: 158 },
    ],
  },
  '1m': {
    suspiciousDisputes: [
      { date: 'Aug 16', value: 1250 },
      { date: 'Aug 23', value: 1380 },
      { date: 'Aug 30', value: 1190 },
      { date: 'Sep 6', value: 1420 },
    ],
    approvedDisputes: [
      { date: 'Aug 16', value: 1000 },
      { date: 'Aug 23', value: 1104 },
      { date: 'Aug 30', value: 952 },
      { date: 'Sep 6', value: 1136 },
    ],
  },
  '3m': {
    suspiciousDisputes: [
      { date: 'Jun 13', value: 5240 },
      { date: 'Jul 13', value: 5680 },
      { date: 'Aug 13', value: 5120 },
    ],
    approvedDisputes: [
      { date: 'Jun 13', value: 4192 },
      { date: 'Jul 13', value: 4544 },
      { date: 'Aug 13', value: 4096 },
    ],
  },
  '1y': {
    suspiciousDisputes: [
      { date: 'Q4 2023', value: 18420 },
      { date: 'Q1 2024', value: 19850 },
      { date: 'Q2 2024', value: 21200 },
      { date: 'Q3 2024', value: 20100 },
    ],
    approvedDisputes: [
      { date: 'Q4 2023', value: 14736 },
      { date: 'Q1 2024', value: 15880 },
      { date: 'Q2 2024', value: 16960 },
      { date: 'Q3 2024', value: 16080 },
    ],
  },
};

const categoryData = [
  { name: 'Electronics', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Clothing', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Home & Garden', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Sports', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'Books', value: 8, color: 'hsl(var(--chart-5))' },
];

const topDisputedItems = [
  {
    item: 'iPhone 15 Pro Max',
    category: 'Electronics',
    disputes: 43,
    lastDispute: '2024-01-15',
    productLink: 'https://example.com/products/iphone-15-pro-max',
  },
  {
    item: 'Nike Air Force 1',
    category: 'Clothing',
    disputes: 38,
    lastDispute: '2024-01-14',
    productLink: 'https://example.com/products/nike-air-force-1',
  },
  {
    item: 'Samsung 65" QLED TV',
    category: 'Electronics',
    disputes: 35,
    lastDispute: '2024-01-13',
    productLink: 'https://example.com/products/samsung-65-qled-tv',
  },
  {
    item: 'Dyson V15 Vacuum',
    category: 'Home & Garden',
    disputes: 29,
    lastDispute: '2024-01-12',
    productLink: 'https://example.com/products/dyson-v15-vacuum',
  },
  {
    item: 'MacBook Pro 16"',
    category: 'Electronics',
    disputes: 27,
    lastDispute: '2024-01-11',
    productLink: 'https://example.com/products/macbook-pro-16',
  },
];

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

  const currentData = timeRangeData[timeRange];
  const totalSuspiciousDisputes = currentData.suspiciousDisputes.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const totalApprovedDisputes = currentData.approvedDisputes.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const approvalRate = ((totalApprovedDisputes / totalSuspiciousDisputes) * 100).toFixed(1);

  const getChartData = () => {
    if (selectedMetric === 'suspiciousDisputes') return currentData.suspiciousDisputes;
    if (selectedMetric === 'approvedDisputes') return currentData.approvedDisputes;

    return currentData.suspiciousDisputes.map((suspicious, index) => ({
      date: suspicious.date,
      value: ((currentData.approvedDisputes[index]?.value || 0) / suspicious.value) * 100,
    }));
  };

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
              {totalSuspiciousDisputes.toLocaleString()}
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
              {totalApprovedDisputes.toLocaleString()}
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
              {approvalRate}%
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
