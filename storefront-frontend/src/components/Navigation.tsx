import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, User, ShoppingBag } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-semibold text-lg">StoreFront</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/orders">
              <Button 
                variant={location.pathname === "/orders" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;