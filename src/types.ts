/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ProductData {
  product: string;
  category: string;
  grade: string;
  size: string;
  weight: string;
  price: string;
  currency: string;
  minimum_order: string;
  origin: string;
  features: string[];
  availability: string;
  shipping: string;
  contact: string;
  language: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  extractedData: ProductData;
  imageUrl: string;
  audioUrl: string;
  transcript: string;
  createdAt: string;
}

export interface GeneratedCaption {
  id: string;
  productId: string;
  facebook: string;
  instagram: string;
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  isActive: boolean;
  connectedAt: string;
}

export interface SocialPost {
  id: string;
  productId: string;
  platform: 'facebook' | 'instagram';
  caption: string;
  imageUrl: string;
  status: 'pending' | 'success' | 'failed';
  externalPostId?: string;
  errorMessage?: string;
  retryCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  executionTime?: number; // in milliseconds
  timestamp: string;
}

export interface SystemSettings {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  openaiApiKey: string;
  metaFacebookPageId: string;
  metaFacebookAccessToken: string;
  metaInstagramBusinessId: string;
  metaInstagramAccessToken: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  defaultHashtags: string;
  language: string;
  theme: 'light' | 'dark';
}

export interface DashboardStats {
  totalProducts: number;
  totalPosts: number;
  successRate: number;
  pendingPosts: number;
  failedPosts: number;
  postsByPlatform: {
    facebook: number;
    instagram: number;
  };
  recentPostActivity: {
    date: string;
    count: number;
  }[];
}
