"use client";

import { useState, useEffect, useRef } from "react";
import SettingsModal from "@/components/SettingsModal";
import AuthModal from "@/components/auth/AuthModal";
import TopicForm from "@/components/TopicForm";
import { useAuth } from "@/hooks/useAuth";
import GenerationProgress from "@/components/GenerationProgress";
import LoadingMessages from "@/components/LoadingMessages";
import GridView from "@/components/GridView";
import SlideshowView from "@/components/SlideshowView";
import SlideEditModal from "@/components/SlideEditModal";
import PresentationSettings from "@/components/PresentationSettings";
import ViewToggle from "@/components/ViewToggle";
import BananaRain from "@/components/BananaRain";
import BananaConfetti from "@/components/BananaConfetti";
import PresentationsList from "@/components/PresentationsList";
import { usePresentation } from "@/hooks/usePresentation";
import { downloadAllSlides, downloadAsPDF } from "@/lib/download";
import { formatDistanceToNow } from "date-fns";
import { SlideStyle, AbsurdityLevel, AttachedImage } from "@/lib/types";
import { BulletPointsCount } from "@/components/BulletPointsSlider";
import { SlideCount } from "@/components/SlideCountSlider";
import TokenBalance from "@/components/TokenBalance";

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<"grid" | "slideshow">("grid");
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [currentStyle, setCurrentStyle] = useState<SlideStyle | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevGenerationStatusRef = useRef<string | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [showBlankModal, setShowBlankModal] = useState(false);
  const [blankTitle, setBlankTitle] = useState("");

  const { user, loading: authLoading, signOut } = useAuth();

  const {
    presentation,
    generationState,
    regeneratingSlideId,
    isSaving,
    lastSaved,
    generatePresentation,
    resetPresentation,
    regenerateSlideImage,
    updateSlide,
    deleteSlide,
    reorderSlides,
    addSlide,
    updateSettings,
    createBlankPresentation,
    regenerateSlideWithNewPrompt,
    loadPresentation,
    deletePresentation,
    savePresentation,
  } = usePresentation();

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/check-api-key");
        const data = await res.json();
        setHasApiKey(data.hasApiKey);
      } catch {
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  // Trigger confetti when generation completes (only on transition to "complete")
  useEffect(() => {
    const prevStatus = prevGenerationStatusRef.current;
    const currentStatus = generationState.status;

    // Only trigger confetti when transitioning TO complete from a generating state
    if (currentStatus === "complete" && prevStatus && prevStatus !== "complete" && prevStatus !== "idle") {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => setShowConfetti(true), 0);
      prevGenerationStatusRef.current = currentStatus;
      return () => clearTimeout(timeoutId);
    }

    prevGenerationStatusRef.current = currentStatus;
  }, [generationState.status]);

  const handleApiKeySave = () => {
    setHasApiKey(true);
  };

  const handleSubmit = (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: BulletPointsCount, slideCount: SlideCount, customStylePrompt?: string, context?: string, attachedImages?: AttachedImage[], useWebSearch?: boolean) => {
    setCurrentStyle(style);
    generatePresentation(topic, style, absurdity, maxBulletPoints, slideCount, customStylePrompt, context, attachedImages, useWebSearch);
  };

  const handleSlideClick = (slideId: string) => {
    setEditingSlideId(slideId);
  };

  const handlePlaySlide = (index: number) => {
    setSlideshowIndex(index);
    setCurrentView("slideshow");
  };

  const handleSlideUpdate = (slideId: string, updates: { title: string; bulletPoints: string[] }) => {
    updateSlide(slideId, updates);
  };

  const handleSlideDelete = (slideId: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      deleteSlide(slideId);
    }
  };

  const handleAddSlide = () => {
    const newSlideId = addSlide();
    // Open the edit modal for the new slide
    if (newSlideId && presentation) {
      setEditingSlideId(newSlideId);
    }
  };

  const handleNewPresentation = async () => {
    // Save current presentation if it exists and is already saved (has been persisted before)
    if (presentation?.isSaved && user) {
      await savePresentation(true);
    } else if (presentation && !presentation.isSaved && !confirm("Start a new presentation? Unsaved changes will be lost.")) {
      return;
    }
    resetPresentation();
    setCurrentView("grid");
    setSlideshowIndex(0);
  };

  const handleOpenBlankModal = async () => {
    // Save current presentation if it exists and is already saved
    if (presentation?.isSaved && user) {
      await savePresentation(true);
    } else if (presentation && !presentation.isSaved && !confirm("Start a new presentation? Unsaved changes will be lost.")) {
      return;
    }
    setShowBlankModal(true);
  };

  const handleLoadPresentation = async (id: string) => {
    // Save current presentation if it exists and is already saved
    if (presentation?.isSaved && user) {
      await savePresentation(true);
    } else if (presentation && !presentation.isSaved && !confirm("Load a different presentation? Unsaved changes will be lost.")) {
      return;
    }
    loadPresentation(id);
  };

  const isGenerating =
    generationState.status !== "idle" &&
    generationState.status !== "complete" &&
    generationState.status !== "error";

  const showPresentation =
    presentation && (generationState.status === "complete" || generationState.status === "generating-images");

  if (hasApiKey === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
        onSignIn={() => {
          setShowSettingsModal(false);
          setShowAuthModal(true);
        }}
        onSignOut={signOut}
        onApiKeySave={handleApiKeySave}
        onApiKeyClear={() => setHasApiKey(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Blank Presentation Modal */}
      {showBlankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">New Presentation</h3>
            <input
              type="text"
              placeholder="Presentation title..."
              value={blankTitle}
              onChange={(e) => setBlankTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 mb-4 focus:outline-none focus:border-white/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && blankTitle.trim()) {
                  createBlankPresentation(blankTitle.trim());
                  setBlankTitle("");
                  setShowBlankModal(false);
                }
                if (e.key === "Escape") {
                  setBlankTitle("");
                  setShowBlankModal(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBlankTitle("");
                  setShowBlankModal(false);
                }}
                className="flex-1 px-4 py-2 text-white/50 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (blankTitle.trim()) {
                    createBlankPresentation(blankTitle.trim());
                    setBlankTitle("");
                    setShowBlankModal(false);
                  }
                }}
                disabled={!blankTitle.trim()}
                className="flex-1 px-4 py-2 bg-white text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleNewPresentation}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <img src="/banana.svg" alt="" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">banana.fyi</h1>
              <p className="text-xs text-white/40">AI-powered slides</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {!authLoading && !user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm text-black rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                  boxShadow: "0 2px 0 #a1a1aa, 0 3px 8px rgba(0,0,0,0.2)",
                }}
              >
                Sign In
              </button>
            )}
            {!authLoading && user && <TokenBalance />}
            <button
              onClick={handleOpenBlankModal}
              className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-white/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Initial form state */}
        {!showPresentation && !isGenerating && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-10">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 text-white/50 text-sm font-medium border border-white/10">
                AI-Powered Slides 🍌
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Create presentations
                <br />
                <span className="bg-gradient-to-r from-white via-white/80 to-white/60 text-transparent bg-clip-text">
                  in seconds
                </span>
              </h2>
              <p className="text-xl text-white/40 max-w-xl mx-auto">
                Generate a full deck from any topic, or start from scratch and build your own.
              </p>
            </div>
            <TopicForm onSubmit={handleSubmit} isLoading={isGenerating} hasApiKey={hasApiKey ?? false} onSetApiKey={() => setShowSettingsModal(true)} />

            {/* Saved presentations list for logged-in users */}
            {user && (
              <PresentationsList
                onSelect={handleLoadPresentation}
                onDelete={deletePresentation}
                onCreate={handleOpenBlankModal}
              />
            )}
          </div>
        )}

        {/* Generation progress */}
        {isGenerating && !showPresentation && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
            <BananaRain />
            <div className="mb-8 text-center relative z-10">
              <LoadingMessages style={presentation?.style ?? currentStyle ?? undefined} />
              <p className="text-white/40">This usually takes about 30 seconds</p>
            </div>
            <GenerationProgress state={generationState} />
            {generationState.status === "error" && (
              <button
                onClick={handleNewPresentation}
                className="mt-6 px-6 py-3 text-black rounded-xl transition-all duration-150 font-bold hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                  boxShadow: "0 4px 0 #a1a1aa, 0 5px 15px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.8)",
                }}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Presentation display */}
        {showPresentation && (
          <>
            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-white/40 text-sm mb-1">Your presentation</p>
                <h2 className="text-2xl font-semibold text-white">
                  {presentation.topic}
                </h2>
                {generationState.status === "generating-images" && (
                  <p className="text-sm text-white/50 mt-1">
                    Generating slides... {generationState.currentSlide}/{generationState.totalSlides}
                  </p>
                )}
                {/* Save status indicator */}
                {user && generationState.status !== "generating-images" && (
                  <p className="text-sm text-white/40 mt-1">
                    {isSaving ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : lastSaved ? (
                      <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                    ) : presentation.isSaved ? (
                      <span>Saved</span>
                    ) : null}
                  </p>
                )}
              </div>
              <ViewToggle currentView={currentView} onToggle={setCurrentView} />
            </div>

            {/* Grid view */}
            {currentView === "grid" && (
              <>
                <GridView
                  slides={presentation.slides}
                  topic={presentation.topic}
                  onSlideClick={handleSlideClick}
                  onRetrySlide={regenerateSlideImage}
                  onDeleteSlide={handleSlideDelete}
                  onRegenerateSlide={regenerateSlideWithNewPrompt}
                  onReorderSlides={reorderSlides}
                  onAddSlide={handleAddSlide}
                  onPlaySlide={handlePlaySlide}
                />

                {/* Presentation Settings */}
                <PresentationSettings
                  style={presentation.style}
                  absurdity={presentation.absurdity}
                  customStylePrompt={presentation.customStylePrompt}
                  context={presentation.context}
                  attachedImages={presentation.attachedImages}
                  onStyleChange={(style) => updateSettings({ style })}
                  onAbsurdityChange={(absurdity) => updateSettings({ absurdity })}
                  onCustomStylePromptChange={(customStylePrompt) => updateSettings({ customStylePrompt })}
                  onContextChange={(context) => updateSettings({ context })}
                  onAttachedImagesChange={(attachedImages) => updateSettings({ attachedImages })}
                />

                {presentation.slides.some((s) => s.imageBase64 || s.imageUrl) && (
                  <div className="flex justify-center gap-3 mt-8">
                    <button
                      onClick={() => downloadAsPDF(presentation.slides, presentation.topic)}
                      className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all duration-150 text-sm font-medium hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
                        boxShadow: "0 3px 0 #27272a, 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Download PDF
                    </button>
                    <button
                      onClick={() => downloadAllSlides(presentation.slides, presentation.topic)}
                      className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all duration-150 text-sm font-medium hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
                        boxShadow: "0 3px 0 #27272a, 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download ZIP
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Slideshow view */}
            {currentView === "slideshow" && (
              <SlideshowView
                slides={presentation.slides}
                currentIndex={slideshowIndex}
                onIndexChange={setSlideshowIndex}
                onExit={() => setCurrentView("grid")}
              />
            )}
          </>
        )}
      </main>

      {/* Banana confetti on completion */}
      {showConfetti && <BananaConfetti onComplete={() => setShowConfetti(false)} />}

      {/* Slide Edit Modal */}
      {presentation && (
        <SlideEditModal
          isOpen={editingSlideId !== null}
          slide={editingSlideId !== null ? presentation.slides.find(s => s.id === editingSlideId) ?? null : null}
          slideId={editingSlideId}
          isRegenerating={regeneratingSlideId === editingSlideId}
          topic={presentation.topic}
          existingTitles={presentation.slides.map(s => s.title)}
          onClose={() => setEditingSlideId(null)}
          onSave={handleSlideUpdate}
          onRegenerate={regenerateSlideWithNewPrompt}
          onDelete={handleSlideDelete}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-white/30">
          <span>🍌 Powered by Gemini</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <div className="flex items-center gap-3">
            <a
              href="/terms"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              Terms
            </a>
            <span className="text-white/20">•</span>
            <a
              href="/privacy"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              Privacy
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://x.com/memetic_mystic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
