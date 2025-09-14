// API configuration and helper functions for Project BASTION frontend

const API_BASE_URL = 'http://localhost:8000';

// API client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Analytics endpoints
  async getDashboardMetrics(timeRange: string = '7d') {
    return this.request(`/api/v1/analytics/dashboard-metrics?time_range=${timeRange}`);
  }

  async getCategoryDistribution() {
    return this.request('/api/v1/analytics/category-distribution');
  }

  async getTopDisputedItems(limit: number = 5) {
    return this.request(`/api/v1/analytics/top-disputed-items?limit=${limit}`);
  }

  async getSummaryStats(timeRange: string = '7d') {
    return this.request(`/api/v1/analytics/summary-stats?time_range=${timeRange}`);
  }

  // Users endpoints
  async getUsersList(page: number = 1, limit: number = 10) {
    return this.request(`/api/v1/admin/users/list?page=${page}&limit=${limit}`);
  }

  async getUserDetails(userId: string) {
    return this.request(`/api/v1/admin/users/${userId}/details`);
  }

  async getUserDisputes(userId: string, page: number = 1, limit: number = 10) {
    return this.request(`/api/v1/admin/users/${userId}/disputes?page=${page}&limit=${limit}`);
  }

  // Claims endpoints
  async submitClaim(payload: any) {
    return this.request('/api/v1/claims/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin endpoints
  async getFlaggedClaims(limit: number = 100) {
    return this.request(`/api/v1/admin/flagged-claims?limit=${limit}`);
  }

  async getClaim(claimId: string) {
    return this.request(`/api/v1/admin/${claimId}`);
  }

  async updateClaimStatus(claimId: string, status: string) {
    return this.request(`/api/v1/admin/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Stores endpoints
  async getStores() {
    return this.request('/api/v1/stores');
  }

  async createStore(name: string) {
    return this.request('/api/v1/stores', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getStoreClaims(storeId: string, limit: number = 50) {
    return this.request(`/api/v1/stores/${storeId}/claims?limit=${limit}`);
  }

  // ML Fraud Detection endpoints
  async analyzeClaimFraud(payload: any) {
    return this.request('/api/v1/ml-fraud/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitClaimWithML(payload: any) {
    return this.request('/api/v1/ml-fraud/submit-with-ml', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserRiskProfile(userId: string) {
    return this.request(`/api/v1/ml-fraud/user/${userId}/risk-profile`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for TypeScript
export interface DashboardMetrics {
  suspiciousDisputes: Array<{ date: string; value: number }>;
  approvedDisputes: Array<{ date: string; value: number }>;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TopDisputedItem {
  item: string;
  category: string;
  disputes: number;
  lastDispute: string;
  productLink: string;
}

export interface SummaryStats {
  totalSuspiciousDisputes: number;
  totalApprovedDisputes: number;
  approvalRate: number;
}

export interface User {
  uuid: string;
  email: string;
  totalSuspiciousDisputes: number;
  disputesApproved: number;
  lastDisputeDate: string;
}

export interface UserDetails {
  user: {
    uuid: string;
    email: string;
    totalSuspiciousDisputes: number;
    disputesApproved: number;
    approvalRate: number;
    memberSince: string;
  };
  disputeHistory: Array<{
    date: string;
    company: string;
    category: string;
    items: string;
    itemLink: string;
    status: string;
    riskScore: number;
    isFlagged: boolean;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
