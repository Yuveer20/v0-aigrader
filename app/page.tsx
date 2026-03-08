"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, BookOpen, Sparkles, Zap, Target } from "lucide-react"
import { ThoriumLogo } from "@/components/thorium-logo"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full btn-gradient pulse-glow" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative grid-pattern">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThoriumLogo size={44} className="glow" />
            <span className="text-2xl font-bold text-gradient tracking-tight">Thorium</span>
          </div>
          <Button 
            onClick={() => signIn("google")} 
            className="btn-gradient border-0 font-semibold tracking-wide"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-200/80 font-medium">Powered by AI</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              Your Personal AI
              <br />
              <span className="text-gradient glow-text">Learning Assistant</span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-100/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect your Google Classroom and get personalized AI tutoring to analyze your grades, 
              create study plans, and help you improve in every subject.
            </p>
            <Button 
              size="lg" 
              onClick={() => signIn("google")}
              className="btn-gradient text-lg px-10 py-7 font-semibold tracking-wide border-0 rounded-xl"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect with Google Classroom
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Grade Analysis"
              description="Get detailed insights into your academic performance across all your courses with AI-powered analysis."
              gradient="from-blue-500 to-cyan-400"
            />
            <FeatureCard
              icon={<Brain className="w-7 h-7" />}
              title="AI Tutoring"
              description="Chat with an AI tutor that understands your coursework and can help explain difficult concepts."
              gradient="from-cyan-400 to-emerald-400"
            />
            <FeatureCard
              icon={<BookOpen className="w-7 h-7" />}
              title="Study Plans"
              description="Receive personalized study plans based on your upcoming assignments and areas needing improvement."
              gradient="from-violet-500 to-blue-500"
            />
          </div>

          {/* How It Works */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
              <p className="text-cyan-100/60 text-lg">Get started in three simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                step="1"
                icon={<Zap className="w-5 h-5" />}
                title="Connect"
                description="Sign in with your Google account and grant access to your Google Classroom data."
              />
              <StepCard
                step="2"
                icon={<Target className="w-5 h-5" />}
                title="Analyze"
                description="We'll automatically pull your courses, assignments, and grades to understand your academic situation."
              />
              <StepCard
                step="3"
                icon={<Sparkles className="w-5 h-5" />}
                title="Improve"
                description="Chat with your AI tutor to get help, create study plans, and track your progress."
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="glass-card rounded-2xl p-12 border-gradient">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to boost your grades?</h2>
              <p className="text-cyan-100/60 mb-8 max-w-xl mx-auto">
                Join students who are already using AI to improve their academic performance.
              </p>
              <Button 
                size="lg" 
                onClick={() => signIn("google")}
                className="btn-gradient text-lg px-8 py-6 font-semibold border-0 rounded-xl"
              >
                Get Started Free
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ThoriumLogo size={28} />
              <span className="text-sm text-muted-foreground font-medium">Thorium</span>
            </div>
            <p className="text-sm text-cyan-200/40">
              Built to help students succeed
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="glass-card rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-cyan-100/60 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ 
  step, 
  icon,
  title, 
  description 
}: { 
  step: string
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="text-center group">
      <div className="relative inline-block mb-6">
        <div className="w-16 h-16 btn-gradient rounded-2xl flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform">
          {step}
        </div>
        <div className="absolute -right-1 -top-1 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-cyan-400">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-cyan-100/60 leading-relaxed">{description}</p>
    </div>
  )
}
