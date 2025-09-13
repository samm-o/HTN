import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock order data (same as Orders.tsx - in a real app this would come from API)
const orderData = {
  "ORD-001": {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    total: 149.99,
    items: [
      {
        id: "1",
        name: "Wireless Headphones",
        category: "Electronics",
        price: 149.99,
        image: "/placeholder.svg",
        quantity: 1,
        productLink: "/products/wireless-headphones"
      }
    ]
  },
  "ORD-002": {
    id: "ORD-002", 
    date: "2024-01-10",
    status: "delivered",
    total: 299.98,
    items: [
      {
        id: "2",
        name: "Smart Watch",
        category: "Electronics",
        price: 199.99,
        image: "/placeholder.svg",
        quantity: 1,
        productLink: "/products/smart-watch"
      },
      {
        id: "3",
        name: "Phone Case",
        category: "Accessories",
        price: 99.99,
        image: "/placeholder.svg",
        quantity: 1,
        productLink: "/products/phone-case"
      }
    ]
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2024-01-05",
    status: "delivered", 
    total: 79.99,
    items: [
      {
        id: "4",
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 79.99,
        image: "/placeholder.svg",
        quantity: 1,
        productLink: "/products/bluetooth-speaker"
      }
    ]
  }
};

const issueOptions = [
  { id: "not-received", label: "I did not receive the product" },
  { id: "package-empty", label: "Package was empty" },
  { id: "wrong-item", label: "Received wrong item" },
  { id: "damaged", label: "Item was damaged" },
  { id: "defective", label: "Item is defective" }
];

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const order = orderId ? orderData[orderId as keyof typeof orderData] : null;

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  const handleIssueChange = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueId]);
    } else {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId));
    }
  };

  const handleSubmitClaim = () => {
    if (selectedIssues.length === 0) return;
    
    // Calculate center position for KYC window
    const width = 500;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    // Open KYC platform in new centered window
    const kycWindow = window.open(
      '/kyc-platform', 
      'kyc-verification',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // Listen for KYC completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'KYC_COMPLETE') {
        window.removeEventListener('message', handleMessage);
        navigate("/verification-pending");
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback in case window is closed without completion
    const checkClosed = setInterval(() => {
      if (kycWindow?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/orders")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </Button>
          </div>

          <div className="grid gap-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">Order {order.id}</CardTitle>
                    <p className="text-text-subtle">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      {order.status}
                    </Badge>
                    <p className="text-xl font-semibold">${order.total}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items in this order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg bg-surface-elevated">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-text-subtle">Category: {item.category}</p>
                        <p className="text-sm text-text-subtle">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.price}</p>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Product
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Issue Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report an Issue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showClaimForm ? (
                  <div className="text-center py-8">
                    <p className="text-text-subtle mb-4">
                      Having trouble with this order? Let us know what happened.
                    </p>
                    <Button onClick={() => setShowClaimForm(true)}>
                      Report Issue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">What issue are you experiencing?</h4>
                      <div className="space-y-3">
                        {issueOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={option.id}
                              checked={selectedIssues.includes(option.id)}
                              onCheckedChange={(checked) => 
                                handleIssueChange(option.id, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={option.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleSubmitClaim}
                        disabled={selectedIssues.length === 0}
                      >
                        Submit Claim
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowClaimForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;