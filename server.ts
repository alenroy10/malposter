/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Express App
const app = express();
const PORT = 3000;

// Body parser with 50mb limit for base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Ensure uploads directory exists
const UPLOADS_DIR = isVercel ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Database File Path
const DB_FILE = isVercel ? '/tmp/database.json' : path.join(process.cwd(), 'database.json');

// Default Settings
const DEFAULT_SETTINGS = {
  cloudinaryCloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: '',
  openaiApiKey: '',
  metaFacebookPageId: '',
  metaFacebookAccessToken: '',
  metaInstagramBusinessId: '',
  metaInstagramAccessToken: '',
  companyName: 'Lidex Global',
  companyPhone: '+91 98765 43210',
  companyEmail: 'info@lidexglobal.com',
  defaultHashtags: '#IndianSpices #MalayalamSpices #PremiumQuality #ExportQuality',
  language: 'Malayalam',
  theme: 'light' as const
};

// Database Initialization Helper
function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      users: [
        {
          id: 'user_default',
          name: 'Alen Roy',
          email: 'alen.roy@lidexglobal.com',
          passwordHash: crypto.createHash('sha256').update('password123').digest('hex')
        }
      ],
      products: [
        {
          id: 'prod_1',
          userId: 'user_default',
          name: 'Green Cardamom (8mm Premium)',
          extractedData: {
            product: 'Green Cardamom',
            category: 'Spices',
            grade: '8 mm Bold Premium',
            size: '8 mm',
            weight: '100 kg bags',
            price: '₹2300/kg',
            currency: 'INR',
            minimum_order: '10 kg',
            origin: 'Idukki, Kerala, India',
            features: ['Extra green color', 'Natural aroma', 'Pesticide-free farming', 'Handpicked quality'],
            availability: 'In Stock',
            shipping: 'Worldwide shipping via Air/Sea',
            contact: '+91 98765 43210',
            language: 'Malayalam'
          },
          imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=60',
          audioUrl: '',
          transcript: 'ഇടുക്കിയിൽ നിന്ന് നേരിട്ട് വിളവെടുത്ത എട്ടര മില്ലിമീറ്റർ വലിപ്പമുള്ള നല്ല ഒന്നാം തരം ഏലയ്ക്ക ലഭ്യമാണ്. കിലോയ്ക്ക് 2300 രൂപയാണ് വില. കുറഞ്ഞ ഓർഡർ 10 കിലോ. ലോകമെമ്പാടും ഷിപ്പിംഗ് ലഭ്യമാക്കുന്നുണ്ട്. ആവശ്യമുള്ളവർ ബന്ധപ്പെടുക.',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      captions: [
        {
          id: 'cap_1',
          productId: 'prod_1',
          facebook: '🌿 Premium 8mm Green Cardamom from Idukki, Kerala! 🌿\n\nFreshly harvested export-quality green cardamom is now available for wholesale and retail order. Handpicked directly from the hills of Idukki to ensure maximum flavor and aroma.\n\n✅ Grade: 8mm Bold Premium\n✅ Price: ₹2300/kg\n✅ Minimum Order: 10 kg\n✅ Features: 100% Natural, Rich Aroma, Chemical-free\n✅ Shipping: Worldwide delivery available\n\n📞 Place your order now! Contact us at +91 98765 43210 or DM us directly.\n\n#GreenCardamom #IdukkiSpices #KeralaSpices #SpicesExporter #WholesaleSpices #QualityFirst',
          instagram: '🌿 Premium 8mm Green Cardamom from Idukki, Kerala! 🌿\n\nExperience the purest aroma of authentic Kerala cardamom. High-grade 8mm bold green cardamom hand-selected for export quality.\n\n✨ Freshly Harvested\n✨ Natural Green Color & Intense Aroma\n💰 Wholesale Rate: ₹2300/kg\n📦 Minimum Order: 10 kg\n✈️ Shipping: Worldwide\n\n📲 Direct Message or call +91 98765 43210 to book your harvest.\n\n#GreenCardamom #IdukkiSpices #KeralaSpices #SpicesExporter #WholesaleSpices #KeralaAgriculture #SpicesOfIndia #CardamomLove',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      socialPosts: [
        {
          id: 'post_1',
          productId: 'prod_1',
          platform: 'facebook',
          caption: '🌿 Premium 8mm Green Cardamom from Idukki, Kerala! 🌿...',
          imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=60',
          status: 'success',
          externalPostId: 'fb_1209384729384',
          publishedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
          retryCount: 0,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'post_2',
          productId: 'prod_1',
          platform: 'instagram',
          caption: '🌿 Premium 8mm Green Cardamom from Idukki, Kerala! 🌿...',
          imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=60',
          status: 'success',
          externalPostId: 'ig_9837482910239',
          publishedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
          retryCount: 0,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      socialAccounts: [
        { id: 'acc_1', platform: 'facebook', accountName: 'Lidex Global Spices Facebook Page', isActive: true, connectedAt: new Date().toISOString() },
        { id: 'acc_2', platform: 'instagram', accountName: 'lidex_global_spices_official', isActive: true, connectedAt: new Date().toISOString() }
      ],
      logs: [
        { id: 'log_1', type: 'success', message: 'Database initialized successfully.', timestamp: new Date().toISOString() }
      ],
      settings: DEFAULT_SETTINGS
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    } catch (e) {}
    return initialDB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    // Prevent 500 error if file is being written concurrently
    return { users: [], products: [], captions: [], socialPosts: [], socialAccounts: [], logs: [], settings: DEFAULT_SETTINGS };
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

// Write System Log Helper
function logEvent(type: 'info' | 'warn' | 'error' | 'success', message: string, executionTime?: number) {
  const db = getDB();
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    type,
    message,
    executionTime,
    timestamp: new Date().toISOString()
  };
  db.logs.unshift(newLog);
  // Keep logs to a reasonable limit (e.g., 200 logs)
  if (db.logs.length > 200) {
    db.logs = db.logs.slice(0, 200);
  }
  saveDB(db);
  console.log(`[${type.toUpperCase()}] ${message} (${executionTime ? `${executionTime}ms` : 'N/A'})`);
}

// Gemini client initialization helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY environment variable is missing or set to placeholder. Please configure it in AI Studio Secrets.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Authentication Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.id === token); // Simple secure token is the User ID in this custom sandbox
  if (!user) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }

  (req as any).user = user;
  next();
}

// API Routes

// Registration and Auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const db = getDB();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(400).json({ error: 'Email already registered' });
    return;
  }

  const userId = 'user_' + Date.now();
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  const newUser = { id: userId, name, email, passwordHash };
  db.users.push(newUser);
  saveDB(db);

  logEvent('success', `User registered successfully: ${email}`);
  res.json({ token: userId, user: { id: userId, name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = getDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(400).json({ error: 'User not found' });
    return;
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.passwordHash !== passwordHash) {
    res.status(400).json({ error: 'Incorrect password' });
    return;
  }

  logEvent('success', `User logged in: ${email}`);
  res.json({ token: user.id, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// File Upload Proxy (Supports Cloudinary and Local Fallback)
app.post('/api/upload', authenticateToken, async (req, res) => {
  const { file, fileType, purpose } = req.body; // base64 encoded file string, e.g. "data:image/png;base64,..."
  if (!file) {
    res.status(400).json({ error: 'No file data supplied' });
    return;
  }

  const startTime = Date.now();
  const db = getDB();
  const settings = db.settings;

  try {
    // Extrapolate mimeType and clean base64 data
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = fileType;
    let base64Data = file;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const isImage = mimeType.startsWith('image/');
    
    // Cloudinary upload if keys are configured
    if (isImage && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
      logEvent('info', `Attempting real Cloudinary upload to cloud: ${settings.cloudinaryCloudName}`);
      
      // Compute Cloudinary signature
      const timestamp = Math.floor(Date.now() / 1000);
      const stringToSign = `timestamp=${timestamp}${settings.cloudinaryApiSecret}`;
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
      
      const formData = new URLSearchParams();
      formData.append('file', file);
      formData.append('api_key', settings.cloudinaryApiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const cloudUrl = `https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/image/upload`;
      const cloudRes = await fetch(cloudUrl, {
        method: 'POST',
        body: formData
      });

      const cloudData = await cloudRes.json() as any;
      if (cloudRes.ok && cloudData.secure_url) {
        logEvent('success', `Cloudinary upload successful!`, Date.now() - startTime);
        res.json({ url: cloudData.secure_url, cloudinary: true });
        return;
      } else {
        logEvent('warn', `Cloudinary error, falling back to local storage: ${JSON.stringify(cloudData)}`);
      }
    }

    // Local Storage fallback
    const fileExt = isImage ? 'png' : 'webm';
    const filename = `${purpose || 'upload'}_${Date.now()}.${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    fs.writeFileSync(filePath, buffer);
    const localUrl = `/uploads/${filename}`;

    logEvent('success', `File saved locally to ${localUrl}`, Date.now() - startTime);
    res.json({ url: localUrl, cloudinary: false });
  } catch (err: any) {
    logEvent('error', `Upload failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Malayalam Voice Transcription API
app.post('/api/transcribe', authenticateToken, async (req, res) => {
  const { audioUrl, audioBase64, mimeType } = req.body;
  const startTime = Date.now();

  if (!audioUrl && !audioBase64) {
    res.status(400).json({ error: 'No audio data supplied' });
    return;
  }

  try {
    let finalBase64 = audioBase64;
    let finalMime = mimeType || 'audio/webm';

    // If audioUrl is provided, try to load the local file
    if (audioUrl && audioUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), audioUrl);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        finalBase64 = fileBuffer.toString('base64');
        if (filePath.endsWith('.wav')) finalMime = 'audio/wav';
        else if (filePath.endsWith('.mp3')) finalMime = 'audio/mp3';
      }
    }

    if (!finalBase64) {
      throw new Error('Could not resolve base64 audio data.');
    }

    // Remove metadata prefix if present in the base64 string
    const cleanBase64 = finalBase64.replace(/^data:audio\/[A-Za-z]+;base64,/, '');

    logEvent('info', `Starting Malayalam voice transcription via Gemini 3.5 Flash`);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: finalMime,
            data: cleanBase64
          }
        },
        "Transcribe the Malayalam speech in this audio file accurately. Please output only the transcribed text in Malayalam characters. Do not translate it, do not summarize, and do not add any markdown, comments, notes, introduction, or prefix."
      ]
    });

    const transcript = response.text?.trim() || "";
    if (!transcript) {
      throw new Error('Gemini returned an empty transcription. Try speaking more clearly.');
    }

    logEvent('success', `Malayalam voice transcribed successfully! Length: ${transcript.length} chars`, Date.now() - startTime);
    res.json({ transcript });
  } catch (err: any) {
    logEvent('error', `Transcription failed: ${err.message}`, Date.now() - startTime);
    res.status(500).json({ error: err.message || 'Speech-to-text transcription failed.' });
  }
});

// AI Data Extraction API
app.post('/api/extract', authenticateToken, async (req, res) => {
  const { transcript } = req.body;
  const startTime = Date.now();

  if (!transcript) {
    res.status(400).json({ error: 'No transcript text supplied' });
    return;
  }

  try {
    logEvent('info', `Extracting structured product details from transcript via Gemini 3.5 Flash`);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze the following transcript of a Malayalam product description (which may be written in Malayalam text or include English mixed words):
"${transcript}"

Extract the structured product details as requested. Return a JSON object matching this schema:
{
  "product": "Product Name (in English, e.g. Green Cardamom)",
  "category": "Product Category (in English, e.g. Spices / Agriculture)",
  "grade": "Grade / Quality description (in English, e.g. 8mm Bold Premium)",
  "size": "Size or dimensions if mentioned, else 'Not Specified'",
  "weight": "Weight if mentioned, else 'Not Specified'",
  "price": "Price with currency, e.g. ₹2300/kg",
  "currency": "Currency abbreviation, e.g. INR / USD / AED",
  "minimum_order": "Minimum Order Quantity, e.g. 10 kg",
  "origin": "Origin location, e.g. Idukki, Kerala, India",
  "features": ["Feature 1", "Feature 2", ...],
  "availability": "Availability status, e.g. In Stock / Ready to Ship",
  "shipping": "Shipping info, e.g. Worldwide / Local delivery",
  "contact": "Contact phone or email if mentioned, else 'Not Specified'",
  "language": "Malayalam"
}`,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite product data extraction AI. Extract structured attributes precisely from the input transcript and output a pristine, correctly formatted JSON object. Ensure currency and pricing is formatted cleanly.'
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    logEvent('success', `Product structured data extracted successfully!`, Date.now() - startTime);
    res.json({ extractedData: parsedData });
  } catch (err: any) {
    logEvent('error', `Data extraction failed: ${err.message}`, Date.now() - startTime);
    res.status(500).json({ error: err.message || 'AI extraction failed. Retrying...' });
  }
});

// Caption Generator API
app.post('/api/generate-caption', authenticateToken, async (req, res) => {
  const { productData } = req.body;
  const startTime = Date.now();

  if (!productData) {
    res.status(400).json({ error: 'No product data supplied' });
    return;
  }

  try {
    logEvent('info', `Generating social media captions via Gemini 3.5 Flash`);
    const ai = getGeminiClient();

    const prompt = `Using the following structured product details, generate two optimized social media captions: one for Facebook and one for Instagram.

Product Details:
${JSON.stringify(productData, null, 2)}

Requirements:
- Facebook Caption: Professional, SEO optimized, includes relevant emojis, spacing for visual structure, a clear Call-To-Action (CTA) using the contact details if available, and relevant hashtags.
- Instagram Caption: Highly engaging, designed for maximum reach, bulleted with visual spacing, maximum reach hashtags, emojis, and a strong Call-To-Action.

Return a JSON object matching this exact schema:
{
  "facebook": "The complete Facebook caption text with line breaks and formatting",
  "instagram": "The complete Instagram caption text with line breaks and formatting"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are a elite social media copywriter. Generate professional, visually stunning social captions with emojis, clean lists, line breaks, and popular marketing hashtags. Return only valid JSON.'
      }
    });

    const captions = JSON.parse(response.text || '{}');
    logEvent('success', `Facebook and Instagram captions generated successfully!`, Date.now() - startTime);
    res.json(captions);
  } catch (err: any) {
    logEvent('error', `Caption generation failed: ${err.message}`, Date.now() - startTime);
    res.status(500).json({ error: err.message || 'Caption generation failed.' });
  }
});

