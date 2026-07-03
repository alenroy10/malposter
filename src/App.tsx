/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  History, 
  Settings, 
  LogOut, 
  Mic, 
  Square, 
  UploadCloud, 
  Image as ImageIcon, 
  FileAudio, 
  Sparkles, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  User, 
  FileText, 
  Flame, 
  Clock, 
  Facebook, 
  Instagram, 
  Copy, 
  Moon, 
  Sun,
  Eye,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Product, 
  ProductData, 
  SocialPost, 
  SystemLog, 
  SystemSettings, 
  DashboardStats 
} from './types';

// Types of Toast notifications
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  // Authentication & Session
  const [token, setToken] = useState<string | null>(localStorage.getItem('malposter_token'));
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // App routing
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'new-post' | 'editor' | 'history' | 'logs' | 'settings'>('dashboard');

  // Dashboard Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // App settings state
  const [settings, setSettings] = useState<SystemSettings>({
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
    theme: 'light'
  });

  // New Post Flow State
  const [imageFileBase64, setImageFileBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [audioFileBase64, setAudioFileBase64] = useState<string>('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Processing steps indicator
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'transcribing' | 'extracting' | 'done'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);

  // AI Extraction & Captions State
  const [productId, setProductId] = useState<string>('');
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ProductData>({
    product: '',
    category: '',
    grade: '',
    size: '',
    weight: '',
    price: '',
    currency: '',
    minimum_order: '',
    origin: '',
    features: [],
    availability: '',
    shipping: '',
    contact: '',
    language: 'Malayalam'
  });
  const [facebookCaption, setFacebookCaption] = useState<string>('');
  const [instagramCaption, setInstagramCaption] = useState<string>('');
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  // Social Publishing State
  const [selectedPlatforms, setSelectedPlatforms] = useState<('facebook' | 'instagram')[]>(['facebook', 'instagram']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResults, setPublishedResults] = useState<any[] | null>(null);

  // Historical data & Logs
  const [posts, setPosts] = useState<Product[]>([]);
  const [history, setHistory] = useState<SocialPost[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // Toast Alerts State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Current Session & Settings
  useEffect(() => {
    if (token) {
      fetchUserSession();
      fetchSettings();
      fetchDashboardData();
    }
  }, [token]);

  // Handle Theme application
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Fetch Session User Info
  const fetchUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Stats and Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch System Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Posts List, Social History & Logs
  const fetchHistoryAndLogs = async () => {
    setHistoryLoading(true);
    try {
      const pRes = await fetch('/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const hRes = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(pData.posts);
      }
      if (hRes.ok) {
        const hData = await hRes.json();
        setHistory(hData.history);
      }
    } catch (err) {
      showToast('Failed to load history list.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data.logs);
      }
    } catch (err) {
      showToast('Failed to load system logs.', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  // Tab Switching Listener
  useEffect(() => {
    if (currentTab === 'history') {
      fetchHistoryAndLogs();
    } else if (currentTab === 'logs') {
      fetchSystemLogs();
    } else if (currentTab === 'dashboard') {
      fetchDashboardData();
      fetchSystemLogs();
    }
  }, [currentTab]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('malposter_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        showToast(data.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      showToast('Server connection failed.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('malposter_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Account registered successfully!', 'success');
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Server connection failed.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('malposter_token');
    setToken(null);
    setUser(null);
    showToast('Logged out of session.', 'info');
  };

  // Save System Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        showToast('Settings saved successfully!', 'success');
      } else {
        showToast('Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast('Connection error during save.', 'error');
    }
  };

  // Media Capture Upload Helpers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageFileBase64(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAudioFileBase64(base64);
        setAudioPreviewUrl(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  // Recording Engine
  const startRecording = async () => {
    try {
      setProcessingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioFileBase64(base64);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      showToast('Microphone recording active...', 'info');
    } catch (err) {
      showToast('Could not access microphone.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Core Processing Workflow Pipeline (STT -> Structured Extraction)
  const processNewPost = async () => {
    if (!imageFileBase64) {
      showToast('Please upload a product image first.', 'error');
      return;
    }
    if (!audioFileBase64) {
      showToast('Please record or upload a Malayalam voice description.', 'error');
      return;
    }

    setProcessingStep('uploading');
    setProcessingError(null);

    try {
      // 1. Upload Product Image to server (Cloudinary proxy)
      const uploadImgRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ file: imageFileBase64, purpose: 'product_image' })
      });
      if (!uploadImgRes.ok) {
        throw new Error('Product image upload failed. Check Cloudinary settings.');
      }
      const imgData = await uploadImgRes.json();
      const uploadedImageUrl = imgData.url;

      // 2. Upload Audio File
      const uploadAudioRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ file: audioFileBase64, purpose: 'audio_voice' })
      });
      if (!uploadAudioRes.ok) {
        throw new Error('Audio voice description upload failed.');
      }
      const audioData = await uploadAudioRes.json();
      const uploadedAudioUrl = audioData.url;

      // 3. Speech-To-Text Voice transcription
      setProcessingStep('transcribing');
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ audioUrl: uploadedAudioUrl, mimeType: 'audio/webm' })
      });
      if (!transcribeRes.ok) {
        const errJson = await transcribeRes.json();
        throw new Error(errJson.error || 'Malayalam voice transcription failed.');
      }
      const transData = await transcribeRes.json();
      setTranscriptText(transData.transcript);

      // 4. GPT/Gemini Structured Extraction
      setProcessingStep('extracting');
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ transcript: transData.transcript })
      });
      if (!extractRes.ok) {
        throw new Error('AI Product details extraction failed.');
      }
      const extData = await extractRes.json();
      setExtractedData(extData.extractedData);

      // 5. Save product definition dynamically
      const saveProdRes = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: extData.extractedData.product || 'Spices Product',
          extractedData: extData.extractedData,
          imageUrl: uploadedImageUrl,
          audioUrl: uploadedAudioUrl,
          transcript: transData.transcript
        })
      });

      if (saveProdRes.ok) {
        const savedProd = await saveProdRes.json();
        setProductId(savedProd.product.id);
        setImagePreview(uploadedImageUrl); // set to final path
      }

      setProcessingStep('done');
      showToast('Processing complete! Edit details in the Editor tab.', 'success');
      
      // Auto-route to Editor/Caption Drafting
      setTimeout(() => {
        setCurrentTab('editor');
        handleDraftCaptions(extData.extractedData);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setProcessingError(err.message || 'An error occurred during process pipeline.');
      setProcessingStep('idle');
      showToast(err.message || 'Workflow process failed.', 'error');
    }
  };

  // Draft Captions
  const handleDraftCaptions = async (prodData: ProductData = extractedData) => {
    setIsGeneratingCaptions(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productData: prodData })
      });
      if (res.ok) {
        const data = await res.json();
        setFacebookCaption(data.facebook);
        setInstagramCaption(data.instagram);
        showToast('Captions generated successfully!', 'success');
      } else {
        showToast('Failed to generate captions.', 'error');
      }
    } catch (err) {
      showToast('Caption generator failed.', 'error');
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Save Edited Attributes
  const handleUpdateProduct = async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/posts/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: extractedData.product,
          extractedData: extractedData,
          transcript: transcriptText
        })
      });
      if (res.ok) {
        showToast('Product specifications updated!', 'success');
      } else {
        showToast('Failed to update product details.', 'error');
      }
    } catch (err) {
      showToast('Error saving product edits.', 'error');
    }
  };

  // Delete Post Definition
  const handleDeletePostDefinition = async (id: string) => {
    if (confirm('Are you sure you want to delete this product listing and all associated social posts?')) {
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          showToast('Product listing deleted.', 'success');
          fetchHistoryAndLogs();
        } else {
          showToast('Failed to delete listing.', 'error');
        }
      } catch (err) {
        showToast('Error deleting listing.', 'error');
      }
    }
  };

  // Publish to Social Platforms
  const handlePublishPosts = async () => {
    if (!productId) {
      showToast('No processed product available to publish.', 'error');
      return;
    }
    if (selectedPlatforms.length === 0) {
      showToast('Please check at least one platform to publish.', 'error');
      return;
    }

    setIsPublishing(true);
    setPublishedResults(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          platforms: selectedPlatforms,
          facebookCaption,
          instagramCaption,
          imageUrl: imagePreview
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPublishedResults(data.results);
        
        // Count errors
        const failures = data.results.filter((r: any) => r.status === 'failed');
        if (failures.length === 0) {
          showToast('Successfully published to social media!', 'success');
        } else {
          showToast(`Published with ${failures.length} errors. Review status.`, 'error');
        }
        
        fetchDashboardData();
      } else {
        showToast('Publish endpoint failed.', 'error');
      }
    } catch (err) {
      showToast('Error communicating with publisher.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Quick Retry social post
  const handleRetrySocialPost = async (sp: SocialPost) => {
    showToast(`Retrying publish to ${sp.platform.toUpperCase()}...`, 'info');
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: sp.productId,
          platforms: [sp.platform],
          facebookCaption: sp.caption,
          instagramCaption: sp.caption,
          imageUrl: sp.imageUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results[0].status === 'success') {
          showToast('Post published successfully on retry!', 'success');
        } else {
          showToast(`Retry failed: ${data.results[0].error}`, 'error');
        }
        fetchHistoryAndLogs();
      }
    } catch (err) {
      showToast('Retry action failed.', 'error');
    }
  };

  // Feature list helper edit
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...extractedData.features];
    updated[index] = val;
    setExtractedData({ ...extractedData, features: updated });
  };

  const addFeatureRow = () => {
    setExtractedData({ ...extractedData, features: [...extractedData.features, ''] });
  };

  const removeFeatureRow = (index: number) => {
    const updated = extractedData.features.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, features: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-lg border text-white flex items-center gap-3 pointer-events-auto ${
                toast.type === 'success' 
                  ? 'bg-emerald-600 border-emerald-500' 
                  : toast.type === 'error' 
                    ? 'bg-rose-600 border-rose-500' 
                    : 'bg-indigo-600 border-indigo-500'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
              {toast.type === 'error' && <XCircle className="h-5 w-5 shrink-0" />}
              {toast.type === 'info' && <Sparkles className="h-5 w-5 shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          {!token ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  MalPoster
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Malayalam Social Posting System</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Dashboard</span>
              <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                {currentTab === 'dashboard' && 'Dashboard Overview'}
                {currentTab === 'new-post' && 'Create New Post'}
                {currentTab === 'editor' && 'AI Editor & Drafts'}
                {currentTab === 'history' && 'Posting History Archive'}
                {currentTab === 'logs' && 'System Activity Logs'}
                {currentTab === 'settings' && 'System Configuration'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {token && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full text-xs font-semibold border border-green-100 dark:border-emerald-900/50">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Connected
            </div>
          )}

          {/* Quick theme toggler */}
          <button 
            onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Toggle Theme"
          >
            {settings.theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        {token && (
          <aside className="w-64 bg-slate-900 dark:bg-slate-950 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-850">
            <div className="p-6">
              <div className="flex items-center gap-3 text-white mb-8">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">M</div>
                <span className="font-semibold tracking-tight text-xl text-white">MalPoster</span>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                    currentTab === 'dashboard' 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </button>

                <button
                  onClick={() => setCurrentTab('new-post')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                    currentTab === 'new-post' 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <PlusSquare className="h-5 w-5" />
                  New Post
                </button>

                <button
                  onClick={() => setCurrentTab('editor')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                    currentTab === 'editor' 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  AI Editor & Drafts
                </button>

                <button
                  onClick={() => setCurrentTab('history')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                    currentTab === 'history' 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <History className="h-5 w-5" />
                  Posting History
                </button>

                <button
                  onClick={() => setCurrentTab('logs')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                    currentTab === 'logs' 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  System Logs
                </button>
              </nav>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={() => setCurrentTab('settings')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition duration-200 ${
                  currentTab === 'settings' 
                    ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>

              <div className="bg-slate-800/60 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Campaign Limit</p>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-indigo-400"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">75% Capacity Used</p>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile bottom nav */}
        {token && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-around items-center md:hidden z-40">
            <button onClick={() => setCurrentTab('dashboard')} className={`p-2 flex flex-col items-center gap-0.5 ${currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px]">Dashboard</span>
            </button>
            <button onClick={() => setCurrentTab('new-post')} className={`p-2 flex flex-col items-center gap-0.5 ${currentTab === 'new-post' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <PlusSquare className="h-5 w-5" />
              <span className="text-[10px]">New Post</span>
            </button>
            <button onClick={() => setCurrentTab('editor')} className={`p-2 flex flex-col items-center gap-0.5 ${currentTab === 'editor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <FileText className="h-5 w-5" />
              <span className="text-[10px]">Editor</span>
            </button>
            <button onClick={() => setCurrentTab('history')} className={`p-2 flex flex-col items-center gap-0.5 ${currentTab === 'history' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <History className="h-5 w-5" />
              <span className="text-[10px]">History</span>
            </button>
            <button onClick={() => setCurrentTab('settings')} className={`p-2 flex flex-col items-center gap-0.5 ${currentTab === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
              <Settings className="h-5 w-5" />
              <span className="text-[10px]">Settings</span>
            </button>
          </div>
        )}

        {/* Dynamic Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          
          {/* Guest Auth Flow View */}
          {!token ? (
            <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-3">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome to MalPoster</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  AI-Powered social media posting with Malayalam speech understanding
                </p>
              </div>

              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Alen Roy"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
                  />
                </div>

                {!isRegistering && (
                  <div className="flex justify-between items-center text-xs">
                    <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      Remember Me
                    </label>
                    <a href="#forgot" onClick={() => showToast('Password recovery is managed by your server administrator.', 'info')} className="text-indigo-600 hover:underline">Forgot Password?</a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-4"
                >
                  {authLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="ml-1 text-indigo-600 font-bold hover:underline"
                  >
                    {isRegistering ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            
            // Authenticated Dashboard Views
            <div className="space-y-6">
              
              {/* TAB 1: DASHBOARD VIEW */}
              {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Hero banner card */}
                  <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden border border-indigo-900">
                    <div className="relative z-10 max-w-lg space-y-3">
                      <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">Spices Marketing Hub</span>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready to post premium products?</h2>
                      <p className="text-sm text-indigo-200">
                        Upload or snap a product picture, record a quick description in Malayalam, and let AI structure the catalog & generate viral social campaigns!
                      </p>
                      <button 
                        onClick={() => setCurrentTab('new-post')}
                        className="px-5 py-2.5 bg-white text-indigo-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition shadow-lg inline-flex items-center gap-2"
                      >
                        <PlusSquare className="h-4 w-4" /> Create New Campaign
                      </button>
                    </div>
                    {/* Background abstract design */}
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-purple-500/25 to-transparent pointer-events-none hidden md:block" />
                  </div>

                  {/* Dynamic Stats Bento-Grid */}
                  {stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Products</p>
                          <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Publish Success Rate</p>
                          <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.successRate}%</h3>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                          <Send className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Social Posts Out</p>
                          <h3 className="text-2xl font-bold mt-1">{stats.totalPosts}</h3>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                          <XCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Failed / Retries</p>
                          <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{stats.failedPosts}</h3>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">Loading metrics...</div>
                  )}

                  {/* Lower Dashboard panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity chart panel */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:col-span-2 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">7-Day Post Activity</h3>
                        <span className="text-xs text-slate-400">Total volume</span>
                      </div>
                      
                      {stats && stats.recentPostActivity ? (
                        <div className="h-48 flex items-end justify-between gap-2 pt-6">
                          {stats.recentPostActivity.map((day, idx) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                              <div className="w-full text-center text-[10px] text-slate-400 mb-1">{day.count}</div>
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(day.count * 15, 6)}px` }}
                                className={`w-full rounded-t-lg ${idx === 6 ? 'bg-gradient-to-t from-indigo-600 to-purple-600 shadow-md' : 'bg-indigo-400 dark:bg-indigo-650'}`}
                              />
                              <span className="text-[10px] text-slate-500 font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400">Chart data not available.</div>
                      )}
                    </div>

                    {/* API and Social Channel integration summary */}
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Connected Accounts</h3>
                      
                      <div className="space-y-3">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                              <Facebook className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">Facebook Page</p>
                              <p className="text-[10px] text-slate-500">
                                {settings.metaFacebookPageId ? `ID: ...${settings.metaFacebookPageId.slice(-4)}` : 'Demo Sandbox Mode'}
                              </p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${settings.metaFacebookAccessToken ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg">
                              <Instagram className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">Instagram Business</p>
                              <p className="text-[10px] text-slate-500">
                                {settings.metaInstagramBusinessId ? `ID: ...${settings.metaInstagramBusinessId.slice(-4)}` : 'Demo Sandbox Mode'}
                              </p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${settings.metaInstagramAccessToken ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                        </div>

                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                          📌 <strong>Demo Active:</strong> If Facebook/Instagram Meta Keys are not specified in settings, the application runs in a simulated secure sandbox mode.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Logger Terminal snippet */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Recent Workflow Events</h3>
                      <button onClick={() => setCurrentTab('logs')} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        View Terminal <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="bg-slate-950 text-slate-300 font-mono text-xs rounded-xl p-4 overflow-hidden space-y-2 border border-slate-800 shadow-inner">
                      {systemLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex gap-2.5 py-0.5 border-b border-slate-900/40 last:border-0">
                          <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'error' ? 'text-rose-400' :
                            log.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
                          }>
                            {log.type.toUpperCase()}:
                          </span>
                          <span className="flex-1 truncate">{log.message}</span>
                          {log.executionTime && <span className="text-slate-500 text-[10px]">{log.executionTime}ms</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NEW POST (UPLOAD & RECORDING VIEW) */}
              {currentTab === 'new-post' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Title & Introduction */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">Create New Campaign</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Step 1 of 3: Provide a visual asset and record a voice description of your product in Malayalam.
                    </p>
                  </div>

                  {processingStep !== 'idle' && (
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-6">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
                        <Sparkles className="h-6 w-6 text-indigo-600 absolute animate-pulse" />
                      </div>

                      <div className="max-w-md mx-auto space-y-2">
                        <h3 className="font-bold text-lg capitalize">
                          {processingStep} workflow...
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {processingStep === 'uploading' && 'Uploading image & recording buffers safely...'}
                          {processingStep === 'transcribing' && 'AI Speech recognition is transcribing Malayalam audio bytes...'}
                          {processingStep === 'extracting' && 'Structured GPT engine is parsing product details into catalog schema...'}
                        </p>
                      </div>

                      {/* Micro progress indicator bar */}
                      <div className="max-w-xs mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ${
                          processingStep === 'uploading' ? 'w-1/3' : 
                          processingStep === 'transcribing' ? 'w-2/3' : 'w-11/12'
                        }`} />
                      </div>
                    </div>
                  )}

                  {processingStep === 'idle' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Drag & Drop Product image */}
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" /> Product Image
                        </h3>

                        {imagePreview ? (
                          <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                              <label className="p-2.5 bg-white text-slate-800 rounded-full cursor-pointer hover:scale-105 transition shadow">
                                <UploadCloud className="h-5 w-5" />
                                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                              </label>
                              <button 
                                onClick={() => { setImagePreview(''); setImageFileBase64(''); }}
                                className="p-2.5 bg-white text-rose-600 rounded-full hover:scale-105 transition shadow"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl aspect-video bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition group">
                            <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition duration-300" />
                            <p className="text-sm font-semibold mt-3">Drag & drop or Click to browse</p>
                            <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG (Max 10MB)</p>
                            <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Right: Malayalam Audio Recorder & Uploader */}
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Mic className="h-4 w-4" /> Malayalam Audio Description
                        </h3>

                        <div className="space-y-4">
                          {/* Recorder Controls */}
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isRecording ? (
                                <div className="h-3 w-3 bg-rose-500 rounded-full animate-ping" />
                              ) : (
                                <div className="h-3 w-3 bg-slate-400 rounded-full" />
                              )}
                              <div>
                                <p className="text-xs font-semibold">Microphone Record</p>
                                <p className="text-[10px] text-slate-500">
                                  {isRecording ? `Recording... ${formatDuration(recordDuration)}` : 'Click to record Malayalam voice'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`p-3.5 rounded-full text-white shadow-md transition ${
                                isRecording 
                                  ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' 
                                  : 'bg-indigo-600 hover:bg-indigo-700'
                              }`}
                            >
                              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Alternative Audio File Uploader */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium">Or upload file:</span>
                            <label className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition rounded-xl text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-1.5">
                              <FileAudio className="h-4 w-4 text-slate-500" />
                              Choose Audio File
                              <input type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                            </label>
                          </div>

                          {/* Audio Playback player if available */}
                          {audioPreviewUrl && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview Voice Clip</p>
                              <audio src={audioPreviewUrl} controls className="w-full h-8" />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Processing triggers */}
                  {processingStep === 'idle' && (
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold uppercase">Ready for processing pipeline?</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Our AI will run speech transcription, extract catalog schemas, and generate draft facebook/instagram posts!
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={processNewPost}
                        disabled={!imageFileBase64 || !audioFileBase64}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
                      >
                        <Sparkles className="h-4 w-4" /> Start AI Pipeline
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: AI EDITOR & RESULTS */}
              {currentTab === 'editor' && (
                <div className="max-w-5xl mx-auto space-y-6">
                  
                  {/* Top Header Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">AI Generated Drafts & Attributes</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Review, fine-tune structured values, and verify social campaign copies.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProduct}
                        disabled={!productId}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Settings className="h-4 w-4" /> Save Specifications
                      </button>

                      <button
                        onClick={() => handleDraftCaptions()}
                        disabled={isGeneratingCaptions || !productId}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                      >
                        {isGeneratingCaptions ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Re-draft Captions
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left 5 cols: Structured Schema Form */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Product Image preview */}
                      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image Asset Attached</p>
                        {imagePreview ? (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-50 dark:bg-slate-950">
                            <img src={imagePreview} alt="Attached Asset" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 text-xs">No image uploaded.</div>
                        )}
                      </div>

                      {/* Malayalam voice transcript edit */}
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Malayalam Transcript</h3>
                          <span className="text-[10px] text-slate-500">Transcribed via Gemini</span>
                        </div>
                        <textarea
                          rows={3}
                          value={transcriptText}
                          onChange={(e) => setTranscriptText(e.target.value)}
                          className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
                          placeholder="No transcript generated yet."
                        />
                      </div>

                      {/* Attribute Editor Card */}
                      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Structured Catalog Spec</h3>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                              <input 
                                type="text"
                                value={extractedData.product}
                                onChange={(e) => setExtractedData({ ...extractedData, product: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                              <input 
                                type="text"
                                value={extractedData.category}
                                onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Grade / Quality</label>
                              <input 
                                type="text"
                                value={extractedData.grade}
                                onChange={(e) => setExtractedData({ ...extractedData, grade: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price</label>
                              <input 
                                type="text"
                                value={extractedData.price}
                                onChange={(e) => setExtractedData({ ...extractedData, price: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min. Order Qty</label>
                              <input 
                                type="text"
                                value={extractedData.minimum_order}
                                onChange={(e) => setExtractedData({ ...extractedData, minimum_order: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Origin Country</label>
                              <input 
                                type="text"
                                value={extractedData.origin}
                                onChange={(e) => setExtractedData({ ...extractedData, origin: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Availability</label>
                              <input 
                                type="text"
                                value={extractedData.availability}
                                onChange={(e) => setExtractedData({ ...extractedData, availability: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shipping info</label>
                              <input 
                                type="text"
                                value={extractedData.shipping}
                                onChange={(e) => setExtractedData({ ...extractedData, shipping: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Information</label>
                            <input 
                              type="text"
                              value={extractedData.contact}
                              onChange={(e) => setExtractedData({ ...extractedData, contact: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition duration-200 outline-none text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          {/* Bullet features list */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Highlight Features</label>
                              <button onClick={addFeatureRow} className="text-[10px] text-indigo-600 font-bold hover:underline">+ Add Feature</button>
                            </div>
                            {extractedData.features.map((feat, idx) => (
                              <div key={idx} className="flex gap-1 items-center">
                                <input 
                                  type="text"
                                  value={feat}
                                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                  className="flex-1 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                                />
                                <button onClick={() => removeFeatureRow(idx)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 p-1.5 rounded">
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Right 7 cols: Copy previews & Publishing checks */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Social Publishing card block */}
                      <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-300">Ready to Publish?</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Check target channels and trigger immediate publication.</p>
                        </div>

                        {/* Platform Checkboxes */}
                        <div className="flex gap-4">
                          <label className="flex-1 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer flex items-center justify-between shadow-sm hover:scale-[1.01] transition duration-200">
                            <div className="flex items-center gap-2.5">
                              <input 
                                type="checkbox" 
                                checked={selectedPlatforms.includes('facebook')}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedPlatforms([...selectedPlatforms, 'facebook']);
                                  else setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'facebook'));
                                }}
                                className="rounded text-indigo-600" 
                              />
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Facebook className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-semibold">Facebook Page</span>
                            </div>
                          </label>

                          <label className="flex-1 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer flex items-center justify-between shadow-sm hover:scale-[1.01] transition duration-200">
                            <div className="flex items-center gap-2.5">
                              <input 
                                type="checkbox" 
                                checked={selectedPlatforms.includes('instagram')}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedPlatforms([...selectedPlatforms, 'instagram']);
                                  else setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'instagram'));
                                }}
                                className="rounded text-indigo-600" 
                              />
                              <div className="p-1.5 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-lg">
                                <Instagram className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-semibold">Instagram Feed</span>
                            </div>
                          </label>
                        </div>

                        {/* Published Results Alert */}
                        {publishedResults && (
                          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Post Status Results</p>
                            {publishedResults.map((res: any, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="capitalize font-medium flex items-center gap-1.5">
                                  {res.platform === 'facebook' ? <Facebook className="h-3.5 w-3.5 text-blue-600" /> : <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                                  {res.platform}
                                </span>
                                {res.status === 'success' ? (
                                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> Success
                                  </span>
                                ) : (
                                  <span className="text-rose-500 font-bold flex items-center gap-1" title={res.error}>
                                    <XCircle className="h-4 w-4" /> Failed
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={handlePublishPosts}
                          disabled={isPublishing || !productId || selectedPlatforms.length === 0}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          {isPublishing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Publish to Social Media
                        </button>
                      </div>

                      {/* Mock cards side-by-side or stacked tabs */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Social Campaign Previews</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Facebook Mock Feed Card */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                  {settings.companyName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold">{settings.companyName}</h4>
                                  <p className="text-[9px] text-slate-500">Sponsored • Facebook Feed</p>
                                </div>
                              </div>
                              <Facebook className="h-4 w-4 text-blue-600" />
                            </div>

                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <textarea
                                value={facebookCaption}
                                onChange={(e) => setFacebookCaption(e.target.value)}
                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed min-h-[140px] font-sans"
                                placeholder="Write or generate a Facebook copy..."
                              />
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Chars: {facebookCaption.length}</span>
                                <span>Draft editable</span>
                              </div>
                            </div>

                            {imagePreview && (
                              <div className="aspect-video bg-slate-100 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                                <img src={imagePreview} alt="Attached asset" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Instagram Mock Feed Card */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                                  {settings.companyName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold">{settings.companyName.toLowerCase().replace(/\s+/g, '_')}</h4>
                                  <p className="text-[9px] text-slate-500">Official Profile • Instagram Post</p>
                                </div>
                              </div>
                              <Instagram className="h-4 w-4 text-pink-600" />
                            </div>

                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <textarea
                                value={instagramCaption}
                                onChange={(e) => setInstagramCaption(e.target.value)}
                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed min-h-[140px] font-sans"
                                placeholder="Write or generate an Instagram copy..."
                              />
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>Chars: {instagramCaption.length}</span>
                                <span>Hashtags optimized</span>
                              </div>
                            </div>

                            {imagePreview && (
                              <div className="aspect-video bg-slate-100 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                                <img src={imagePreview} alt="Attached asset" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: POSTING HISTORY VIEW */}
              {currentTab === 'history' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Social Posting Archive</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage campaigns submitted across Facebook & Instagram channels.</p>
                    </div>

                    <button
                      onClick={fetchHistoryAndLogs}
                      disabled={historyLoading}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
                      Refresh Logs
                    </button>
                  </div>

                  {historyLoading ? (
                    <div className="py-12 text-center text-slate-400">Fetching history listings...</div>
                  ) : posts.length === 0 ? (
                    <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto p-8 space-y-4 shadow-sm">
                      <History className="h-12 w-12 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-base">No campaign listings yet</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your post archive is empty. Start recording description, extract schemas, and publish social posts to see logs here.
                      </p>
                      <button onClick={() => setCurrentTab('new-post')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition">Create Campaign</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Products/Post Definitions grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((prod) => {
                          const associatedPosts = history.filter((sp) => sp.productId === prod.id);
                          return (
                            <div key={prod.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                  {prod.imageUrl ? (
                                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                      <img src={prod.imageUrl} alt="Attached asset" className="h-full w-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                      <ImageIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{prod.name}</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">{prod.extractedData.category || 'Agricultural Spec'}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(prod.createdAt).toLocaleDateString()} @ {new Date(prod.createdAt).toLocaleTimeString()}</p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeletePostDefinition(prod.id)}
                                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 p-2 rounded-lg transition"
                                  title="Delete Product listing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Specs extracted</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                  <div>💵 <span className="text-slate-500">Price:</span> {prod.extractedData.price}</div>
                                  <div>🏅 <span className="text-slate-500">Grade:</span> {prod.extractedData.grade}</div>
                                  <div>📦 <span className="text-slate-500">Min. Order:</span> {prod.extractedData.minimum_order}</div>
                                  <div>📍 <span className="text-slate-500">Origin:</span> {prod.extractedData.origin}</div>
                                </div>
                              </div>

                              {/* Associated platform logs */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Channels publication logs</p>
                                
                                {associatedPosts.length === 0 ? (
                                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                                    <span>Not published to any channel yet</span>
                                    <button 
                                      onClick={() => {
                                        setProductId(prod.id);
                                        setExtractedData(prod.extractedData);
                                        setTranscriptText(prod.transcript);
                                        setImagePreview(prod.imageUrl);
                                        setCurrentTab('editor');
                                        handleDraftCaptions(prod.extractedData);
                                      }}
                                      className="font-bold underline text-indigo-600"
                                    >
                                      Draft Copy
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {associatedPosts.map((sp) => (
                                      <div key={sp.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2.5">
                                          {sp.platform === 'facebook' ? <Facebook className="h-4 w-4 text-blue-600" /> : <Instagram className="h-4 w-4 text-pink-600" />}
                                          <div>
                                            <span className="capitalize font-semibold">{sp.platform}</span>
                                            {sp.externalPostId && (
                                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {sp.externalPostId}</p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {sp.status === 'success' ? (
                                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[10px]">Success</span>
                                          ) : (
                                            <div className="flex items-center gap-1.5">
                                              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-500 dark:text-rose-400 rounded-full font-bold text-[10px]" title={sp.errorMessage}>Failed</span>
                                              <button 
                                                onClick={() => handleRetrySocialPost(sp)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded text-slate-500"
                                                title="Retry publication"
                                              >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TAB 5: SYSTEM TERMINAL LOGS VIEW */}
              {currentTab === 'logs' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">AI Systems Activity Logs</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Inspect real-time execution times, API response validations, and platform triggers.</p>
                    </div>

                    <button
                      onClick={fetchSystemLogs}
                      disabled={logsLoading}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
                      Refresh Terminal
                    </button>
                  </div>

                  {logsLoading ? (
                    <div className="py-12 text-center text-slate-400">Loading terminal log lists...</div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800 text-slate-300 rounded-2xl p-6 font-mono text-xs shadow-xl space-y-3 max-h-[600px] overflow-y-auto">
                      <div className="text-slate-500 border-b border-slate-900 pb-2">
                        System Online (Node {process.version || 'v20'}). Local Time: {new Date().toLocaleString()}
                      </div>
                      
                      {systemLogs.length === 0 ? (
                        <div className="text-center text-slate-600 py-12">No event records generated yet.</div>
                      ) : (
                        systemLogs.map((log) => (
                          <div key={log.id} className="flex gap-3 py-1.5 border-b border-slate-900/60 last:border-0 items-start">
                            <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleString()}]</span>
                            <span className={`font-bold shrink-0 ${
                              log.type === 'success' ? 'text-emerald-400' :
                              log.type === 'error' ? 'text-rose-400' :
                              log.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                              {log.type.toUpperCase()}:
                            </span>
                            <span className="flex-1 leading-relaxed whitespace-pre-wrap">{log.message}</span>
                            {log.executionTime && (
                              <span className="text-slate-500 shrink-0 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                                {log.executionTime}ms
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 6: SETTINGS VIEW */}
              {currentTab === 'settings' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">System Configuration Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage credentials for Cloudinary, Meta Social Accounts, OpenAI API, and company details.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {/* Cloudinary Configuration */}
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-sm tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-indigo-600">
                        <UploadCloud className="h-5 w-5" /> Cloudinary CDN Storage
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Enables durable cloud-hosting for product image previews. If Cloudinary key credentials are blank, files are automatically stored locally on the secure container filesystem.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cloud Name</label>
                          <input 
                            type="text"
                            value={settings.cloudinaryCloudName}
                            onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                            placeholder="e.g. dimgla39"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">API Key</label>
                          <input 
                            type="text"
                            value={settings.cloudinaryApiKey}
                            onChange={(e) => setSettings({ ...settings, cloudinaryApiKey: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                            placeholder="e.g. 91028392849"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">API Secret</label>
                          <input 
                            type="password"
                            value={settings.cloudinaryApiSecret}
                            onChange={(e) => setSettings({ ...settings, cloudinaryApiSecret: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                            placeholder="••••••••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Graph API Credentials */}
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-sm tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-indigo-600">
                        <Send className="h-5 w-5" /> Meta Social Accounts (Facebook & Instagram)
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Configure Facebook Page and Instagram Business access tokens. Keep these blank to operate in simulated sandbox mode.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                            <Facebook className="h-4 w-4" /> Facebook Configuration
                          </p>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Facebook Page ID</label>
                            <input 
                              type="text"
                              value={settings.metaFacebookPageId}
                              onChange={(e) => setSettings({ ...settings, metaFacebookPageId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                              placeholder="e.g. 10293848291"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Page Access Token</label>
                            <input 
                              type="password"
                              value={settings.metaFacebookAccessToken}
                              onChange={(e) => setSettings({ ...settings, metaFacebookAccessToken: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                              placeholder="EAAZB..."
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-pink-600 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                            <Instagram className="h-4 w-4" /> Instagram Configuration
                          </p>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instagram Business Account ID</label>
                            <input 
                              type="text"
                              value={settings.metaInstagramBusinessId}
                              onChange={(e) => setSettings({ ...settings, metaInstagramBusinessId: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                              placeholder="e.g. 178414029384"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instagram Access Token</label>
                            <input 
                              type="password"
                              value={settings.metaInstagramAccessToken}
                              onChange={(e) => setSettings({ ...settings, metaInstagramAccessToken: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                              placeholder="EAACX..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Information & Defaults */}
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-sm tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-indigo-600">
                        <User className="h-5 w-5" /> Company Information & Branding
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company Name</label>
                          <input 
                            type="text"
                            value={settings.companyName}
                            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branding Phone</label>
                          <input 
                            type="text"
                            value={settings.companyPhone}
                            onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branding Email</label>
                          <input 
                            type="text"
                            value={settings.companyEmail}
                            onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Hashtags</label>
                        <input 
                          type="text"
                          value={settings.defaultHashtags}
                          onChange={(e) => setSettings({ ...settings, defaultHashtags: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* Form Footer Action */}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentTab('dashboard')}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Save Configuration
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
