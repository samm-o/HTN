import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package } from "lucide-react";
import Navigation from "@/components/Navigation";

// Mock order data
const orders = [
  {
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
        quantity: 1
      }
    ]
  },
  {
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
        quantity: 1
      },
      {
        id: "3",
        name: "Phone Case",
        category: "Accessories",
        price: 99.99,
        image: "/placeholder.svg",
        quantity: 1
      }
    ]
  },
  {
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
        quantity: 1
      }
    ]
  }
];

const Orders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <Package className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Order History</h1>
          </div>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-medium transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">Order {order.id}</CardTitle>
                      <p className="text-text-subtle text-sm">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {order.status}
                      </Badge>
                      <p className="font-semibold">${order.total}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-surface-elevated">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-text-subtle">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.price}</p>
                          <p className="text-sm text-text-subtle">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;