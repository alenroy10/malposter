# 
# SQLAlchemy ORM Database Models for Python/FastAPI Deployments
# 

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, DateTime, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserModel(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = relationship("ProductModel", back_populates="user", cascade="all, delete-orphan")
    social_accounts = relationship("SocialAccountModel", back_populates="user", cascade="all, delete-orphan")


class ProductModel(Base):
    __tablename__ = 'products'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    grade = Column(String(100))
    size = Column(String(100))
    weight = Column(String(100))
    price = Column(String(100))
    currency = Column(String(10))
    minimum_order = Column(String(100))
    origin = Column(String(150))
    features = Column(ARRAY(Text)) # Array of strings for product features
    availability = Column(String(50))
    shipping = Column(String(150))
    contact = Column(String(100))
    language = Column(String(50), default='Malayalam')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="products")
    uploads = relationship("UploadModel", back_populates="product", cascade="all, delete-orphan")
    ai_results = relationship("AIResultModel", back_populates="product", cascade="all, delete-orphan")
    captions = relationship("GeneratedCaptionModel", back_populates="product", cascade="all, delete-orphan")
    social_posts = relationship("SocialPostModel", back_populates="product", cascade="all, delete-orphan")


class UploadModel(Base):
    __tablename__ = 'uploads'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    file_url = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False) # 'image' or 'audio'
    storage_provider = Column(String(50), default='cloudinary') # 'cloudinary' or 's3'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("ProductModel", back_populates="uploads")


class AIResultModel(Base):
    __tablename__ = 'ai_results'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    transcript = Column(Text, nullable=False)
    raw_ai_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("ProductModel", back_populates="ai_results")


class GeneratedCaptionModel(Base):
    __tablename__ = 'generated_captions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    facebook_caption = Column(Text, nullable=False)
    instagram_caption = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("ProductModel", back_populates="captions")


class SocialAccountModel(Base):
    __tablename__ = 'social_accounts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    platform = Column(String(50), nullable=False) # 'facebook' or 'instagram'
    account_name = Column(String(150), nullable=False)
    access_token = Column(Text, nullable=False)
    external_account_id = Column(String(150), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    connected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="social_accounts")


class SocialPostModel(Base):
    __tablename__ = 'social_posts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    platform = Column(String(50), nullable=False) # 'facebook' or 'instagram'
    caption = Column(Text, nullable=False)
    image_url = Column(Text, nullable=False)
    status = Column(String(50), default='pending') # 'pending', 'success', 'failed'
    external_post_id = Column(String(150), nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("ProductModel", back_populates="social_posts")


class LogModel(Base):
    __tablename__ = 'logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    log_type = Column(String(50), nullable=False) # 'info', 'warn', 'error', 'success'
    message = Column(Text, nullable=False)
    execution_time_ms = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
