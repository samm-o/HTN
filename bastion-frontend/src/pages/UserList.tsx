import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Sample user data
const generateUsers = () => {
  const users = [];
  for (let i = 1; i <= 100; i++) {
    const suspiciousDisputes = Math.floor(Math.random() * 500) + 50;
    const approvedDisputes = Math.floor(Math.random() * suspiciousDisputes * 0.8) + 1;
    users.push({
      uuid: `usr-${i.toString().padStart(6, '0')}-${Math.random().toString(36).substr(2, 6)}`,
      totalSuspiciousDisputes: suspiciousDisputes,
      disputesApproved: approvedDisputes,
      lastDisputeDate: new Date(2024, 0, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0],
    });
  }
  return users;
};

const generateUserDisputes = (userId: string) => {
  const disputes = [];
  const companies = ["Amazon", "eBay", "Shopify Store", "Target", "Walmart", "Best Buy"];
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"];
  
  for (let i = 1; i <= 25; i++) {
    disputes.push({
      date: new Date(2024, 0, Math.floor(Math.random() * 15) + 1).toISOString().split('T')[0],
      company: companies[Math.floor(Math.random() * companies.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      itemLink: `https://example-store.com/item/${Math.floor(Math.random() * 10000)}`,
    });
  }
  return disputes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ITEMS_PER_PAGE = 10;

export default function UserList() {
  const [users] = useState(generateUsers());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserDisputes, setSelectedUserDisputes] = useState<any[]>([]);
  const [disputePage, setDisputePage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, endIndex);

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setSelectedUserDisputes(generateUserDisputes(user.uuid));
    setDisputePage(1);
    setIsModalOpen(true);
  };

  const disputeTotalPages = Math.ceil(selectedUserDisputes.length / ITEMS_PER_PAGE);
  const disputeStartIndex = (disputePage - 1) * ITEMS_PER_PAGE;
  const disputeEndIndex = disputeStartIndex + ITEMS_PER_PAGE;
  const currentDisputes = selectedUserDisputes.slice(disputeStartIndex, disputeEndIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">User List</h2>
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">User Database</CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete list of users with dispute and approval information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">User ID</TableHead>
                <TableHead className="text-muted-foreground">Suspicious Disputes</TableHead>
                <TableHead className="text-muted-foreground">Disputes Approved</TableHead>
                <TableHead className="text-muted-foreground">Last Dispute Date</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell className="font-mono text-sm text-foreground">{user.uuid}</TableCell>
                  <TableCell className="text-foreground">{user.totalSuspiciousDisputes}</TableCell>
                  <TableCell className="text-foreground">{user.disputesApproved}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastDisputeDate}</TableCell>
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
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">User Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detailed information and dispute history
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm text-foreground">{selectedUser.uuid}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Suspicious Disputes</p>
                  <p className="text-lg font-semibold text-foreground">{selectedUser.totalSuspiciousDisputes}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Approved Disputes</p>
                  <p className="text-lg font-semibold text-foreground">{selectedUser.disputesApproved}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                  <p className="text-lg font-semibold text-foreground">
                    {((selectedUser.disputesApproved / selectedUser.totalSuspiciousDisputes) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Dispute History */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Dispute History</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground">Company</TableHead>
                        <TableHead className="text-muted-foreground">Category</TableHead>
                        <TableHead className="text-muted-foreground">Item Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDisputes.map((dispute, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell className="text-foreground">{dispute.date}</TableCell>
                          <TableCell className="text-foreground">{dispute.company}</TableCell>
                          <TableCell className="text-muted-foreground">{dispute.category}</TableCell>
                          <TableCell>
                            <a 
                              href={dispute.itemLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              View Item
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Dispute Pagination */}
                  <div className="flex items-center justify-between p-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisputePage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setDisputePage(prev => Math.min(prev + 1, disputeTotalPages))}
                      disabled={disputePage === disputeTotalPages}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}