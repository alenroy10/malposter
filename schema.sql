-- 
-- PostgreSQL Database Schema for AI-Powered Social Media Posting System
-- 

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    grade VARCHAR(100),
    size VARCHAR(100),
    weight VARCHAR(100),
    price VARCHAR(100),
    currency VARCHAR(10),
    minimum_order VARCHAR(100),
    origin VARCHAR(150),
    features TEXT[], -- Array of features
    availability VARCHAR(50),
    shipping VARCHAR(150),
    contact VARCHAR(100),
    language VARCHAR(50) DEFAULT 'Malayalam',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uploads Table
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image' or 'audio'
    storage_provider VARCHAR(50) DEFAULT 'cloudinary', -- 'cloudinary' or 's3'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Results / Transcripts Table
CREATE TABLE ai_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    raw_ai_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Captions Table
CREATE TABLE generated_captions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    facebook_caption TEXT NOT NULL,
    instagram_caption TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social Accounts Table
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook' or 'instagram'
    account_name VARCHAR(150) NOT NULL,
    access_token TEXT NOT NULL,
    external_account_id VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social Posts & Publishing History Table
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook' or 'instagram'
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    external_post_id VARCHAR(150),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Logs Table
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    log_type VARCHAR(50) NOT NULL, -- 'info', 'warn', 'error', 'success'
    message TEXT NOT NULL,
    execution_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for optimized performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_social_posts_product_id ON social_posts(product_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
