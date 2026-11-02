'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { generateContent, extractText, copyToClipboard, downloadAsFile } from '@/lib/api'
import { 
  ArrowLeft,
  Send,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  User,
  Bot,
  Zap,
  FileText,
  Settings,
  Star,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Edit3,
  Video,
  Search,
  Users,
  Newspaper,
  Briefcase,
  GraduationCap,
  Sun,
  Moon,
  X,
  AlertCircle
} from 'lucide-react'

interface ContentType {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  isActive: boolean
}

interface Persona {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

export default function CreatorTransformerPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedContentType, setSelectedContentType] = useState<string>('text')
  const [inputContent, setInputContent] = useState('')
  const [selectedPersona, setSelectedPersona] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [showChatBot, setShowChatBot] = useState(false)
  const [inputMethod, setInputMethod] = useState<'text' | 'url'>('text')
  const [error, setError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [totalSteps] = useState<number>(4)
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)
  const [scriptDuration, setScriptDuration] = useState<number>(5)
  const [scriptType, setScriptType] = useState<'youtube' | 'shorts'>('youtube')
  const [seoData, setSeoData] = useState<any>(null)
  const [isGeneratingStep, setIsGeneratingStep] = useState(false)
  const [scriptContent, setScriptContent] = useState('')
  const [extractedContent, setExtractedContent] = useState('')
  
  // AI Chat states
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Merhaba! Ben CSpark AI asistanıyım. Size nasıl yardımcı olabilirim?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle URL parameters for template pre-filling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const type = urlParams.get('type')
      const template = urlParams.get('template')
      
      if (type && template) {
        // Map URL type to content type
        const typeMapping: { [key: string]: string } = {
          'video-içeriği': 'video',
          'seo-optimizasyonu': 'seo', 
          'sosyal-medya': 'social',
          'iş-içeriği': 'text',
          'eğitim-içeriği': 'text'
        }
        
        const mappedType = typeMapping[type] || 'text'
        setSelectedContentType(mappedType)
        
        // Set template content
        setInputContent(`${template} konusunda içerik oluştur`)
        
        // Auto-set appropriate persona based on type
        if (type === 'eğitim-içeriği') {
          setSelectedPersona('educator')
        } else if (type === 'iş-içeriği') {
          setSelectedPersona('news')
        }
      }
    }
  }, [])

  // Reset duration when script type changes
  useEffect(() => {
    if (scriptType === 'shorts') {
      setScriptDuration(1) // 60 seconds default for shorts
    } else {
      setScriptDuration(5) // 5 minutes default for YouTube
    }
  }, [scriptType])

  // Content Types with API task mapping
  const contentTypes: ContentType[] = [
    {
      id: 'text',
      title: 'Metin/URL',
      description: 'İçeriğinizi girin',
      icon: Edit3,
      color: 'purple',
      isActive: selectedContentType === 'text'
    },
    {
      id: 'video',
      title: 'Video Script',
      description: 'Script oluşturun',
      icon: Video,
      color: 'blue',
      isActive: selectedContentType === 'video'
    },
    {
      id: 'seo',
      title: 'SEO',
      description: 'SEO optimizasyonu',
      icon: Search,
      color: 'green',
      isActive: selectedContentType === 'seo'
    },
    {
      id: 'social',
      title: 'Sosyal Medya',
      description: 'Sosyal paylaşım',
      icon: Users,
      color: 'pink',
      isActive: selectedContentType === 'social'
    }
  ]

  // API task mapping
  const getApiTask = (contentType: string) => {
    const taskMap: { [key: string]: string } = {
      'text': 'summary',
      'video': 'youtube',
      'seo': 'seo',
      'social': 'social'
    }
    return taskMap[contentType] || 'summary'
  }

  // Persona to tone mapping
  const getPersonaTone = (persona: string) => {
    const toneMap: { [key: string]: string } = {
      'general': 'casual',
      'news': 'professional',
      'educator': 'academic'
    }
    return toneMap[persona] || 'casual'
  }

  // Personas
  const personas: Persona[] = [
    {
      id: 'general',
      title: 'Genel İçerik',
      description: 'Tüm konular için uygun',
      icon: '📝',
      color: 'yellow'
    },
    {
      id: 'news',
      title: 'Haber Sunucusu',
      description: 'Profesyonel haber tarzı',
      icon: '📺',
      color: 'green'
    },
    {
      id: 'educator',
      title: 'Eğitimci',
      description: 'Öğretici ve açıklayıcı',
      icon: '🎓',
      color: 'blue'
    }
  ]

  // Render formatted content with bold support
  const renderFormattedContent = (content: string) => {
    // Keep bold formatting while rendering generated content as escaped text.
    const formattedContent = content.split(/(\*\*[^*\n]{1,50}\*\*)/g).map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part.slice(2, -2)}</strong> : part
    );
    
    return (
      <div 
        className={`rounded-xl p-6 whitespace-pre-wrap mb-6 transition-all duration-500 ${
          isDarkMode 
            ? 'bg-black/20 text-gray-100' 
            : 'bg-gray-100/50 text-gray-800'
        }`}
      >
        {formattedContent}
      </div>
    );
  };

  // Animated background octopi
  const backgroundOctopi = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 15 + 10,
    opacity: Math.random() * 0.05 + 0.02,
    left: Math.random() * 100,
    top: Math.random() * 100,
    rotation: Math.random() * 360,
    animationDelay: Math.random() * 5
  }))

  const handleGenerate = async () => {
    if (!inputContent.trim()) return

    setIsGenerating(true)
    setGeneratedContent('')
    setError(null)

    try {
      let contentToProcess = inputContent.trim()

      // If URL is provided, extract text first
      if (inputMethod === 'url' && isUrl(contentToProcess)) {
        setIsExtracting(true)
        try {
          const extractedData = await extractText(contentToProcess)
          contentToProcess = extractedData.text
          setExtractedContent(contentToProcess) // Store extracted content separately
          setIsExtracting(false)
        } catch (extractError) {
          setIsExtracting(false)
          throw new Error(`URL'den metin çıkarılamadı: ${extractError instanceof Error ? extractError.message : 'Bilinmeyen hata'}`)
        }
      } else {
        setExtractedContent(contentToProcess) // Store direct input
      }

      // Generate content using API
      const response = await generateContent({
        input: contentToProcess,
        task: getApiTask(selectedContentType) as any,
        tone: selectedPersona ? getPersonaTone(selectedPersona) as any : 'casual' as any,
        length: 'medium',
        lang: 'tr',
        max_tokens: 1024,
        temperature: 0.7
      })

      if (response.result) {
        setGeneratedContent(response.result)
        setHasGeneratedContent(true)
      } else {
        throw new Error('AI\'dan geçerli bir yanıt alınamadı')
      }

    } catch (error) {
      console.error('Content generation error:', error)
      setError(error instanceof Error ? error.message : 'İçerik üretilirken bir hata oluştu')
      setHasGeneratedContent(false)
    } finally {
      setIsGenerating(false)
      setIsExtracting(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRegenerateContent = () => {
    setHasGeneratedContent(false)
    setGeneratedContent('')
    handleGenerate()
  }

  // Step 2: Script Generation
  const handleScriptGeneration = async () => {
    const contentToUse = extractedContent || inputContent.trim()
    if (!contentToUse) {
      setError('Önce bir içerik girmeniz gerekiyor')
      return
    }

    setIsGeneratingStep(true)
    setError(null)

    try {
      // 10 dakika seçildiğinde 9 dakika ile birebir aynı hesaplamaları yap
      const adjustedDuration = scriptDuration === 10 ? 9 : scriptDuration;
      
      const durationText = scriptType === 'shorts' 
        ? `${scriptDuration * 60} saniye` 
        : `${scriptDuration} dakika`;
      
  const scriptPrompt = `İçerik Konusu: ${contentToUse}

SCRIPT TALIMATLARI:
- Script Türü: ${scriptType === 'youtube' ? 'YouTube Video' : 'YouTube Shorts/TikTok'}
- Hedef Süre: ${durationText}
- Ton: ${selectedPersona ? getPersonaTone(selectedPersona) : 'casual'}
- Dil: Türkçe
- Format: Tam konuşma metni (kelime sayısı ile birlikte)

KRİTİK KELIME SAYISI HEDEFİ:
- TOPLAM HEDEF: ${scriptType === 'youtube' 
  ? `${adjustedDuration * 150} kelime` 
  : `${Math.round(adjustedDuration * 60 * 2.5)} kelime`}
- En az bu sayıya ulaşılmalıdır; +%5'e kadar aşılabilir.

ZORUNLU FORMAT:
${scriptType === 'youtube' ? `
### 📺 VIDEO SENARYOSU (${adjustedDuration} dakika)

### 🎯 HOOK BÖLÜMÜ (0-30 saniye):
**Kelime Sayısı: [75 kelime]**
[Tam konuşma metni buraya...]

### 📖 GİRİŞ VE PROBLEM TANIMI (30 saniye - 2 dakika):
**Kelime Sayısı: [${Math.round(adjustedDuration * 150 * 0.15)} kelime]**
[Tam konuşma metni buraya...]

### 🎮 ANA İÇERİK BÖLÜMÜ (2 dakika - ${adjustedDuration - 2} dakika):
**Kelime Sayısı: [${Math.round(adjustedDuration * 150 * 0.7)} kelime]**
[Tam konuşma metni buraya...]

### 🎯 SONUÇ VE CALL-TO-ACTION (Son 1 dakika):
**Kelime Sayısı: [${Math.round(adjustedDuration * 150 * 0.15)} kelime]**
[Tam konuşma metni buraya...]

### 📊 TOPLAM KELİME SAYISI:
**Kontrol: [TOPLAM EN AZ ${adjustedDuration * 150} KELİME OLMALI; +%5'e kadar aşılabilir]**` 
: `
### 📱 SHORTS SENARYOSU (${adjustedDuration * 60} saniye)

### 🎯 HOOK (0-3 saniye):
**Kelime Sayısı: [${Math.round(adjustedDuration * 60 * 2.5 * 0.1)} kelime]**
[Tam konuşma metni...]

### 📖 ANA İÇERİK (3-${adjustedDuration * 60 - 5} saniye):
**Kelime Sayısı: [${Math.round(adjustedDuration * 60 * 2.5 * 0.8)} kelime]**
[Tam konuşma metni...]

### 🎯 KAPANIŞ (Son 5 saniye):
**Kelime Sayısı: [${Math.round(adjustedDuration * 60 * 2.5 * 0.1)} kelime]**
[Tam konuşma metni...]

### 📊 TOPLAM KELİME SAYISI:
**Kontrol: [TOPLAM EN AZ ${Math.round(adjustedDuration * 60 * 2.5)} KELİME OLMALI; +%5'e kadar aşılabilir]**`}

ÖNEMLİ UYARILAR:
- Her bölümde belirtilen kelime hedefini EN AZ yakala; +%5'e kadar aşabilirsin
- Konuşma metni akıcı, doğal ve sahne yönlendirmeleriyle zengin olmalı
- Toplam kelime sayısı MUTLAKA hedefi bulmalı; eksikse metni genişlet, fazlaysa kısalt
- Her bölümün sonunda gerçek kelime sayısını mutlaka belirt

TEKRAR YASAĞI (ÇOK ÖNEMLİ):
- Aynı cümleyi veya bilgiyi tekrar etme; önceki 5-10 cümleyle benzerse yeniden yaz (paraphrase)
- Liste veya tabloyu ikinci kez aynen yazma; ikinci geçişte özetle ve içgörü üret
- Kopyala-yapıştır yapma; her bölümde yeni bir bakış açısı sun

YETERSİZ VERİ STRATEJİSİ:
- Girdi kısa/yetersizse şu zenginleştirmeleri uygula: bağlam oluştur, neden-sonuç analizi, örnek senaryolar, benzetmeler, SSS, öneriler, riskler, yapılacaklar listesi, mini-vaka çalışmaları
- Gerektiğinde cümleleri anlamı koruyarak yeniden ifade et (paraphrase) ve yeni örneklerle destekle

LİSTE KULLANIM KURALI:
- Uzun veri listelerini (ör. tarihler/koordinatlar) aynen tekrarlama; 1-2 temsilî örnek ver, ardından örüntü/çıkarım/öneri üret

FORMAT KISITLAMASI:
- Başlıklarda veya gövdede "[1740 kelimelik]" gibi şablon metinler yazma; sadece gerçek konuşma metnini yaz
- Bölüm sonunda yalnızca şu satırı ekle: (Gerçek kelime sayısı: X kelime)

KELİME SAYISI DOĞRULAMASI:
- Her bölümde kelimeleri say ve hedefe uyumlu hale getir
- Örnek sayım: "Bugün çok önemli bir konuya başlıyoruz" = 6 kelime
- Hedefe ulaşmadıysan aynı bilgiyi tekrar etmeden yeni içerik ekleyerek tamamla

ZORUNLU KONTROL LİSTESİ:
✅ Her bölümde hedefi en az yakaladım mı (aşım +%5'i geçmiyor)?
 ✅ Toplam kelime sayısı ${scriptType === 'youtube' ? `${adjustedDuration * 150}` : `${Math.round(adjustedDuration * 60 * 2.5)}`} kelime mi?
✅ Her bölümün sonunda gerçek kelime sayısını yazdım mı?
✅ Tekrar var mı? Varsa yeniden yazıp temizledim mi?
✅ Konuşma metni akıcı ve doğal mı?

ÖRNEK KELIME SAYMA: "Bu harika bir video olacak bugün sizlerle" = 7 kelime

Lütfen yukarıdaki formatı KESINLIKLE takip ederek, toplam ${scriptType === 'youtube' 
  ? `${adjustedDuration * 150} kelime` 
  : `${Math.round(adjustedDuration * 60 * 2.5)} kelime`} içeren profesyonel script oluştur. HER BÖLÜMDE KELİME SAYISINI GERÇEKTEN SAY VE DOĞRULA; TEKRARI ÖNLE, VERİ YETERSİZSE ANALİZ VE PARAPHRASE İLE ZENGİNLEŞTİR!`
      
      // Use correct task based on script type
      const taskType = (scriptType === 'shorts' ? 'shorts' : 'youtube') as 'shorts' | 'youtube'
      
      // Calculate max tokens based on script type and duration - 2x increased for longer content
      let maxTokens;
      if (scriptType === 'shorts') {
        // Shorts için token hesaplaması (saniye başına 16 token - 2x artırıldı)
        maxTokens = Math.max(1600, Math.min(scriptDuration * 60 * 16, 6000));
      } else {
        // YouTube için token hesaplaması (dakika başına 800 token - 2x artırıldı)
        // 10 dakika için 9 dakika ile aynı şekilde hesapla
        const adjustedDuration = scriptDuration === 10 ? 9 : scriptDuration;
        maxTokens = Math.max(2400, Math.min(adjustedDuration * 800, 16000));
      }
      
      // Calculate duration for API call - use adjusted duration for 10=9
      const apiDuration = scriptType === 'shorts' 
        ? adjustedDuration * 60 // Shorts için saniye cinsinden
        : adjustedDuration // YouTube için dakika cinsinden
      
      const requestPayload = {
        input: scriptPrompt,
        task: taskType,
        tone: selectedPersona ? getPersonaTone(selectedPersona) as any : 'casual' as any,
        length: (adjustedDuration <= 5 ? 'short' : adjustedDuration <= 10 ? 'medium' : 'long') as 'short' | 'medium' | 'long',
        lang: 'tr' as 'tr',
        max_tokens: maxTokens,
        temperature: 0.7,
        duration: apiDuration // Süre bilgisini API'ye gönder
      }

      const response = await generateContent(requestPayload)

      if (response.result) {
        setScriptContent(response.result)
      } else {
        throw new Error('Script üretilemedi')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Script üretilirken hata oluştu')
      console.error('Script generation error:', error)
    } finally {
      setIsGeneratingStep(false)
    }
  }

  // Step 3: SEO & Performance
  const handleSEOGeneration = async () => {
    const contentToAnalyze = scriptContent || generatedContent
    if (!contentToAnalyze) {
      setError('SEO paketi oluşturmak için önce script oluşturmanız gerekiyor')
      return
    }

    setIsGeneratingStep(true)
    setError(null)

    try {
      const scriptTypeText = scriptType === 'youtube' ? 'YouTube Video' : 'YouTube Shorts/TikTok'
      const durationText = scriptType === 'shorts' 
        ? `${scriptDuration * 60} saniye` 
        : `${scriptDuration} dakika`
      
      const seoPrompt = `Video İçeriği: ${contentToAnalyze}

SEO PAKETİ TALİMATLARI:
- Video Türü: ${scriptTypeText}
- Video Süresi: ${durationText}
- Hedef Platform: ${scriptType === 'youtube' ? 'YouTube' : 'TikTok/Instagram Reels/YouTube Shorts'}
- Dil: Türkçe

ÇIKARILACAK PAKET:
1. Video Başlığı Önerileri (CTR odaklı)
2. Video Açıklaması (SEO optimized)
3. Thumbnail Tasarım Rehberi (renk, kompozisyon, text)
4. Hashtag Stratejisi (trend, niche, brand)
5. Görsel Paket Önerileri (renk paleti, font, efektler, müzik)
6. Platform Optimizasyonu
7. Engagement Stratejisi
8. Analitik Takip Rehberi

Lütfen bu video içeriği için kapsamlı SEO paketi ve görsel öneriler oluştur.`
      
      const response = await generateContent({
        input: seoPrompt,
        task: 'seo',
        tone: 'professional' as any,
        length: 'medium',
        lang: 'tr',
        max_tokens: 800,
        temperature: 0.5
      })

      if (response.result) {
        setSeoData(response.result)
      } else {
        throw new Error('SEO analizi üretilemedi')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'SEO analizi yapılırken hata oluştu')
    } finally {
      setIsGeneratingStep(false)
    }
  }

  // Helper function to check if input is URL
  const isUrl = (text: string): boolean => {
    try {
      new URL(text.trim())
      return true
    } catch {
      return false
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard(generatedContent)
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleCopyScriptToClipboard = async () => {
    try {
      await copyToClipboard(scriptContent)
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownloadContent = () => {
    const contentTypeText = contentTypes.find(ct => ct.id === selectedContentType)?.title || 'Content'
    const personaText = personas.find(p => p.id === selectedPersona)?.title || 'General'
    const filename = `cspark-${contentTypeText.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.txt`
    
    downloadAsFile(generatedContent, filename)
  }

  const handleDownloadScript = () => {
    const scriptTypeText = scriptType === 'youtube' ? 'YouTube' : 'Shorts-TikTok'
    const durationText = scriptType === 'shorts' ? `${scriptDuration * 60}s` : `${scriptDuration}dk`
    const filename = `cspark-script-${scriptTypeText}-${durationText}-${Date.now()}.txt`
    
    downloadAsFile(scriptContent, filename)
  }

  // Social Media Sharing Functions
  const shareToTwitter = () => {
    const text = `CSpark AI ile harika içerik ürettim! 🚀\n\n${generatedContent.substring(0, 200)}...`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://cspark.app')}&hashtags=AI,ContentCreation,CSpark`
    window.open(url, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://cspark.app')}`
    window.open(url, '_blank')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://cspark.app')}`
    window.open(url, '_blank')
  }

  const shareToWhatsApp = () => {
    const text = `CSpark AI ile ürettiğim içerik:\n\n${generatedContent.substring(0, 300)}...\n\nDetay: https://cspark.app`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // AI Chat Function
  const handleChatSend = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatLoading(true)
    
    try {
      const response = await generateContent({
        input: userMessage,
        task: 'summary',
        tone: 'casual',
        length: 'short',
        lang: 'tr',
        max_tokens: 300,
        temperature: 0.8
      })
      
      if (response.result) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: response.result }])
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası. Lütfen daha sonra tekrar deneyin.' }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-8 ${
            isDarkMode ? 'border-purple-600' : 'border-blue-600'
          }`}></div>
          <h2 className={`text-2xl font-semibold mb-4 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>CSpark</h2>
          <p className={`transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated background octopi */}
      <div className="absolute inset-0 pointer-events-none">
        {backgroundOctopi.map((octopus) => (
          <div
            key={octopus.id}
            className="absolute animate-pulse"
            style={{
              left: `${octopus.left}%`,
              top: `${octopus.top}%`,
              width: `${octopus.size}px`,
              height: `${octopus.size}px`,
              opacity: isDarkMode ? octopus.opacity : octopus.opacity * 0.3,
              transform: `rotate(${octopus.rotation}deg)`,
              animationDelay: `${octopus.animationDelay}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              filter: isDarkMode ? 'none' : 'hue-rotate(180deg) brightness(1.5)'
            }}
          >
            <Image
              src="/octopus-logo.png"
              alt=""
              width={octopus.size}
              height={octopus.size}
              className="object-contain animate-bounce"
              style={{
                animationDelay: `${octopus.animationDelay}s`,
                animationDuration: `${8 + Math.random() * 6}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={`relative z-10 backdrop-blur-md border-b transition-all duration-500 ${
        isDarkMode 
          ? 'bg-black/20 border-white/10' 
          : 'bg-white/20 border-gray-200/30'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/app')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white' 
                    : 'bg-gray-200/50 hover:bg-gray-200/70 text-gray-700 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  <Image
                    src="/octopus-logo.png"
                    alt="CSpark"
                    width={28}
                    height={28}
                    className="object-contain animate-pulse"
                  />
                </div>
                <div>
                  <div className={`text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                    isDarkMode 
                      ? 'from-purple-300 to-pink-300' 
                      : 'from-purple-600 to-pink-600'
                  }`}>
                    CSpark
                  </div>
                  <div className={`text-xs -mt-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                  }`}>AI-powered content generation</div>
                </div>
              </div>
            </div>

            {/* Debug Navigation & Theme Toggle */}
            <div className="flex items-center gap-3">
              {/* Debug Navigation */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-100/60 border-gray-200/50'
              }`}>
                <span className={`text-xs font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Debug:</span>
                {[
                  { step: 1, label: '1', title: 'İçerik Türü' },
                  { step: 2, label: '2', title: 'Persona' },
                  { step: 3, label: '3', title: 'İçerik' },
                  { step: 4, label: '4', title: 'Sonuç' }
                ].map((debugStep) => (
                  <button
                    key={debugStep.step}
                    onClick={() => setCurrentStep(debugStep.step)}
                    className={`w-6 h-6 rounded text-xs font-medium transition-all duration-200 ${
                      currentStep === debugStep.step
                        ? isDarkMode
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                    }`}
                    title={debugStep.title}
                  >
                    {debugStep.label}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 transition-all duration-200 rounded-lg ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10' 
                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-600/10'
                }`}
                title={isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isPending = stepNumber > currentStep
                
                return (
                  <div key={index} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                        : isCurrent
                        ? isDarkMode
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-4 ring-purple-600/20'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-600/20'
                        : isDarkMode
                          ? 'bg-white/10 text-gray-400 border border-white/20'
                          : 'bg-gray-200/50 text-gray-500 border border-gray-300/50'
                    }`}>
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                    {index < totalSteps - 1 && (
                      <div className={`w-16 h-1 mx-3 rounded-full transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-600' 
                          : isDarkMode 
                            ? 'bg-white/20' 
                            : 'bg-gray-300/50'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className={`text-center transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span className="font-medium">
              {currentStep === 1 && "📝 İçerik Oluşturma"}
              {currentStep === 2 && "🎬 Script Oluşturma"}
              {currentStep === 3 && "🎯 SEO & Optimizasyon"}
              {currentStep === 4 && "🚀 Yayınlama & Analitik"}
            </span>
            <div className={`text-sm mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Adım {currentStep} / {totalSteps}</div>
          </div>
        </div>

        {/* Content Type Cards - Always Visible for Context */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {contentTypes.map((type, index) => {
            const isCompleted = index + 1 < currentStep
            const isCurrent = index + 1 === currentStep
            const isPending = index + 1 > currentStep
            
            return (
              <button
                key={type.id}
                onClick={() => currentStep === 1 && setSelectedContentType(type.id)}
                disabled={currentStep !== 1}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  type.isActive && isCurrent
                    ? isDarkMode
                      ? 'border-purple-500 bg-purple-500/20 backdrop-blur-md shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/20'
                      : 'border-blue-500 bg-blue-500/20 backdrop-blur-md shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'border-green-500 bg-green-500/15 backdrop-blur-md shadow-lg shadow-green-500/20'
                    : isCurrent
                    ? isDarkMode
                      ? 'border-blue-500 bg-blue-500/15 backdrop-blur-md shadow-lg shadow-blue-500/20'
                      : 'border-purple-500 bg-purple-500/15 backdrop-blur-md shadow-lg shadow-purple-500/20'
                    : isPending
                    ? isDarkMode
                      ? 'border-white/20 bg-white/5 backdrop-blur-md opacity-60'
                      : 'border-gray-300/30 bg-gray-200/10 backdrop-blur-md opacity-60'
                    : isDarkMode
                      ? 'border-white/20 bg-white/5 backdrop-blur-md hover:border-purple-500/50'
                      : 'border-gray-300/30 bg-white/30 backdrop-blur-md hover:border-blue-500/50'
                } ${currentStep !== 1 ? 'cursor-not-allowed' : ''}`}
              >
                {/* Background Octopus Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute top-2 right-2 w-8 h-8">
                    <Image
                      src="/octopus-logo.png"
                      alt=""
                      width={32}
                      height={32}
                      className="object-contain animate-pulse"
                      style={{
                        animationDelay: `${index * 0.5}s`,
                        animationDuration: `${3 + index}s`
                      }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 w-6 h-6">
                    <Image
                      src="/octopus-logo.png"
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain animate-bounce"
                      style={{
                        animationDelay: `${index * 0.3}s`,
                        animationDuration: `${4 + index}s`
                      }}
                    />
                  </div>
                </div>

                {/* Step Status Indicator */}
                <div className="absolute top-3 left-3 z-10">
                  {isCompleted && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center animate-pulse ${
                      isDarkMode ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  )}
                  {isPending && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-500/50' : 'bg-gray-400/50'
                    }`}>
                      <span className={`text-xs font-bold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto relative z-10 ${
                  type.isActive && isCurrent
                    ? isDarkMode
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-green-500 text-white shadow-lg'
                    : isCurrent
                    ? isDarkMode
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-purple-500 text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-white/10 text-gray-400'
                      : 'bg-gray-200/30 text-gray-500'
                }`}>
                  <type.icon className="w-6 h-6" />
                </div>
                <h3 className={`font-semibold mb-1 relative z-10 transition-colors duration-500 ${
                  (type.isActive && isCurrent) || isCompleted || isCurrent 
                    ? 'text-white' 
                    : isDarkMode 
                      ? 'text-gray-300' 
                      : 'text-gray-800'
                }`}>
                  {type.title}
                </h3>
                <p className={`text-sm relative z-10 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{type.description}</p>

                {/* Glow effect for current step */}
                {isCurrent && (
                  <div className={`absolute inset-0 rounded-2xl blur-xl ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20' 
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                  }`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Step-based Content Display */}
        {currentStep === 1 && (
          <>
            {/* Content Input Section */}
            <div className={`backdrop-blur-md rounded-2xl border p-8 mb-8 transition-all duration-500 ${
              isDarkMode 
                ? 'bg-white/5 border-white/20' 
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>📝 İçeriğinizi Girin</h2>
              
              {/* Input Method Toggle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => setInputMethod('text')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    inputMethod === 'text'
                      ? isDarkMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                        : 'bg-gray-200/50 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  📝 Metin
                </button>
                <button
                  onClick={() => setInputMethod('url')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    inputMethod === 'url'
                      ? isDarkMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                        : 'bg-gray-200/50 text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  🔗 URL
                </button>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={
                    inputMethod === 'text'
                      ? 'Örn: Yeni iPhone lansmanı haberi metnini yapıştırın veya hakkında video script oluşturmak istediğiniz konuyu yazın...'
                      : 'Örn: https://example.com/article-url'
                  }
                  className={`w-full h-40 border rounded-xl p-4 resize-none transition-all duration-500 focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-black/20 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20' 
                      : 'bg-white/50 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>🎭 Persona Seçin</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                      selectedPersona === persona.id
                        ? isDarkMode
                          ? 'border-purple-500 bg-purple-500/20 backdrop-blur-md'
                          : 'border-blue-500 bg-blue-500/20 backdrop-blur-md'
                        : isDarkMode
                          ? 'border-white/20 bg-white/5 backdrop-blur-md hover:border-purple-500/50'
                          : 'border-gray-300/30 bg-white/30 backdrop-blur-md hover:border-blue-500/50'
                    }`}
                  >
                    <div className="text-4xl mb-4 text-center">{persona.icon}</div>
                    <h3 className={`font-semibold mb-2 text-center transition-colors duration-500 ${
                      selectedPersona === persona.id 
                        ? 'text-white' 
                        : isDarkMode 
                          ? 'text-gray-300' 
                          : 'text-gray-800'
                    }`}>
                      {persona.title}
                    </h3>
                    <p className={`text-sm text-center transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{persona.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate/Regenerate Button */}
            <div className="text-center mb-8">
              <button
                onClick={hasGeneratedContent ? handleRegenerateContent : handleGenerate}
                disabled={!inputContent.trim() || isGenerating}
                className={`px-12 py-4 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>İçerik Üretiliyor...</span>
                  </div>
                ) : hasGeneratedContent ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>🔄 Yeniden Oluştur</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>✨ İçerik Üret</span>
                  </div>
                )}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Script Generation */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className={`backdrop-blur-md rounded-2xl border p-8 transition-all duration-500 ${
              isDarkMode 
                ? 'bg-white/5 border-white/20' 
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                🎬 Script Oluşturma
              </h2>
              
              {/* Script Type Selection */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 text-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>📝 Script Türü</h3>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setScriptType('youtube')}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      scriptType === 'youtube'
                        ? 'bg-red-600 text-white shadow-lg'
                        : isDarkMode
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-200/50 text-gray-700 hover:bg-gray-200/70'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>YouTube Video</span>
                  </button>
                  <button
                    onClick={() => setScriptType('shorts')}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      scriptType === 'shorts'
                        ? 'bg-pink-600 text-white shadow-lg'
                        : isDarkMode
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-gray-200/50 text-gray-700 hover:bg-gray-200/70'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <span>Shorts/TikTok</span>
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 text-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>⏱️ Script Süresi</h3>
                <div className="flex items-center justify-center gap-4">
                  <label className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Süre:</label>
                  <input
                    type="range"
                    min={scriptType === 'shorts' ? "0.5" : "1"}
                    max={scriptType === 'shorts' ? "3" : "10"}
                    step={scriptType === 'shorts' ? "0.5" : "1"}
                    value={scriptDuration}
                    onChange={(e) => setScriptDuration(Number(e.target.value))}
                    className={`w-40 h-3 rounded-lg appearance-none cursor-pointer transition-colors duration-500 ${
                      isDarkMode ? 'bg-white/20' : 'bg-gray-300/50'
                    }`}
                  />
                  <span className={`font-semibold px-4 py-2 rounded-lg min-w-[80px] text-center transition-all duration-500 ${
                    isDarkMode 
                      ? 'text-white bg-purple-600' 
                      : 'text-white bg-blue-600'
                  }`}>
                    {scriptType === 'shorts' ? `${scriptDuration * 60}s` : `${scriptDuration} dk`}
                  </span>
                </div>
                <div className={`text-center text-sm mt-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {scriptType === 'shorts' && scriptDuration > 1.5 && "⚠️ Shorts için 90 saniye altı önerilir"}
                  {scriptType === 'youtube' && scriptDuration < 3 && "💡 YouTube için minimum 3 dakika önerilir"}
                  {scriptType === 'youtube' && scriptDuration > 10 && "⚠️ Uzun videolar için daha fazla içerik gerekir"}
                </div>
              </div>

              {/* Generate Script Button */}
              <div className="text-center">
                <button
                  onClick={handleScriptGeneration}
                  disabled={!inputContent.trim() || isGeneratingStep}
                  className={`px-8 py-4 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {isGeneratingStep ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Script Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      <span>🎬 Script Oluştur</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Script Display */}
            {scriptContent && (
              <div className={`backdrop-blur-md rounded-2xl border p-8 transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-white/5 to-purple-500/5 border-white/20' 
                  : 'bg-gradient-to-br from-white/80 to-purple-50/80 border-gray-200/50'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className={`text-2xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>🎬 Üretilen Script</h2>
                    <span className={`px-3 py-1 rounded-full text-sm transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-purple-600/20 text-purple-300' 
                        : 'bg-purple-600/10 text-purple-600'
                    }`}>
                      {scriptType === 'shorts' ? `${scriptDuration * 60}s Shorts` : `${scriptDuration} dk YouTube`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyScriptToClipboard}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300' 
                          : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-600'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>Kopyala</span>
                    </button>
                    <button
                      onClick={handleDownloadScript}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300' 
                          : 'bg-green-600/10 hover:bg-green-600/20 text-green-600'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>İndir</span>
                    </button>
                    <button
                      onClick={handleScriptGeneration}
                      disabled={isGeneratingStep}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300' 
                          : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-600'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Yeniden Üret</span>
                    </button>
                  </div>
                </div>
                <div className={`rounded-xl p-6 border transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-black/30 border-white/10' 
                    : 'bg-gray-100/50 border-gray-300/30'
                }`}>
                  <div className={`whitespace-pre-wrap leading-relaxed text-sm font-mono transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {scriptContent}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: SEO & Performance Optimization */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className={`backdrop-blur-md rounded-2xl border p-8 transition-all duration-500 ${
              isDarkMode 
                ? 'bg-white/5 border-white/20' 
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                🎯 SEO & Performans Optimizasyonu
              </h2>
              
              {!seoData ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className={`text-xl font-semibold mb-4 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>SEO Analizi Başlat</h3>
                  <p className={`mb-6 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>İçeriğiniz için anahtar kelime analizi, başlık önerileri ve performans optimizasyonu yapılacak.</p>
                  
                  <button
                    onClick={handleSEOGeneration}
                    disabled={!generatedContent || isGeneratingStep}
                    className={`px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {isGeneratingStep ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>SEO Analizi Yapılıyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        <span>🎯 SEO Analizi Yap</span>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>📊 SEO Analiz Sonuçları</h3>
                    <button
                      onClick={handleSEOGeneration}
                      disabled={isGeneratingStep}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300' 
                          : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-600'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Yeniden Analiz Et</span>
                    </button>
                  </div>
                  <div className={`rounded-xl p-6 whitespace-pre-wrap transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-black/20 text-gray-100' 
                      : 'bg-gray-100/50 text-gray-800'
                  }`}>
                    {seoData}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(seoData)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300' 
                          : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-600'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>Kopyala</span>
                    </button>
                    <button
                      onClick={() => downloadAsFile(seoData, `cspark-seo-analysis-${Date.now()}.txt`)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300' 
                          : 'bg-green-600/10 hover:bg-green-600/20 text-green-600'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>İndir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Publishing & Analytics */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className={`backdrop-blur-md rounded-2xl border p-8 transition-all duration-500 ${
              isDarkMode 
                ? 'bg-white/5 border-white/20' 
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                🚀 Yayınlama & Analitik
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Publishing Options */}
                <div className={`backdrop-blur-md rounded-xl border p-6 transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    <Share2 className="w-5 h-5" />
                    Yayınlama Seçenekleri
                  </h3>
                  <div className="space-y-3">
                    <button className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                      isDarkMode 
                        ? 'bg-red-600/20 hover:bg-red-600/30 text-red-300' 
                        : 'bg-red-600/10 hover:bg-red-600/20 text-red-600'
                    }`}>
                      <Video className="w-5 h-5" />
                      <span>YouTube'a Yayınla</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                      isDarkMode 
                        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300' 
                        : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-600'
                    }`}>
                      <Users className="w-5 h-5" />
                      <span>LinkedIn'e Paylaş</span>
                    </button>
                    <button className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                      isDarkMode 
                        ? 'bg-pink-600/20 hover:bg-pink-600/30 text-pink-300' 
                        : 'bg-pink-600/10 hover:bg-pink-600/20 text-pink-600'
                    }`}>
                      <Zap className="w-5 h-5" />
                      <span>TikTok'a Yükle</span>
                    </button>
                  </div>
                </div>

                {/* Analytics Preview */}
                <div className={`backdrop-blur-md rounded-xl border p-6 transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-green-500/5 border-green-500/20'
                }`}>
                  <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    <Star className="w-5 h-5" />
                    Performans Tahmini
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Engagement Skoru:</span>
                      <span className={`font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>85/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>SEO Skoru:</span>
                      <span className={`font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>92/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Viral Potansiyel:</span>
                      <span className={`font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>78/100</span>
                    </div>
                    <div className={`mt-4 p-3 rounded-lg transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-yellow-500/10' 
                        : 'bg-yellow-500/5'
                    }`}>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>
                        💡 İpucu: İçeriğinizi sabah 9-11 arası paylaşırsanız %23 daha fazla etkileşim alabilirsiniz!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Publishing */}
              <div className={`mt-6 backdrop-blur-md rounded-xl border p-6 transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-purple-500/10 border-purple-500/30' 
                  : 'bg-purple-500/5 border-purple-500/20'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  <Settings className="w-5 h-5" />
                  Zamanlı Yayınlama
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Tarih</label>
                    <input 
                      type="date" 
                      className={`w-full border rounded-lg p-3 transition-all duration-500 ${
                        isDarkMode 
                          ? 'bg-black/20 border-white/20 text-white' 
                          : 'bg-white/50 border-gray-300/50 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Saat</label>
                    <input 
                      type="time" 
                      className={`w-full border rounded-lg p-3 transition-all duration-500 ${
                        isDarkMode 
                          ? 'bg-black/20 border-white/20 text-white' 
                          : 'bg-white/50 border-gray-300/50 text-gray-800'
                      }`}
                    />
                  </div>
                  <div className="flex items-end">
                    <button className={`w-full px-4 py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    }`}>
                      ⏰ Zamanla
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`mb-8 backdrop-blur-md rounded-2xl border p-6 transition-all duration-500 ${
            isDarkMode 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <div>
                <h3 className={`font-semibold mb-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-red-300' : 'text-red-600'
                }`}>❌ Hata Oluştu</h3>
                <p className={`text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-red-200' : 'text-red-500'
                }`}>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className={`ml-auto transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-red-300 hover:text-red-100' 
                    : 'text-red-500 hover:text-red-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-12 mt-8">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep <= 1}
            className={`px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg ${
              isDarkMode 
                ? 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-300'
                : 'bg-gray-200/50 hover:bg-gray-200/70 text-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Önceki Adım</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStep >= totalSteps || (currentStep === 1 && !hasGeneratedContent) || (currentStep === 2 && !scriptContent) || (currentStep === 3 && !seoData)}
            className={`px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg ${
              isDarkMode
                ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300'
                : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-600'
            }`}
          >
            <span>Sonraki Adım</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Generated Content - Only show on Step 1 */}
        {currentStep === 1 && generatedContent && (
          <div className={`backdrop-blur-md rounded-2xl border p-8 transition-all duration-500 ${
            isDarkMode 
              ? 'bg-white/5 border-white/20' 
              : 'bg-white/60 border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>✨ Üretilen İçerik</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300' 
                      : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-600'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Kopyala</span>
                </button>
                <button
                  onClick={handleDownloadContent}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300' 
                      : 'bg-green-600/20 hover:bg-green-600/30 text-green-600'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </button>
              </div>
            </div>
            {renderFormattedContent(generatedContent)}
            
            {/* Social Media Share Section */}
            <div className={`border-t pt-6 transition-all duration-500 ${
              isDarkMode ? 'border-white/10' : 'border-gray-300/30'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <Share2 className="w-5 h-5" />
                🚀 Sosyal Medyada Paylaş
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={shareToTwitter}
                  className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 justify-center ${
                    isDarkMode 
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300' 
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600'
                  }`}
                >
                  <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-sm">LinkedIn</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="px-4 py-3 bg-blue-700/20 hover:bg-blue-700/30 text-blue-300 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
                >
                  <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
                >
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Bot */}
      {showChatBot && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-black/90 backdrop-blur-md rounded-2xl border border-white/20 z-50 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">CSpark AI Asistan</span>
            </div>
            <button
              onClick={() => setShowChatBot(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <span className="text-sm">Düşünüyor...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleChatSend()}
                disabled={isChatLoading}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button 
                onClick={handleChatSend}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  )
}
