import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

// Interfaces for API data
interface User {
  id: string;
  full_name: string;
  created_at: string;
  risk_score: number;
  is_flagged: boolean;
  total_disputes: number;
  pending_disputes: number;
  approved_disputes: number;
  denied_disputes: number;
  last_activity: string;
}

interface UserDetails {
  user: {
    id: string;
    full_name: string;
    created_at: string;
    risk_score: number;
    is_flagged: boolean;
    total_claims: number;
    pending_claims: number;
    approved_claims: number;
    denied_claims: number;
    total_claim_value: number;
  };
  claims: Array<{
    id: string;
    status: string;
    created_at: string;
    store_name: string;
    items: Array<{
      item_name: string;
      category: string;
      price: number;
      quantity: number;
    }>;
    total_value: number;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ITEMS_PER_PAGE = 10;

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [disputePage, setDisputePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preloadedPages, setPreloadedPages] = useState<Map<number, User[]>>(
    new Map()
  );
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = (await apiClient.getUsersList(
          currentPage,
          ITEMS_PER_PAGE
        )) as any;
        setUsers(response.users as User[]);
        setPagination(
          response.pagination || {
            page: 1,
            limit: ITEMS_PER_PAGE,
            total: 0,
            pages: 0,
          }
        );
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Preload next page data
  useEffect(() => {
    const preloadNextPage = async () => {
      const nextPage = currentPage + 1;
      if (nextPage <= pagination.pages && !preloadedPages.has(nextPage)) {
        try {
          const response = (await apiClient.getUsersList(
            nextPage,
            ITEMS_PER_PAGE
          )) as any;
          setPreloadedPages((prev) =>
            new Map(prev).set(nextPage, response.users as User[])
          );
        } catch (err) {
          console.error('Failed to preload next page:', err);
        }
      }
    };

    // Preload after a short delay
    const timer = setTimeout(preloadNextPage, 500);
    return () => clearTimeout(timer);
  }, [currentPage, pagination.pages, preloadedPages]);

  const handleViewDetails = async (user: User) => {
    try {
      const userDetails = await apiClient.getUserDetails(user.id);
      setSelectedUser(userDetails as UserDetails);
      setDisputePage(1);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Failed to load user details. Please try again.');
    }
  };

  const disputeTotalPages = selectedUser
    ? Math.ceil(selectedUser.claims.length / ITEMS_PER_PAGE)
    : 0;
  const disputeStartIndex = (disputePage - 1) * ITEMS_PER_PAGE;
  const disputeEndIndex = disputeStartIndex + ITEMS_PER_PAGE;
  const currentDisputes = selectedUser
    ? selectedUser.claims.slice(disputeStartIndex, disputeEndIndex)
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-800 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header Skeleton */}
              <div className="grid grid-cols-5 gap-4 pb-3 border-b border-slate-700">
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
              </div>

              {/* Table Rows Skeleton */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 py-3 border-b border-slate-800/50"
                >
                  <div className="h-4 w-16 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between pt-6">
              <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="h-9 w-20 bg-slate-800 rounded animate-pulse" />
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
        <h2 className="text-3xl font-bold text-foreground">Customers</h2>
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
          {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of{' '}
          {pagination.total} customers
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Customer Database
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete list of customers with dispute and approval information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">
                  Customer ID
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Fraud Score
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Approval Rate
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Last Dispute Date
                </TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell className="font-mono text-sm text-foreground">
                    {user.id}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {user.risk_score}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {user.total_disputes > 0
                      ? Math.round(
                          (user.approved_disputes / user.total_disputes) * 100
                        )
                      : 0}
                    %
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.last_activity
                      ? new Date(user.last_activity).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                      className="text-primary hover:bg-accent"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.pages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextPage = Math.min(currentPage + 1, pagination.pages);
                setCurrentPage(nextPage);
                // If we have preloaded data, use it immediately
                if (preloadedPages.has(nextPage)) {
                  setUsers(preloadedPages.get(nextPage) || []);
                }
              }}
              disabled={currentPage === pagination.pages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Customer Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto scrollbar-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Customer Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detailed information and dispute history
            </DialogDescription>
            <p className="text-sm text-muted-foreground font-mono mt-2">
              ID: {selectedUser?.user.id}
            </p>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Customer Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Suspicious Disputes
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedUser.user.total_claims}
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Approved Disputes
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedUser.user.approved_claims}
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Approval Rate
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedUser.user.total_claims > 0
                      ? Math.round(
                          (selectedUser.user.approved_claims /
                            selectedUser.user.total_claims) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Fraud Score
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedUser.user.risk_score}
                  </p>
                </div>
              </div>

              {/* Claims History */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Claims History
                </h3>
                {selectedUser.claims.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No claims history available for this user.
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Store
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Total Value
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Item
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Quantity
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDisputes.map((claim, index) => (
                      <TableRow key={index} className="border-border">
                        <TableCell className="text-foreground">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {claim.store_name}
                        </TableCell>
                        <TableCell className="text-foreground">
                          ${claim.total_value.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm">
                            {claim.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="mb-1">
                                {item.item_name}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm">
                            {claim.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="mb-1">
                                {item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              claim.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : claim.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination for disputes */}
                {disputeTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDisputePage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={disputePage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {disputePage} of {disputeTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDisputePage((prev) =>
                          Math.min(prev + 1, disputeTotalPages)
                        )
                      }
                      disabled={disputePage === disputeTotalPages}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
