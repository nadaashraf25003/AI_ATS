import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ─── puter.js helpers (same pattern as ATSChecker) ────────────────────────────
const PUTER_SCRIPT_SRC = 'https://js.puter.com/v2/'

const loadPuterScript = () => {
  if (window.puter) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PUTER_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error('Failed to load puter.js')))
      return
    }
    const script = document.createElement('script')
    script.src = PUTER_SCRIPT_SRC
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load puter.js'))
    document.body.appendChild(script)
  })
}

const readPuterChatText = (response) => {
  if (!response) return ''
  if (typeof response === 'string') return response.trim()
  if (typeof response.text === 'string') return response.text.trim()
  const mc = response?.message?.content
  if (typeof mc === 'string') return mc.trim()
  if (Array.isArray(mc)) return mc.map((i) => (typeof i === 'string' ? i : i?.text || '')).join('\n').trim()
  return ''
}

// ─── Course recommendation helpers ────────────────────────────────────────────
const PLATFORM_CONFIG = {
  Coursera: {
    emoji: '🎓',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    url: (q) => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`,
  },
  Udemy: {
    emoji: '📚',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    url: (q) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`,
  },
  YouTube: {
    emoji: '▶️',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' tutorial')}`,
  },
  'LinkedIn Learning': {
    emoji: '💼',
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    url: (q) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(q)}`,
  },
  edX: {
    emoji: '🏫',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    url: (q) => `https://www.edx.org/search?q=${encodeURIComponent(q)}`,
  },
  freeCodeCamp: {
    emoji: '💻',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    url: (q) => `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(q)}`,
  },
}

const LEVEL_BADGE = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-100 text-rose-700 border-rose-200',
}

const SECTION_ORDER = [
  'ATS Match Score (0-100)',
  'Missing Keywords',
  'Strong Matches',
  'Resume Issues',
  'Rewrite Suggestions',
  '30-Second Summary',
]

const normalizeHeading = (value) =>
  value
    .toLowerCase()
    .replace(/[*#:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const headingAliases = {
  'ats match score (0-100)': 'ATS Match Score (0-100)',
  'ats match score': 'ATS Match Score (0-100)',
  'missing keywords': 'Missing Keywords',
  'strong matches': 'Strong Matches',
  'resume issues': 'Resume Issues',
  'rewrite suggestions': 'Rewrite Suggestions',
  '30-second summary': '30-Second Summary',
  '30 second summary': '30-Second Summary',
}

const sanitizeLine = (line) =>
  line
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/^\s*\d+[.)]\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^\s*[:\-]\s*/, '')
    .trim()

const getCanonicalHeading = (rawHeading) => {
  const normalized = normalizeHeading(rawHeading)
  const alias = Object.keys(headingAliases).find((key) => normalized.startsWith(key))
  return alias ? headingAliases[alias] : null
}

const cleanSectionContent = (content) => {
  if (!content) return ''

  return content
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, '').trim())
    .split('\n')
    .map((line) => sanitizeLine(line))
    .filter(Boolean)
    .join('\n')
}

const extractScore = (analysisText) => {
  if (!analysisText) return null

  const directMatch = analysisText.match(/ATS\s*Match\s*Score[^\d]*(\d{1,3})/i)
  const ratioMatch = analysisText.match(/(\d{1,3})\s*\/\s*100/)
  const loosePercent = analysisText.match(/\b(\d{1,3})\s*%/) 

  const raw = directMatch?.[1] || ratioMatch?.[1] || loosePercent?.[1]
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) return null
  if (parsed < 0) return 0
  if (parsed > 100) return 100
  return parsed
}

