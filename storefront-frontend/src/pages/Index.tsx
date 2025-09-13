import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, Shield, Users } from "lucide-react";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">
            Simple. Secure. <span className="text-muted-foreground">Shopping.</span>
          </h1>
          <p className="text-xl text-text-subtle mb-8 max-w-2xl mx-auto">
            Experience seamless online shopping with complete order protection and transparent claims process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button size="lg" className="w-full sm:w-auto">
                View Your Orders
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Browse Products
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-surface-elevated">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose StoreFront?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-subtle">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-subtle">
                  Browse and purchase with confidence. Simple checkout, fast delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-subtle">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Order Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-subtle">
                  Complete protection for your orders. Quick claims process with transparent verification.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-subtle">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Customer First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-subtle">
                  Dedicated support team ready to help with any issues or questions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <Package className="mx-auto h-16 w-16 text-primary mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-text-subtle mb-8">
            Join thousands of satisfied customers who trust StoreFront for their online shopping needs.
          </p>
          <Link to="/orders">
            <Button size="lg">
              Check Your Orders
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
