import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface ClaimItem {
  item_name: string;
  category: string;
  price: number;
  quantity: number;
  url?: string;
}

interface MLAnalysisResult {
  fraud_score: number;
  confidence: number;
  risk_factors: Array<{
    pattern: string;
    relevance_score: number;
    risk_weight: number;
  }>;
  recommendations: string[];
  behavior_analysis: string;
  user_profile: {
    risk_score: number;
    is_flagged: boolean;
    total_claims: number;
    name?: string;
    email?: string;
  };
  historical_summary: {
    total_claims: number;
    total_value: number;
    avg_claim_value: number;
    most_common_categories: Array<{
      category: string;
      count: number;
    }>;
    recent_claims_30d: number;
  };
}

interface UserRiskProfile {
  user_id: string;
  user_profile: {
    risk_score: number;
    is_flagged: boolean;
    total_claims: number;
    name?: string;
    email?: string;
  };
  historical_summary: {
    total_claims: number;
    total_value: number;
    avg_claim_value: number;
    most_common_categories: Array<{
      category: string;
      count: number;
    }>;
    recent_claims_30d: number;
  };
  risk_indicators: {
    current_risk_score: number;
    is_flagged: boolean;
    claim_frequency: string;
    avg_claim_value: number;
  };
}

const MLFraudDetection: React.FC = () => {
  const [userId, setUserId] = useState('550e8400-e29b-41d4-a716-446655440001');
  const [claimItems, setClaimItems] = useState<ClaimItem[]>([
    { item_name: '', category: '', price: 0, quantity: 1 }
  ]);
  const [analysisResult, setAnalysisResult] = useState<MLAnalysisResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserRiskProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addClaimItem = () => {
    setClaimItems([...claimItems, { item_name: '', category: '', price: 0, quantity: 1 }]);
  };

  const removeClaimItem = (index: number) => {
    if (claimItems.length > 1) {
      setClaimItems(claimItems.filter((_, i) => i !== index));
    }
  };

  const updateClaimItem = (index: number, field: keyof ClaimItem, value: string | number) => {
    const updated = [...claimItems];
    updated[index] = { ...updated[index], [field]: value };
    setClaimItems(updated);
  };

  const analyzeClaimFraud = async () => {
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    const validItems = claimItems.filter(item => 
      item.item_name.trim() && item.category.trim() && item.price > 0
    );

    if (validItems.length === 0) {
      setError('Please add at least one valid claim item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiClient.analyzeClaimFraud({
        user_id: userId,
        claim_data: validItems
      });

      setAnalysisResult(result as MLAnalysisResult);
    } catch (error: any) {
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithML = async () => {
    // Validate inputs
    const validItems = claimItems.filter(item => 
      item.item_name.trim() && 
      item.category.trim() && 
      item.price > 0 && 
      item.quantity > 0
    );

    if (!userId.trim()) {
      setError('Please enter a valid User ID');
      return;
    }

    if (validItems.length === 0) {
      setError('Please add at least one valid claim item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiClient.submitClaimWithML({
        user_id: userId,
        claim_context: {
          store_id: "00000000-0000-0000-0000-000000000001", // Default store ID
          email_at_store: "test@example.com", // Default email
          claim_data: validItems
        }
      });

      setAnalysisResult(result as MLAnalysisResult);
    } catch (error: any) {
      setError(`Submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserRiskProfile = async () => {
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profile = await apiClient.getUserRiskProfile(userId);
      setUserProfile(profile as UserRiskProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user profile');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskScoreIcon = (score: number) => {
    if (score >= 80) return <XCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ML Fraud Detection</h1>
          <p className="text-gray-600">AI-powered fraud analysis using Cohere's advanced ML models</p>
        </div>
      </div>

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyze">Analyze Claim</TabsTrigger>
          <TabsTrigger value="profile">User Risk Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fraud Analysis Input
              </CardTitle>
              <CardDescription>
                Enter claim details to analyze fraud risk using advanced ML algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (UUID)</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Claim Items</Label>
                  <Button onClick={addClaimItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {claimItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                        <Input
                          id={`item-name-${index}`}
                          value={item.item_name}
                          onChange={(e) => updateClaimItem(index, 'item_name', e.target.value)}
                          placeholder="e.g., iPhone 15 Pro"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`category-${index}`}>Category</Label>
                        <Input
                          id={`category-${index}`}
                          value={item.category}
                          onChange={(e) => updateClaimItem(index, 'category', e.target.value)}
                          placeholder="e.g., electronics"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${index}`}>Price ($)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateClaimItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`quantity-${index}`}>Qty</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateClaimItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        {claimItems.length > 1 && (
                          <Button
                            onClick={() => removeClaimItem(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={analyzeClaimFraud} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Analyzing...' : 'Analyze Fraud Risk'}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Main Score Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="h-6 w-6 text-blue-600" />
                      ML Fraud Analysis Results
                    </span>
                    <Badge className={`text-lg px-4 py-2 ${getRiskScoreColor(analysisResult.fraud_score)}`}>
                      {getRiskScoreIcon(analysisResult.fraud_score)}
                      {analysisResult.fraud_score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{analysisResult.fraud_score}</div>
                      <div className="text-sm text-gray-600">Fraud Risk Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {analysisResult.risk_factors.length}
                      </div>
                      <div className="text-sm text-gray-600">Risk Factors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User & Historical Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Current Risk Score:</span>
                      <Badge className={getRiskScoreColor(analysisResult.user_profile.risk_score)}>
                        {analysisResult.user_profile.risk_score}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Flagged Status:</span>
                      <Badge variant={analysisResult.user_profile.is_flagged ? "destructive" : "secondary"}>
                        {analysisResult.user_profile.is_flagged ? "Flagged" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Claims:</span>
                      <span className="font-medium">{analysisResult.user_profile.total_claims}</span>
                    </div>
                    {analysisResult.user_profile.name && (
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{analysisResult.user_profile.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Historical Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Claims:</span>
                      <span className="font-medium">{analysisResult.historical_summary.total_claims}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">${analysisResult.historical_summary.total_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Claim Value:</span>
                      <span className="font-medium">${analysisResult.historical_summary.avg_claim_value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Claims (30d):</span>
                      <span className="font-medium">{analysisResult.historical_summary.recent_claims_30d}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {/* User Profile Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Risk Profile Lookup
              </CardTitle>
              <CardDescription>
                Get comprehensive risk analysis for any user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="profileUserId">User ID (UUID)</Label>
                  <Input
                    id="profileUserId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={getUserRiskProfile} disabled={loading}>
                    {loading ? 'Loading...' : 'Get Profile'}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* User Profile Results */}
          {userProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Risk Score:</span>
                    <Badge className={getRiskScoreColor(userProfile.risk_indicators.current_risk_score)}>
                      {userProfile.risk_indicators.current_risk_score}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={userProfile.risk_indicators.is_flagged ? "destructive" : "secondary"}>
                      {userProfile.risk_indicators.is_flagged ? "Flagged" : "Normal"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Claim Frequency:</span>
                    <Badge variant="outline">{userProfile.risk_indicators.claim_frequency}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Claim Value:</span>
                    <span className="font-medium">${userProfile.risk_indicators.avg_claim_value.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {userProfile.historical_summary.total_claims}
                      </div>
                      <div className="text-sm text-blue-800">Total Claims</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${userProfile.historical_summary.total_value.toFixed(0)}
                      </div>
                      <div className="text-sm text-green-800">Total Value</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Most Common Categories:</Label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.historical_summary.most_common_categories.slice(0, 5).map((cat, index) => (
                        <Badge key={index} variant="outline">
                          {cat.category} ({cat.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLFraudDetection;