// Meta Platform Publishing API
app.post('/api/publish', authenticateToken, async (req, res) => {
  const { productId, platforms, facebookCaption, instagramCaption, imageUrl } = req.body;
  const startTime = Date.now();

  if (!productId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    res.status(400).json({ error: 'ProductId and at least one target platform are required.' });
    return;
  }

  const db = getDB();
  const settings = db.settings;
  const results: any[] = [];

  logEvent('info', `Publishing product post to: ${platforms.join(', ')}`);

  for (const platform of platforms) {
    const postObj: any = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      productId,
      platform,
      caption: platform === 'facebook' ? facebookCaption : instagramCaption,
      imageUrl,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      // Validate full image URL
      let absoluteImageUrl = imageUrl;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        // Form a public URL for Meta callback download.
        // In AI Studio, process.env.APP_URL represents the external Cloud Run URL.
        const appUrl = process.env.APP_URL || 'https://example.com';
        absoluteImageUrl = `${appUrl}${imageUrl}`;
      }

      let externalPostId = '';

      if (platform === 'facebook') {
        if (settings.metaFacebookPageId && settings.metaFacebookAccessToken) {
          logEvent('info', `Attempting real Facebook Graph API publish to page: ${settings.metaFacebookPageId}`);
          const url = `https://graph.facebook.com/v18.0/${settings.metaFacebookPageId}/photos`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: absoluteImageUrl,
              message: facebookCaption,
              access_token: settings.metaFacebookAccessToken
            })
          });

          const data = await response.json() as any;
          if (!response.ok || data.error) {
            throw new Error(data.error?.message || 'Facebook Graph API responded with an error');
          }
          externalPostId = data.post_id || data.id;
        } else {
          // Simulated/Demo Flow (If keys are not yet configured)
          logEvent('info', `No Facebook API credentials; simulating successful Facebook Page post`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          externalPostId = 'fb_sim_' + Math.floor(Math.random() * 1000000000000);
        }
      } else if (platform === 'instagram') {
        if (settings.metaInstagramBusinessId && settings.metaInstagramAccessToken) {
          logEvent('info', `Attempting real Instagram Graph API publish to business ID: ${settings.metaInstagramBusinessId}`);
          
          // Step 1: Create media container
          const mediaUrl = `https://graph.facebook.com/v18.0/${settings.metaInstagramBusinessId}/media`;
          const containerRes = await fetch(mediaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: absoluteImageUrl,
              caption: instagramCaption,
              access_token: settings.metaInstagramAccessToken
            })
          });

          const containerData = await containerRes.json() as any;
          if (!containerRes.ok || containerData.error) {
            throw new Error(containerData.error?.message || 'Instagram media creation failed');
          }

          const creationId = containerData.id;

          // Step 2: Publish container
          const publishUrl = `https://graph.facebook.com/v18.0/${settings.metaInstagramBusinessId}/media_publish`;
          const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: creationId,
              access_token: settings.metaInstagramAccessToken
            })
          });

          const publishData = await publishRes.json() as any;
          if (!publishRes.ok || publishData.error) {
            throw new Error(publishData.error?.message || 'Instagram publication failed');
          }

          externalPostId = publishData.id;
        } else {
          // Simulated/Demo Flow
          logEvent('info', `No Instagram API credentials; simulating successful Instagram Business post`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          externalPostId = 'ig_sim_' + Math.floor(Math.random() * 1000000000000);
        }
      }

      // Record Success
      postObj.status = 'success';
      postObj.externalPostId = externalPostId;
      (postObj as any).publishedAt = new Date().toISOString();
      db.socialPosts.unshift(postObj);
      saveDB(db);

      logEvent('success', `Successfully published post to ${platform.toUpperCase()}: ${externalPostId}`, Date.now() - startTime);
      results.push({ platform, status: 'success', id: externalPostId });
    } catch (err: any) {
      logEvent('error', `Failed publishing to ${platform.toUpperCase()}: ${err.message}`, Date.now() - startTime);
      postObj.status = 'failed';
      postObj.errorMessage = err.message;
      db.socialPosts.unshift(postObj);
      saveDB(db);
      results.push({ platform, status: 'failed', error: err.message });
    }
  }

  res.json({ results });
});

