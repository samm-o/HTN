import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";

const VerificationPending = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Verification Pending</CardTitle>
              <p className="text-text-subtle">
                Your claim has been submitted and is currently under review.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-surface-elevated rounded-lg p-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium">Identity Verification</p>
                      <p className="text-sm text-text-subtle">
                        Your identity has been verified through our KYC process.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Claim Review</p>
                      <p className="text-sm text-text-subtle">
                        Our team will review your claim and supporting documentation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Resolution</p>
                      <p className="text-sm text-text-subtle">
                        You'll receive an email with the outcome and next steps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-text-subtle">
                  <strong>Timeline:</strong> Most claims are processed within 3-5 business days. 
                  You'll receive email updates on the progress of your claim.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/orders" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Orders
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerificationPending;