'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Tab = 'library' | 'scorer' | 'generate';
type AssetType = 'all' | 'image' | 'video' | 'text';
type CreativeFormat = 'Image' | 'Short Video' | 'Text Content';
type CreativeAction = 'generate' | 'edit' | 'regenerate';

interface GeneratedResult {
  type: 'image' | 'video' | 'text';
  provider: string;
  model: string;
  content: Record<string, unknown>;
}

interface Asset {
  id: number; score: number; scoreColor: string; title: string; platform: string;
  type: 'image' | 'video' | 'text'; status: 'Active' | 'Review' | 'Draft';
  impressions: string; ctr: string;
}

const assets: Asset[] = [
  { id: 1, score: 82, scoreColor: '#10B981', title: 'Summer Hero – Meta', platform: 'Meta Ads', type: 'image', status: 'Active', impressions: '12,400 impr', ctr: '3.2% CTR' },
  { id: 2, score: 76, scoreColor: '#3B82F6', title: 'App Install – TikTok', platform: 'TikTok', type: 'video', status: 'Active', impressions: '8,200 views', ctr: '2.8% CTR' },
  { id: 3, score: 71, scoreColor: '#F59E0B', title: 'Brand Story – YouTube', platform: 'YouTube', type: 'video', status: 'Review', impressions: '—', ctr: '—' },
  { id: 4, score: 68, scoreColor: '#F59E0B', title: 'DPA Template – Holiday', platform: 'Meta Ads', type: 'image', status: 'Draft', impressions: '—', ctr: '—' },
  { id: 5, score: 88, scoreColor: '#10B981', title: 'Search Ad Copy – v3', platform: 'Google Ads', type: 'text', status: 'Active', impressions: '45,600 impr', ctr: '4.1% CTR' },
  { id: 6, score: 74, scoreColor: '#3B82F6', title: 'Win-back Email', platform: 'Email', type: 'text', status: 'Active', impressions: '2,100 sent', ctr: '22% open' },
];

const scoringSignals = [
  { label: 'CTR Score', desc: 'Predicted CTR vs category benchmark', pct: 30, width: 99, color: '#3B82F6' },
  { label: 'CVR Score', desc: 'Post-click conversion rate vs norms', pct: 25, width: 82.5, color: '#10B981' },
  { label: 'Competitive Differentiation', desc: 'Distinctiveness from competitor ads', pct: 15, width: 49.5, color: '#8B5CF6' },
  { label: 'Thumb-Stop Rate', desc: '3-second view rate for video', pct: 15, width: 49.5, color: '#EC4899' },
  { label: 'Sentiment Score', desc: 'NLP analysis of reactions', pct: 10, width: 33, color: '#06B6D4' },
  { label: 'Clutter-Free Score', desc: 'Visual density and clarity', pct: 5, width: 16.5, color: '#F59E0B' },
];

export default function CreativePage() {
  const [tab, setTab] = useState<Tab>('generate');
  const [typeFilter, setTypeFilter] = useState<AssetType>('all');
  const [channel, setChannel] = useState('Google Ads');
  const [format, setFormat] = useState<CreativeFormat>('Image');
  const [ageCategory, setAgeCategory] = useState('All');
  const [language, setLanguage] = useState('English (US)');
  const [productName, setProductName] = useState('');
  const [brief, setBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [generatedImageB64, setGeneratedImageB64] = useState<string | null>(null);
  const [isTextEditMode, setIsTextEditMode] = useState(false);
  const [editableHeadline, setEditableHeadline] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [editableCta, setEditableCta] = useState('');
  const [uploadedImageB64, setUploadedImageB64] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [generatingMessage, setGeneratingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!generating) { setGeneratingMessage(''); return; }
    const messages =
      format === 'Image'
        ? ['Sending your brief to Manus...', 'Manus is analysing your brief...', 'Generating your creative image...', 'Refining the composition...', 'Applying finishing touches...', 'Almost there...']
        : format === 'Text Content'
        ? ['Crafting your ad copy...', 'Optimising for channel and audience...', 'Finalising your copy...']
        : ['Building your video concept...', 'Structuring scenes and story...', 'Almost ready...'];
    let idx = 0;
    setGeneratingMessage(messages[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setGeneratingMessage(messages[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, [generating, format]);

  const filtered = assets.filter(a => typeFilter === 'all' || a.type === typeFilter);

  const tabs = [
    { id: 'generate' as Tab, label: 'Generate' },
    { id: 'library' as Tab, label: 'Asset Library' },
    { id: 'scorer' as Tab, label: 'Creative Scorer' },
  ];

  function readGeneratedImageB64(result: GeneratedResult): string | null {
    if (result.type !== 'image') return null;
    const b64 = result.content.b64Json;
    return typeof b64 === 'string' && b64.trim().length > 0 ? b64 : null;
  }

  function readGeneratedText(result: GeneratedResult): string | null {
    if (result.type !== 'text') return null;
    const headline = typeof result.content.headline === 'string' ? result.content.headline : '';
    const body = typeof result.content.body === 'string' ? result.content.body : '';
    const cta = typeof result.content.cta === 'string' ? result.content.cta : '';
    const combined = [headline, body, cta ? `CTA: ${cta}` : ''].filter(Boolean).join('\n');
    return combined.trim().length > 0 ? combined : null;
  }

  function getTextFields(result: GeneratedResult): { headline: string; body: string; cta: string } | null {
    if (result.type !== 'text') return null;
    return {
      headline: typeof result.content.headline === 'string' ? result.content.headline : '',
      body: typeof result.content.body === 'string' ? result.content.body : '',
      cta: typeof result.content.cta === 'string' ? result.content.cta : '',
    };
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1];
      if (b64) setUploadedImageB64(b64);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handleRemoveUploadedImage() {
    setUploadedImageB64(null);
    setUploadedImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function runCreativeAction(action: CreativeAction) {
    setGenerationError(null);

    if (!channel || !format || !ageCategory || !language || !productName.trim() || !brief.trim()) {
      setGenerationError('Please fill all required fields before generating.');
      return;
    }

    if (action === 'edit') {
      if (format !== 'Image' && format !== 'Text Content') {
        setGenerationError('Edit Generated Creative currently supports Image and Text Content formats.');
        return;
      }
      if (format === 'Image' && (!generatedResult || generatedResult.type !== 'image')) {
        setGenerationError('Generate an image first, then edit it.');
        return;
      }
      if (format === 'Text Content') {
        const existingText = generatedResult ? readGeneratedText(generatedResult) : null;
        if (!existingText) {
          setGenerationError('Generate text content first, then edit it.');
          return;
        }
      }
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/creative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          format,
          ageCategory,
          language,
          productName: productName.trim(),
          brief: brief.trim(),
          action,
          referenceImageB64: uploadedImageB64 ?? undefined,
          sourceImageB64: action === 'edit' ? generatedImageB64 : undefined,
          sourceImageUrl:
            action === 'edit' && generatedResult?.type === 'image'
              ? (typeof generatedResult.content.imageUrl === 'string' ? generatedResult.content.imageUrl : undefined)
              : undefined,
          sourceText:
            action === 'edit' && format === 'Text Content' && generatedResult
              ? readGeneratedText(generatedResult)
              : undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setGenerationError(payload?.error ?? 'Creative generation failed.');
        return;
      }

      const result = payload.result as GeneratedResult;
      setGeneratedResult(result);
      if (result.type === 'image') {
        const b64 = readGeneratedImageB64(result);
        if (b64) setGeneratedImageB64(b64);
      }
      if (result.type === 'text') {
        const fields = getTextFields(result);
        if (fields) {
          setEditableHeadline(fields.headline);
          setEditableBody(fields.body);
          setEditableCta(fields.cta);
        }
      }
      setIsTextEditMode(false);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Creative generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateCreative() {
    await runCreativeAction('generate');
  }

  async function handleEditGeneratedCreative() {
    if (format === 'Text Content') {
      if (!generatedResult || generatedResult.type !== 'text') {
        setGenerationError('Generate text content first, then edit it.');
        return;
      }
      const fields = getTextFields(generatedResult);
      if (fields) {
        setEditableHeadline(fields.headline);
        setEditableBody(fields.body);
        setEditableCta(fields.cta);
      }
      setGenerationError(null);
      setIsTextEditMode(true);
      return;
    }

    await runCreativeAction('edit');
  }

  async function handleGenerateNewCreative() {
    await runCreativeAction('regenerate');
  }

  function getGeneratedImageSrc(): string | null {
    if (!generatedResult || generatedResult.type !== 'image') return null;

    const imageUrl = typeof generatedResult.content.imageUrl === 'string'
      ? generatedResult.content.imageUrl
      : null;
    const b64Json = typeof generatedResult.content.b64Json === 'string'
      ? generatedResult.content.b64Json
      : null;

    return imageUrl ?? (b64Json ? `data:image/png;base64,${b64Json}` : null);
  }

  function handleDownloadCreative() {
    if (!generatedResult) {
      setGenerationError('Generate content first, then download it.');
      return;
    }

    if (generatedResult.type === 'text') {
      const textPayload = isTextEditMode
        ? [editableHeadline, editableBody, editableCta ? `CTA: ${editableCta}` : ''].filter(Boolean).join('\n\n')
        : (readGeneratedText(generatedResult) ?? '');
      if (!textPayload) {
        setGenerationError('No text content available to download.');
        return;
      }

      const blob = new Blob([textPayload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creative-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const imageSrc = getGeneratedImageSrc();
    if (!imageSrc) {
      setGenerationError('Generate an image first, then download it.');
      return;
    }

    const filename = `creative-${Date.now()}.png`;

    if (imageSrc.startsWith('data:')) {
      // Base64 data URL — download directly
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // External CDN URL (e.g. Manus) — proxy through our API so the browser
    // receives the file as an attachment and saves it instead of navigating.
    const link = document.createElement('a');
    link.href = `/api/creative/proxy-image?url=${encodeURIComponent(imageSrc)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleSaveTextEdits() {
    if (!generatedResult || generatedResult.type !== 'text') return;
    setGeneratedResult({
      ...generatedResult,
      content: {
        ...generatedResult.content,
        headline: editableHeadline.trim(),
        body: editableBody.trim(),
        cta: editableCta.trim(),
      },
    });
    setIsTextEditMode(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Total Assets" value="45" sub="+6 this month" trend="up" />
        <KPIBlock label="Avg Score" value="76" sub="+4 vs last month" trend="up" />
        <KPIBlock label="Below Threshold" value="8" sub="score &lt; 60" trend="down" />
        <KPIBlock label="Generated AI" value="12" sub="this quarter" trend="up" />
      </div>

      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'library' && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['all', 'image', 'video', 'text'] as AssetType[]).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-all ${typeFilter === f ? 'border-blue-500 bg-blue-500 text-white' : 'border-brand-border text-brand-text-muted hover:text-white'}`}>
                {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(asset => (
              <Card key={asset.id}>
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="relative" style={{ width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="22" cy="22" r="19" stroke="#2a2a2a" strokeWidth="3" fill="none" />
                        <circle cx="22" cy="22" r="19" stroke={asset.scoreColor} strokeWidth="3" fill="none"
                          strokeDasharray="119.38" strokeDashoffset={119.38 * (1 - asset.score / 100)} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{asset.score}</span>
                    </div>
                    <Badge variant={asset.status === 'Active' ? 'success' : asset.status === 'Review' ? 'warn' : 'info'}>{asset.status}</Badge>
                  </div>
                  <div className="mb-1 text-[13px] font-semibold text-white">{asset.title}</div>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="info">{asset.platform}</Badge>
                    <Badge variant="purple">{asset.type}</Badge>
                  </div>
                  <div className="mb-3 flex justify-between text-[11px] text-brand-text-muted">
                    <span>{asset.impressions}</span>
                    <span>{asset.ctr}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 justify-center text-[11px]">Preview</Button>
                    <Button variant="primary" size="sm" className="flex-1 justify-center text-[11px]">Re-score</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'scorer' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Scoring Signals &amp; Weights</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {scoringSignals.map(s => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className="w-12 text-center text-[16px] font-bold" style={{ color: s.color }}>{s.pct}%</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">{s.label}</div>
                    <div className="text-[11px] text-brand-text-muted">{s.desc}</div>
                  </div>
                  <div className="w-40">
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.width}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <Bar data={{ labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], datasets: [{ label: 'Assets', data: [2, 5, 12, 18, 8], backgroundColor: '#3B82F680' }] }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#71717a' }, grid: { display: false } }, y: { ticks: { color: '#71717a' }, grid: { color: '#2a2a2a' } } } }} height={180} />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'generate' && (
        <Card>
          <CardHeader><CardTitle>Generate New Creative</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  {[
                    'Google Ads',
                    'LinkedIn Ads',
                    'Meta Ads',
                    'TikTok Ads',
                    'Microsoft Ads',
                    'Amazon Ads',
                    'Snapchat Ads',
                    'Pinterest Ads',
                    'X Ads',
                    'Reddit Ads',
                    'Apple Search Ads',
                    'Flipkart Ads',
                    'Email',
                    'Whatsapp',
                    'Message',
                    'Push Notification',
                  ].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as CreativeFormat)}
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  {['Image', 'Short Video', 'Text Content'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Age category</label>
                <select
                  value={ageCategory}
                  onChange={(e) => setAgeCategory(e.target.value)}
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  {['All', '18-25', '25-35', '35-45', '45+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                >
                  {['English (US)', 'English (UK)', 'Spanish', 'German'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-brand-text-muted">Product / Brand Name</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., GlowFit Protein Shake"
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-brand-text-muted">Creative Brief / Instructions</label>
                <div className="overflow-hidden rounded-md border border-brand-border bg-brand-sidebar-hover focus-within:border-blue-500">
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={3}
                    placeholder="Describe the creative direction, key messages, offers..."
                    className="w-full bg-transparent px-3 pt-2 pb-1 text-[13px] text-white outline-none resize-none"
                  />
                  {/* Bottom toolbar — upload button + thumbnails live inside the box */}
                  <div className="flex items-center gap-2 border-t border-brand-border px-2 py-1.5">
                    <label
                      title="Upload a reference image or logo to guide the creative"
                      className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-[11px] text-brand-text-muted transition-colors hover:bg-brand-border hover:text-white"
                    >
                      <Upload size={12} />
                      <span>Add image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {uploadedImageB64 && (
                      <div className="flex items-center gap-2 ml-1">
                        <img
                          src={`data:image/png;base64,${uploadedImageB64}`}
                          alt={uploadedImageName}
                          title={uploadedImageName}
                          className="h-7 w-7 rounded border border-brand-border object-cover"
                        />
                        <span className="max-w-[120px] truncate text-[11px] text-brand-text-muted">{uploadedImageName}</span>
                        <button
                          onClick={handleRemoveUploadedImage}
                          title="Remove image"
                          className="flex items-center text-brand-text-dim hover:text-red-400 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" onClick={handleGenerateCreative} disabled={generating}>
                Generate Creative
              </Button>
              <Button variant="default" onClick={handleEditGeneratedCreative} disabled={generating}>
                Edit Generated Creative
              </Button>
              <Button variant="default" onClick={handleGenerateNewCreative} disabled={generating}>
                Generate New Creative
              </Button>
              <Button variant="default" onClick={handleDownloadCreative} disabled={generating}>
                Download
              </Button>
            </div>
            {generating && (
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                </div>
                <span className="text-[12px] text-brand-text-muted transition-all">{generatingMessage}</span>
              </div>
            )}
            {generationError && (
              <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                {generationError}
              </div>
            )}
            {generatedResult && (
              <div className="mt-4 rounded-xl border border-brand-border bg-brand-bg p-4">
                <div className="mb-2 text-[11px] text-brand-text-muted">
                  Provider: {generatedResult.provider} | Model: {generatedResult.model}
                </div>
                {generatedResult.type === 'text' && (
                  <div className="space-y-2">
                    {isTextEditMode ? (
                      <div className="space-y-2">
                        <input
                          value={editableHeadline}
                          onChange={(e) => setEditableHeadline(e.target.value)}
                          className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                          placeholder="Headline"
                        />
                        <textarea
                          value={editableBody}
                          onChange={(e) => setEditableBody(e.target.value)}
                          rows={5}
                          className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                          placeholder="Body"
                        />
                        <input
                          value={editableCta}
                          onChange={(e) => setEditableCta(e.target.value)}
                          className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500"
                          placeholder="CTA"
                        />
                        <div className="flex gap-2">
                          <Button variant="primary" onClick={handleSaveTextEdits}>Save Text Changes</Button>
                          <Button variant="default" onClick={() => setIsTextEditMode(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-[16px] font-semibold text-white">{String(generatedResult.content.headline ?? '')}</div>
                        <div className="text-[13px] text-brand-text">{String(generatedResult.content.body ?? '')}</div>
                        <div className="text-[12px] font-medium text-blue-400">CTA: {String(generatedResult.content.cta ?? '')}</div>
                      </>
                    )}
                  </div>
                )}
                {generatedResult.type === 'image' && (
                  <div className="space-y-2">
                    {(() => {
                      const imageUrl = typeof generatedResult.content.imageUrl === 'string'
                        ? generatedResult.content.imageUrl
                        : null;
                      const b64Json = typeof generatedResult.content.b64Json === 'string'
                        ? generatedResult.content.b64Json
                        : null;
                      const imageSrc = imageUrl ?? (b64Json ? `data:image/png;base64,${b64Json}` : null);

                      if (imageSrc) {
                        return (
                          <img
                            src={imageSrc}
                            alt="Generated creative"
                            className="max-h-[420px] w-full rounded-lg border border-brand-border object-cover"
                          />
                        );
                      }

                      return (
                        <div className="text-[12px] text-brand-text-muted whitespace-pre-wrap">
                          {String(generatedResult.content.prompt ?? 'Image prompt generated.')}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {generatedResult.type === 'video' && (
                  <div className="space-y-2">
                    <div className="text-[12px] text-brand-text-muted whitespace-pre-wrap">
                      {String(generatedResult.content.videoPrompt ?? '')}
                    </div>
                    {Array.isArray(generatedResult.content.storyboard) && (
                      <ul className="text-[12px] text-brand-text-muted space-y-1">
                        {generatedResult.content.storyboard.map((step) => (
                          <li key={String(step)}>- {String(step)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