// History & Posts Retrieve APIs
app.get('/api/history', authenticateToken, (req, res) => {
  const db = getDB();
  res.json({ history: db.socialPosts });
});

app.get('/api/posts', authenticateToken, (req, res) => {
  const db = getDB();
  res.json({ posts: db.products });
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { name, extractedData, imageUrl, audioUrl, transcript } = req.body;
  if (!name || !extractedData) {
    res.status(400).json({ error: 'Name and extractedData are required' });
    return;
  }

  const db = getDB();
  const newProduct = {
    id: 'prod_' + Date.now(),
    userId: (req as any).user.id,
    name,
    extractedData,
    imageUrl,
    audioUrl: audioUrl || '',
    transcript: transcript || '',
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDB(db);

  logEvent('success', `Saved product definition: ${name}`);
  res.json({ product: newProduct });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const initialLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  db.socialPosts = db.socialPosts.filter((sp: any) => sp.productId !== req.params.id);
  
  if (db.products.length < initialLength) {
    saveDB(db);
    logEvent('success', `Deleted product post definition ${req.params.id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Post definition not found' });
  }
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const postIndex = db.products.findIndex((p: any) => p.id === req.params.id);
  
  if (postIndex > -1) {
    db.products[postIndex] = {
      ...db.products[postIndex],
      ...req.body,
      id: req.params.id, // preserve ID
      userId: db.products[postIndex].userId, // preserve owner
      createdAt: db.products[postIndex].createdAt // preserve date
    };
    saveDB(db);
    logEvent('success', `Updated product details for ${req.params.id}`);
    res.json({ success: true, product: db.products[postIndex] });
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Settings API
app.get('/api/settings', authenticateToken, (req, res) => {
  const db = getDB();
  res.json({ settings: db.settings });
});

app.post('/api/settings', authenticateToken, (req, res) => {
  const db = getDB();
  db.settings = {
    ...DEFAULT_SETTINGS,
    ...db.settings,
    ...req.body
  };
  saveDB(db);
  logEvent('success', `System settings updated successfully.`);
  res.json({ settings: db.settings });
});

// Dashboard Statistics Retrieval
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const db = getDB();
  
  const totalProducts = db.products.length;
  const totalPosts = db.socialPosts.length;
  const successPosts = db.socialPosts.filter((p: any) => p.status === 'success').length;
  const failedPosts = db.socialPosts.filter((p: any) => p.status === 'failed').length;
  const pendingPosts = db.socialPosts.filter((p: any) => p.status === 'pending').length;
  const successRate = totalPosts > 0 ? Math.round((successPosts / totalPosts) * 100) : 100;

  const fbCount = db.socialPosts.filter((p: any) => p.platform === 'facebook').length;
  const igCount = db.socialPosts.filter((p: any) => p.platform === 'instagram').length;

  // Generate 7-day post activity history
  const recentPostActivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = db.socialPosts.filter((p: any) => p.createdAt.startsWith(dateStr)).length;
    recentPostActivity.push({ date: dateStr, count });
  }

  res.json({
    stats: {
      totalProducts,
      totalPosts,
      successRate,
      pendingPosts,
      failedPosts,
      postsByPlatform: {
        facebook: fbCount,
        instagram: igCount
      },
      recentPostActivity
    }
  });
});

// System Logs Endpoint
app.get('/api/logs', authenticateToken, (req, res) => {
  const db = getDB();
  res.json({ logs: db.logs });
});

// Serve frontend assets in development and production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Inject Vite Dev Middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    // Serve production static assets from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static bundle from /dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

if (!isVercel) {
  startServer();
}

export default app;
