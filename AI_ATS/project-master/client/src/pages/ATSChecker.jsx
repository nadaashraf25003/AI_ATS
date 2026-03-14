import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MAX_FILE_SIZE_MB = 5
const PUTER_SCRIPT_SRC = 'https://js.puter.com/v2/'
const MAX_RESUME_PREVIEW_CHARS = 20000

const readPuterChatText = (response) => {
  if (!response) return ''

  if (typeof response === 'string') {
    return response.trim()
  }

  if (typeof response.text === 'string') {
    return response.text.trim()
  }

  const messageContent = response?.message?.content

  if (typeof messageContent === 'string') {
    return messageContent.trim()
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === 'string') return item
        if (typeof item?.text === 'string') return item.text
        return ''
      })
      .join('\n')
      .trim()
  }

  return ''
}

const loadPuterScript = () => {
  if (window.puter) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${PUTER_SCRIPT_SRC}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load puter.js script.')))
      return
    }

    const script = document.createElement('script')
    script.src = PUTER_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load puter.js script.'))
    document.body.appendChild(script)
  })
}

const FloatingShape = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
    animate={{
      y: [0, 30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)

const ATSChecker = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    companyTitle: '',
    jobTitle: '',
    jobDescription: '',
    cvFile: null,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, cvFile: selectedFile }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
      } else {
        setFormData((prev) => ({ ...prev, cvFile: file }))
        toast.success(`File selected: ${file.name}`)
      }
    }
  }

  const validateFile = (file) => {
    if (!file) {
      return 'Please upload your CV.'
    }

    const allowedExtensions = ['pdf', 'doc', 'docx']
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    if (!allowedExtensions.includes(extension)) {
      return 'Only PDF, DOC, and DOCX files are allowed.'
    }

    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB.`
    }

    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const companyTitle = formData.companyTitle.trim()
    const jobTitle = formData.jobTitle.trim()
    const jobDescription = formData.jobDescription.trim()
    const fileError = validateFile(formData.cvFile)

    if (!companyTitle) {
      toast.error('Company title is required.')
      return
    }

    if (!jobTitle) {
      toast.error('Job name is required.')
      return
    }

    if (!jobDescription) {
      toast.error('Job description is required.')
      return
    }

    if (jobDescription.length < 50) {
      toast.error('Job description should be at least 50 characters.')
      return
    }

    if (fileError) {
      toast.error(fileError)
      return
    }

    setIsAnalyzing(true)

    let uploadedPath = ''
    let analysisSucceeded = false
    let analysisResult = ''
    let extractedResumeText = ''
    let extractionStatus = 'not-started'
    let extractionDetails = ''

    try {
      await loadPuterScript()

      if (!window.puter?.ai?.chat || !window.puter?.fs?.write) {
        throw new Error('puter.js is not available. Please refresh and try again.')
      }

      const fileExtension = formData.cvFile.name.split('.').pop()?.toLowerCase() || 'pdf'
      const puterFile = await window.puter.fs.write(
        `temp_resume_${Date.now()}.${fileExtension}`,
        formData.cvFile,
      )

      uploadedPath = puterFile.path

      const extractPrompt = [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              puter_path: uploadedPath,
            },
            {
              type: 'text',
              text:
                'Extract the resume text from this file exactly as readable plain text. Do not summarize. Keep section titles and bullet points. Return only the extracted resume text.',
            },
          ],
        },
      ]

      const extractResponse = await window.puter.ai.chat(extractPrompt, {
        model: 'claude-sonnet-4',
      })

      extractedResumeText = readPuterChatText(extractResponse).slice(0, MAX_RESUME_PREVIEW_CHARS)
      extractionStatus = extractedResumeText ? 'success' : 'empty'
      extractionDetails = extractedResumeText
        ? `Extracted ${extractedResumeText.length} characters from ${formData.cvFile.name}`
        : `No readable text extracted from ${formData.cvFile.name}. File may be image-based or protected.`

      const atsPrompt = [
        {
          role: 'system',
          content:
            'You are a strict ATS resume analyzer. Evaluate resume vs job requirements. Return practical, concise feedback in markdown with these sections exactly: ATS Match Score (0-100), Missing Keywords, Strong Matches, Resume Issues, Rewrite Suggestions, 30-Second Summary.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'file',
              puter_path: uploadedPath,
            },
            {
              type: 'text',
              text: `Analyze this resume for ATS fit using the provided role details.\n\nCompany: ${companyTitle}\nJob Name: ${jobTitle}\nJob Description:\n${jobDescription}\n\nExtracted Resume Text (for verification):\n${extractedResumeText || 'No extracted resume text available.'}`,
            },
          ],
        },
      ]

      const stream = await window.puter.ai.chat(atsPrompt, {
        model: 'claude-sonnet-4',
        stream: true,
      })

      let combinedText = ''
      for await (const chunk of stream) {
        if (chunk?.text) {
          combinedText += chunk.text
        }
      }

      if (!combinedText.trim()) {
        throw new Error('No analysis text was returned. Please try again.')
      }

      analysisResult = combinedText.trim()
      analysisSucceeded = true
      toast.success('ATS analysis complete.')
      console.log('Resume text sent to AI analyzer:', extractedResumeText || '[No extracted text]')
      console.log('Resume extraction details:', extractionDetails)
    } catch (error) {
      const errorMessage = error?.message || 'Failed to analyze resume with AI.'
      toast.error(errorMessage)
    } finally {
      if (uploadedPath && window.puter?.fs?.delete) {
        try {
          await window.puter.fs.delete(uploadedPath)
        } catch {
          // Ignore cleanup failure.
        }
      }

      setIsAnalyzing(false)
    }

    if (analysisSucceeded) {
      const feedbackPayload = {
        analysisText: analysisResult,
        resumeExtractedText: extractedResumeText,
        extractionStatus,
        extractionDetails,
        companyTitle,
        jobTitle,
        jobDescription,
        createdAt: new Date().toISOString(),
      }

      sessionStorage.setItem('ats_feedback_payload', JSON.stringify(feedbackPayload))

      setFormData({
        companyTitle: '',
        jobTitle: '',
        jobDescription: '',
        cvFile: null,
      })

      navigate('/ats-feedback', {
        state: feedbackPayload,
      })
    }
  }

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50'>
      {/* Animated background shapes */}
      <FloatingShape className="top-20 left-10 w-96 h-96 bg-emerald-300/20" delay={0} />
      <FloatingShape className="top-40 right-10 w-80 h-80 bg-cyan-300/20" delay={2} />
      <FloatingShape className="bottom-20 left-1/3 w-72 h-72 bg-amber-300/20" delay={4} />
      <FloatingShape className="bottom-40 right-1/4 w-64 h-64 bg-violet-300/20" delay={6} />

      {/* Grid overlay - FIXED: Using style prop instead of className with complex URL */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      <Navbar />

      <main className='relative pt-28 pb-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-200/50 text-emerald-700 text-sm font-medium mb-4">
              🎯 AI-Powered ATS Analysis
            </span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Optimize Your Resume for ATS
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Get instant AI feedback on your resume's compatibility with any job description
            </p>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8'>
            {/* Left Column - Info Card */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className='relative group'
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className='relative rounded-[40px] bg-gradient-to-br from-slate-900 via-emerald-900 to-cyan-900 text-white p-8 shadow-2xl overflow-hidden'>
                {/* Animated background pattern */}
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
                  <div className="flex items-center gap-3 mb-6">
                    <span className='inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-100 backdrop-blur-sm'>
                      ATS Intelligence
                    </span>
                    <span className='inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 border border-emerald-500/30'>
                      v2.0
                    </span>
                  </div>
                  
                  <h2 className='text-3xl sm:text-4xl font-bold leading-tight'>
                    Turn Your Resume Into A
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                      High-Match Candidate Profile
                    </span>
                  </h2>
                  
                  <p className='mt-6 text-emerald-100/90 leading-relaxed'>
                    Submit company, role, job description, and your CV. The analyzer scores ATS compatibility, finds missing keywords, and gives targeted rewrite suggestions.
                  </p>

                  <div className='mt-8 space-y-4'>
                    {[
                      {
                        step: '01',
                        title: 'Paste Job Description',
                        desc: 'Copy and paste the exact job description for accurate matching'
                      },
                      {
                        step: '02',
                        title: 'Upload Your CV',
                        desc: 'Upload a text-based PDF or DOCX for best extraction results'
                      },
                      {
                        step: '03',
                        title: 'Get Instant Feedback',
                        desc: 'Receive a comprehensive ATS report with actionable insights'
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className='rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 transition-colors'
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-2xl font-bold text-emerald-300/50">{item.step}</span>
                          <div>
                            <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-emerald-100/70">{item.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className='mt-8 grid grid-cols-2 gap-4'>
                    <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5'>
                      <p className='text-xs uppercase tracking-widest text-emerald-200 mb-1'>Model</p>
                      <p className='text-lg font-semibold flex items-center gap-2'>
                        <span className="text-2xl">🤖</span>
                        Claude Sonnet 4
                      </p>
                    </div>
                    <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5'>
                      <p className='text-xs uppercase tracking-widest text-emerald-200 mb-1'>Report</p>
                      <p className='text-lg font-semibold flex items-center gap-2'>
                        <span className="text-2xl">📊</span>
                        Score + Gaps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Right Column - Form Card */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className='relative'
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-[40px] blur-2xl" />
              <div className='relative rounded-[40px] border border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl p-8'>
                <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
                  <div>
                    <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent'>
                      ATS Checker Form
                    </h2>
                    <p className='mt-1 text-sm text-slate-600'>Provide complete role context for precise evaluation</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='relative flex h-3 w-3'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
                    </span>
                    <span className='text-xs font-medium text-slate-600'>Secure Upload</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Company Title */}
                  <div className="group">
                    <label htmlFor='companyTitle' className='block mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 group-focus-within:text-emerald-600 transition-colors'>
                      Company Title
                    </label>
                    <div className="relative">
                      <input
                        id='companyTitle'
                        name='companyTitle'
                        type='text'
                        value={formData.companyTitle}
                        onChange={handleTextChange}
                        placeholder='e.g., Google, Microsoft, Amazon'
                        className='w-full rounded-xl border-2 border-slate-200 bg-white/50 px-4 py-3.5 pl-11 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900'
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 group-focus-within:text-emerald-500 transition-colors">🏢</span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="group">
                    <label htmlFor='jobTitle' className='block mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 group-focus-within:text-emerald-600 transition-colors'>
                      Job Title
                    </label>
                    <div className="relative">
                      <input
                        id='jobTitle'
                        name='jobTitle'
                        type='text'
                        value={formData.jobTitle}
                        onChange={handleTextChange}
                        placeholder='e.g., Frontend Developer, Data Analyst'
                        className='w-full rounded-xl border-2 border-slate-200 bg-white/50 px-4 py-3.5 pl-11 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900'
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 group-focus-within:text-emerald-500 transition-colors">💼</span>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="group">
                    <label htmlFor='jobDescription' className='block mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 group-focus-within:text-emerald-600 transition-colors'>
                      Job Description
                    </label>
                    <div className="relative">
                      <textarea
                        id='jobDescription'
                        name='jobDescription'
                        rows='6'
                        value={formData.jobDescription}
                        onChange={handleTextChange}
                        placeholder='Paste the full job description here...'
                        className='w-full rounded-xl border-2 border-slate-200 bg-white/50 px-4 py-3.5 pl-11 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 resize-y'
                        required
                      />
                      <span className="absolute left-3 top-5 text-lg text-slate-400 group-focus-within:text-emerald-500 transition-colors">📋</span>
                    </div>
                    <p className='mt-2 text-xs text-slate-500 flex items-center gap-1'>
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                      Minimum 50 characters recommended
                    </p>
                  </div>

                  {/* File Upload */}
                  <div className="group">
                    <label htmlFor='cvFile' className='block mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600'>
                      Upload Your CV
                    </label>
                    <div
                      className={`relative rounded-xl border-2 border-dashed transition-all ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        id='cvFile'
                        name='cvFile'
                        type='file'
                        accept='.pdf,.doc,.docx'
                        onChange={handleFileChange}
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      />
                      
                      <div className='p-6 text-center'>
                        <div className="flex justify-center mb-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                            <span className="text-3xl">📎</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-700 font-medium mb-1">
                          {formData.cvFile ? formData.cvFile.name : 'Drag & drop or click to upload'}
                        </p>
                        
                        {!formData.cvFile && (
                          <p className="text-xs text-slate-500">
                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                          </p>
                        )}
                        
                        {formData.cvFile && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                          >
                            <span>✅</span>
                            File selected
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className='mt-3 flex flex-wrap gap-2'>
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200'>
                        📄 PDF
                      </span>
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200'>
                        📝 DOC
                      </span>
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200'>
                        📃 DOCX
                      </span>
                      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200'>
                        ⚡ Max 5MB
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type='submit'
                    disabled={isAnalyzing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold px-8 py-4 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl group-hover:blur-2xl" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Analyzing Your Resume...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Generate ATS Feedback</span>
                          <span>→</span>
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Info Box */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className='rounded-xl bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 border border-emerald-100/50 p-4'
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className='text-sm text-slate-700'>
                          After clicking Generate, you'll be redirected to a detailed feedback page with your complete ATS analysis.
                        </p>
                        {isAnalyzing && (
                          <p className='mt-2 text-sm text-emerald-600 flex items-center gap-2'>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            AI is extracting and analyzing your resume...
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </form>
              </div>
            </motion.section>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-2xl">⚡</span>
              <span className="text-sm">Real-time analysis</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-2xl">🤖</span>
              <span className="text-sm">Powered by Claude Sonnet 4</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-2xl">🗑️</span>
              <span className="text-sm">Auto-delete after analysis</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Custom styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

export default ATSChecker