import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder claims generator
const generateClaims = (count = 125) => {
  const claims = [] as Array<{
    claimId: string;
    userId: string;
    product: string;
    category: string;
    amountCents: number;
    date: string;
    status: "Pending" | "Approved" | "Rejected";
  }>;

  const products = [
    "iPhone 15 Pro",
    "MacBook Pro 14",
    "Dyson V15",
    "Nike AF1",
    "Kindle Paperwhite",
    "Samsung QLED 65\"",
  ];
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"];
  const statuses = ["Pending", "Approved", "Rejected"] as const;

  for (let i = 1; i <= count; i++) {
    const amountCents = Math.floor(Math.random() * 120000) + 1999; // $19.99 - $1,200.00
    const monthDay = Math.floor(Math.random() * 27) + 1;
    claims.push({
      claimId: `clm-${i.toString().padStart(5, "0")}`,
      userId: `usr-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`,
      product: products[Math.floor(Math.random() * products.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      amountCents,
      date: new Date(2024, 0, monthDay).toISOString().split("T")[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return claims;
};

const ITEMS_PER_PAGE = 10;

export default function Claims() {
  const [claims] = useState(generateClaims());
  const [page, setPage] = useState(1);
  const [preloadedPages, setPreloadedPages] = useState<Map<number, any[]>>(new Map());

  const totalPages = Math.ceil(claims.length / ITEMS_PER_PAGE);
  
  const pageSlice = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return claims.slice(start, end);
  }, [claims, page]);

  // Preload next page data
  useEffect(() => {
    const preloadNextPage = () => {
      const nextPage = page + 1;
      if (nextPage <= totalPages && !preloadedPages.has(nextPage)) {
        const start = (nextPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const nextPageData = claims.slice(start, end);
        
        setPreloadedPages(prev => new Map(prev).set(nextPage, nextPageData));
      }
    };

    // Preload after a short delay to simulate API call preparation
    const timer = setTimeout(preloadNextPage, 100);
    return () => clearTimeout(timer);
  }, [page, totalPages, claims, preloadedPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Claims</h2>
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, claims.length)} of {claims.length} claims
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Claims Table</CardTitle>
          <CardDescription className="text-muted-foreground">Placeholder data with pagination</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Claim ID</TableHead>
                <TableHead className="text-muted-foreground">User ID</TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageSlice.map((c) => (
                <TableRow key={c.claimId} className="border-border">
                  <TableCell className="font-mono text-sm text-foreground">{c.claimId}</TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{c.userId}</TableCell>
                  <TableCell className="text-foreground">{c.product}</TableCell>
                  <TableCell className="text-muted-foreground">{c.category}</TableCell>
                  <TableCell className="text-foreground">${(c.amountCents / 100).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{c.date}</TableCell>
                  <TableCell className={
                    c.status === "Approved"
                      ? "text-emerald-400"
                      : c.status === "Rejected"
                      ? "text-red-400"
                      : "text-amber-400"
                  }>
                    {c.status}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-primary hover:bg-accent">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextPage = Math.min(page + 1, totalPages);
                setPage(nextPage);
              }}
              disabled={page === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