const parseSections = (analysisText) => {
  if (!analysisText) {
    return SECTION_ORDER.map((heading) => ({ heading, content: '' }))
  }

  const normalizedText = analysisText.replace(/\r/g, '\n').replace(/\*\*/g, '')

  // Supports headings that may be inline, markdown, or numbered lists.
  const headingRegex = /(^|[\n\r]|\s+)(?:[#>*-]\s*)?(?:\d+[.)]\s*)?(ATS\s*Match\s*Score(?:\s*\(0-100\))?|Missing\s*Keywords|Strong\s*Matches|Resume\s*Issues|Rewrite\s*Suggestions|30[-\s]*Second\s*Summary)\s*[:\-]*/gi

  const matches = []
  let match
  while ((match = headingRegex.exec(normalizedText)) !== null) {
    const prefix = match[1] || ''
    const rawHeading = match[2] || ''
    const canonicalHeading = getCanonicalHeading(rawHeading)

    if (!canonicalHeading) continue

    const headingStart = match.index + prefix.length
    const headingEnd = headingRegex.lastIndex

    matches.push({ heading: canonicalHeading, start: headingStart, end: headingEnd })
  }

  const sections = {}

  if (matches.length === 0) {
    sections['30-Second Summary'] = [cleanSectionContent(normalizedText)]
  } else {
    const leadingText = cleanSectionContent(normalizedText.slice(0, matches[0].start))
    if (leadingText) {
      sections['30-Second Summary'] = [leadingText]
    }

    matches.forEach((current, index) => {
      const next = matches[index + 1]
      const rawSectionContent = normalizedText.slice(current.end, next ? next.start : normalizedText.length)
      const cleanedContent = cleanSectionContent(rawSectionContent)

      if (!sections[current.heading]) {
        sections[current.heading] = []
      }

      if (cleanedContent) {
        sections[current.heading].push(cleanedContent)
      }
    })
  }

  return SECTION_ORDER.map((heading) => ({
    heading,
    content: (sections[heading] || []).filter(Boolean).join('\n'),
  }))
}

const SECTION_CARD_STYLES = {
  'ATS Match Score (0-100)': {
    border: 'border-sky-200',
    bg: 'from-sky-50 to-white',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    icon: '📊',
    gradient: 'from-sky-400 to-blue-500',
  },
  'Missing Keywords': {
    border: 'border-rose-200',
    bg: 'from-rose-50 to-white',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    icon: '🔑',
    gradient: 'from-rose-400 to-pink-500',
  },
  'Strong Matches': {
    border: 'border-emerald-200',
    bg: 'from-emerald-50 to-white',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: '✅',
    gradient: 'from-emerald-400 to-teal-500',
  },
  'Resume Issues': {
    border: 'border-amber-200',
    bg: 'from-amber-50 to-white',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: '⚠️',
    gradient: 'from-amber-400 to-orange-500',
  },
  'Rewrite Suggestions': {
    border: 'border-violet-200',
    bg: 'from-violet-50 to-white',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    dot: 'bg-violet-500',
    icon: '✍️',
    gradient: 'from-violet-400 to-purple-500',
  },
  '30-Second Summary': {
    border: 'border-cyan-200',
    bg: 'from-cyan-50 to-white',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dot: 'bg-cyan-500',
    icon: '📝',
    gradient: 'from-cyan-400 to-sky-500',
  },
}

const ScoreIndicator = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const getScoreMessage = (score) => {
    if (score === null) return 'Score not detected'
    if (score >= 80) return 'Excellent match! Your resume is well-optimized.'
    if (score >= 60) return 'Good match with room for improvement.'
    if (score >= 40) return 'Needs significant optimization.'
    return 'Critical issues detected. Major improvements needed.'
  }

  return (
    <div className="relative">
      {/* Animated background rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-2xl animate-pulse" />
      
      {/* Main score circle */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            className="dark:stroke-slate-700"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (score || 0) / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
            {score ?? '--'}
          </span>
          <span className="text-sm text-slate-500">out of 100</span>
        </div>
      </div>
      
      {/* Score message */}
      <p className={`mt-4 text-center font-medium ${getScoreColor(score)}`}>
        {getScoreMessage(score)}
      </p>
    </div>
  )
}

const FloatingShape = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
    animate={{
      y: [0, 20, 0],
      x: [0, 10, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)

const ATSFeedback = () => {
  const location = useLocation()
  const [payload, setPayload] = useState(location.state || null)
  const [expandedSection, setExpandedSection] = useState(null)
  const [courseRecs, setCourseRecs] = useState(null) // null = not yet fetched
  const [coursesLoading, setCoursesLoading] = useState(false)
  const hasFetchedCourses = useRef(false)

  useEffect(() => {
    if (payload) return

    const savedPayload = sessionStorage.getItem('ats_feedback_payload')
    if (!savedPayload) return

    try {
      const parsed = JSON.parse(savedPayload)
      setPayload(parsed)
    } catch {
      setPayload(null)
    }
  }, [payload])

  // Fetch AI course recommendations based on missing keywords
  useEffect(() => {
    if (!payload || hasFetchedCourses.current) return
    hasFetchedCourses.current = true

    const parsedSecs = parseSections(payload.analysisText || '')
    const missingSec = parsedSecs.find((s) => s.heading === 'Missing Keywords')
    const keywords = missingSec?.content
      ?.split('\n')
      .map((l) => sanitizeLine(l))
      .filter(Boolean)
      .slice(0, 10)
      .join(', ')

    if (!keywords) {
      setCourseRecs([])
      return
    }

    setCoursesLoading(true)

    ;(async () => {
      try {
        await loadPuterScript()
        if (!window.puter?.ai?.chat) throw new Error('puter.js not available')

        const prompt = `You are a career development advisor. The candidate is applying for "${payload.jobTitle}" at "${payload.companyTitle}".
These skills were identified as missing from their resume by an ATS analysis: ${keywords}

Recommend 8 specific online courses to help close these skill gaps. Return ONLY a valid JSON array (no markdown, no code fences, no explanation):
[{"title":"Course Title","platform":"Coursera","skill":"specific skill this covers","level":"Beginner","duration":"approx duration"}]

Allowed platforms: Coursera, Udemy, YouTube, LinkedIn Learning, edX, freeCodeCamp`

        const response = await window.puter.ai.chat(prompt, { model: 'claude-sonnet-4' })
        const text = readPuterChatText(response)
        const match = text.match(/\[[\s\S]*\]/)
        if (!match) throw new Error('No JSON array in response')
        const parsed = JSON.parse(match[0])
        setCourseRecs(Array.isArray(parsed) ? parsed.slice(0, 8) : [])
      } catch {
        setCourseRecs([])
      } finally {
        setCoursesLoading(false)
      }
    })()
  }, [payload])

  const score = useMemo(() => extractScore(payload?.analysisText || ''), [payload])
  const sections = useMemo(() => parseSections(payload?.analysisText || ''), [payload])

  const generatedAt = useMemo(() => {
    if (!payload?.createdAt) return 'Unknown time'

    try {
      return new Date(payload.createdAt).toLocaleString()
    } catch {
      return payload.createdAt
    }
  }, [payload])

  const extractionTone = useMemo(() => {
    if (payload?.extractionStatus === 'success') {
      return {
        wrapper: 'border-emerald-200 bg-emerald-50',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '✅',
      }
    }

    if (payload?.extractionStatus === 'empty') {
      return {
        wrapper: 'border-amber-200 bg-amber-50',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: '⚠️',
      }
    }

    return {
      wrapper: 'border-slate-200 bg-slate-50',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: 'ℹ️',
    }
  }, [payload])

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50'>
      {/* Animated background shapes */}
      <FloatingShape className="top-20 left-10 w-72 h-72 bg-cyan-300/30" delay={0} />
      <FloatingShape className="top-40 right-10 w-96 h-96 bg-emerald-300/30" delay={2} />
      <FloatingShape className="bottom-20 left-1/3 w-80 h-80 bg-amber-300/30" delay={4} />

      <Navbar />

      <main className='relative pt-28 pb-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <AnimatePresence mode="wait">
            {!payload ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='rounded-[40px] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl p-10 text-center'
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                </div>
                <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
                  No Feedback Found Yet
                </h1>
                <p className='mt-3 text-slate-600 max-w-xl mx-auto text-lg'>
                  Submit your details on ATS Checker first, then your AI analysis will appear here.
                </p>
                <Link
                  to='/ats-checker'
                  className='inline-block mt-8 group relative'
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className='relative bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all transform group-hover:scale-105'>
                    Go To ATS Checker
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className='grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6'
                >
                  {/* Hero Card */}
                  <div className='rounded-[40px] bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-900 text-white p-8 shadow-2xl relative overflow-hidden group'>
                    {/* Simple pattern background */}
                    <div className="absolute inset-0 opacity-10">
                      <div 
                        className="absolute inset-0" 
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundRepeat: 'repeat'
                        }}
                      />
                    </div>

                    <div className='relative'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <span className='inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-sm'>
                          AI Resume Analyzer
                        </span>
                        <span className='inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-cyan-100 backdrop-blur-sm'>
                          Generated: {generatedAt}
                        </span>
                      </div>

                      <h1 className='mt-6 text-3xl sm:text-5xl font-bold leading-tight'>
                        ATS Feedback
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                          Report
                        </span>
                      </h1>
                      
                      <p className='mt-4 text-sm sm:text-base text-cyan-100/90 max-w-2xl leading-relaxed'>
                        Structured feedback generated from your CV and role requirements to improve ATS performance.
                      </p>

                      <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 hover:bg-white/15 transition-colors'>
                          <p className='text-xs text-cyan-200 uppercase tracking-widest mb-1'>Company</p>
                          <p className='text-lg font-semibold break-words'>{payload.companyTitle}</p>
                        </div>

                        <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 hover:bg-white/15 transition-colors'>
                          <p className='text-xs text-cyan-200 uppercase tracking-widest mb-1'>Job Name</p>
                          <p className='text-lg font-semibold break-words'>{payload.jobTitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Card */}
                  <div className='rounded-[40px] border border-cyan-100 bg-white/90 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-shadow'>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className='text-xs uppercase tracking-widest text-slate-500'>Overall Performance</p>
                        <p className='text-xl font-bold text-slate-800'>ATS Match Score</p>
                      </div>
                      <span className="text-4xl opacity-10">🎯</span>
                    </div>

                    <ScoreIndicator score={score} />

                    <Link
                      to='/ats-checker'
                      className='block mt-8 group relative'
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className='relative bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3.5 rounded-xl font-semibold text-center hover:from-emerald-700 hover:to-cyan-700 transition-all transform group-hover:scale-[1.02]'>
                        Analyze Another CV
                      </div>
                    </Link>
                  </div>
                </motion.div>

                {/* JD and Resume Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className='grid grid-cols-1 xl:grid-cols-2 gap-6'
                >
                  {/* Job Description */}
                  <div className='rounded-[32px] border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl p-6 hover:shadow-2xl transition-shadow'>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xl">
                        📋
                      </div>
                      <h2 className='text-xl font-bold text-slate-900'>Job Description Snapshot</h2>
                    </div>
                    <div className='relative'>
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-emerald-500 rounded-full" />
                      <p className='pl-4 text-sm text-slate-700 whitespace-pre-wrap leading-7 max-h-96 overflow-y-auto custom-scrollbar'>
                        {payload.jobDescription}
                      </p>
                    </div>
                  </div>

                  {/* Resume Extraction */}
                  <div className={`rounded-[32px] border p-6 shadow-xl backdrop-blur-xl ${extractionTone.wrapper}`}>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${extractionTone.wrapper.includes('emerald') ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'} flex items-center justify-center text-white text-xl`}>
                        {extractionTone.icon}
                      </div>
                      <div>
                        <h2 className='text-xl font-bold text-slate-900'>Resume Content</h2>
                        <span className={`inline-block mt-1 rounded-full border px-3 py-1 text-xs font-semibold ${extractionTone.badge}`}>
                          {payload.extractionStatus || 'unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className='space-y-4'>
                      <div className='rounded-xl bg-white/80 p-4 text-sm border border-white'>
                        <p className='font-semibold text-slate-900 mb-2'>Extraction Details:</p>
                        <p className='text-slate-700'>{payload.extractionDetails || 'No extraction details available.'}</p>
                      </div>
                      
                      <div className='relative'>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-400 to-slate-500 rounded-full" />
                        <pre className='pl-4 text-xs sm:text-sm whitespace-pre-wrap break-words text-slate-800 max-h-60 overflow-y-auto custom-scrollbar'>
                          {payload.resumeExtractedText || 'No extracted resume text found. Please run analysis again.'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Feedback Sections */}
                <motion.section
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                >
                  {sections.map((section, index) => {
                    const lines = section.content
                      .split('\n')
                      .map((line) => sanitizeLine(line))
                      .filter(Boolean)

                    const isSummary = section.heading === '30-Second Summary'
                    const cardStyle = SECTION_CARD_STYLES[section.heading] || {
                      border: 'border-slate-200',
                      bg: 'from-slate-50 to-white',
                      badge: 'bg-slate-100 text-slate-800 border-slate-200',
                      dot: 'bg-slate-500',
                      icon: '📌',
                      gradient: 'from-slate-400 to-slate-500',
                    }

                    const isExpanded = expandedSection === section.heading

                    return (
                      <motion.article
                        key={section.heading}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`group rounded-2xl border bg-gradient-to-b p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${cardStyle.border} ${cardStyle.bg}`}
                        onClick={() => setExpandedSection(isExpanded ? null : section.heading)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cardStyle.gradient} flex items-center justify-center text-white text-lg`}>
                              {cardStyle.icon}
                            </div>
                            <div>
                              <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${cardStyle.badge}`}>
                                Section
                              </span>
                              <h3 className='mt-2 text-base font-bold text-slate-900'>{section.heading}</h3>
                            </div>
                          </div>
                          <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>

                        <AnimatePresence>
                          {lines.length === 0 ? (
                            <p className='mt-3 text-sm text-slate-500 italic'>No specific feedback found.</p>
                          ) : isSummary ? (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className='mt-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap'
                            >
                              {isExpanded ? lines.join(' ') : `${lines.join(' ').slice(0, 120)}...`}
                            </motion.p>
                          ) : (
                            <motion.ul className='mt-3 space-y-2 text-sm text-slate-700'>
                              {(isExpanded ? lines : lines.slice(0, 3)).map((line, idx) => (
                                <motion.li
                                  key={`${section.heading}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className='flex items-start gap-2 group/item'
                                >
                                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${cardStyle.dot} group-hover/item:scale-125 transition-transform`} />
                                  <span className="flex-1">{line}</span>
                                </motion.li>
                              ))}
                              {!isExpanded && lines.length > 3 && (
                                <li className="text-xs text-slate-500 mt-2">
                                  +{lines.length - 3} more items...
                                </li>
                              )}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    )
                  })}
                </motion.section>

                {/* Learning Resources */}
                <motion.section
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.38 }}
                  className='rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-xl'
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                      🎓
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-slate-900'>Recommended Learning Resources</h2>
                      <p className='text-sm text-slate-500'>Courses tailored to bridge your skill gaps for this role</p>
                    </div>
                  </div>

                  {coursesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
                          <div className="h-4 w-1/2 bg-slate-200 rounded mb-3" />
                          <div className="h-5 w-full bg-slate-200 rounded mb-2" />
                          <div className="h-4 w-3/4 bg-slate-200 rounded mb-4" />
                          <div className="h-9 w-full bg-slate-200 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : courseRecs === null ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                      <span className="text-5xl">📚</span>
                      <p className="text-sm">Analyzing your skill gaps to find the best courses...</p>
                    </div>
                  ) : courseRecs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                      <span className="text-5xl">😕</span>
                      <p className="font-medium text-slate-600">Could not load recommendations at this time.</p>
                      <p className="text-sm">Try running a new analysis to generate course suggestions.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {courseRecs.map((course, idx) => {
                        const platform = PLATFORM_CONFIG[course.platform] || PLATFORM_CONFIG['YouTube']
                        const levelStyle = LEVEL_BADGE[course.level] || 'bg-slate-100 text-slate-700 border-slate-200'
                        const courseUrl = platform.url(course.skill || course.title)

                        return (
                          <motion.a
                            key={idx}
                            href={courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            whileHover={{ y: -4 }}
                            className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all no-underline"
                          >
                            {/* Platform badge */}
                            <span className={`self-start inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${platform.color}`}>
                              <span>{platform.emoji}</span>
                              {course.platform}
                            </span>

                            {/* Title */}
                            <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors flex-1">
                              {course.title}
                            </h3>

                            {/* Skill covered */}
                            <p className="mt-1.5 text-xs text-slate-500 italic line-clamp-1">
                              {course.skill}
                            </p>

                            {/* Level + Duration row */}
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${levelStyle}`}>
                                {course.level}
                              </span>
                              {course.duration && (
                                <span className="text-[10px] text-slate-400">⏱ {course.duration}</span>
                              )}
                            </div>

                            {/* CTA */}
                            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                              View course <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                            </div>
                          </motion.a>
                        )
                      })}
                    </div>
                  )}
                </motion.section>

                {/* Raw Response */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className='rounded-[32px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-xl'
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl">
                        🤖
                      </div>
                      <div>
                        <h2 className='text-xl font-bold text-cyan-900'>Raw AI Response</h2>
                        <p className='text-xs text-cyan-700'>Original text returned by the model</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className='relative'>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                    <pre className='pl-4 text-xs sm:text-sm whitespace-pre-wrap break-words text-slate-800 max-h-60 overflow-y-auto custom-scrollbar'>
                      {payload.analysisText}
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

export default ATSFeedback