"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  GenerateResponse,
  Platform,
  Tone,
} from "../types";
import { PLATFORMS, TONES } from "../types";

type Tab = "hooks" | "script" | "storyboard" | "cta";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube-shorts");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<Tone>("Educational");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("hooks");
  const [teleprompterMode, setTeleprompterMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedButton, setCopiedButton] = useState<string | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || !audience.trim()) {
      setError("Please fill in topic and audience");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, audience, tone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }
      const data: GenerateResponse = await res.json();
      setResult(data);
      setActiveTab("hooks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback((text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    if (typeof id === "number") {
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedButton(id);
      setTimeout(() => setCopiedButton(null), 2000);
    }
  }, []);

  // Teleprompter auto-scroll
  useEffect(() => {
    if (!teleprompterMode || !teleprompterRef.current) return;
    const el = teleprompterRef.current;
    const totalScroll = el.scrollHeight - el.clientHeight;
    if (totalScroll <= 0) return;
    const duration = totalScroll * 30;
    let start: number | null = null;
    let animId: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = (ts - start) / duration;
      if (progress < 1) {
        el.scrollTop = totalScroll * progress;
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [teleprompterMode]);

  const fullScriptText = result
    ? result.script.sections
        .map((s) => `${s.timestamp} ${s.text}`)
        .join("\n\n")
    : "";

  const fullStoryboardText = result
    ? result.storyboard
        .map(
          (s) =>
            `Scene ${s.sceneNumber} (${s.duration})\nVisual: ${s.visualDescription}\nOn-screen: ${s.onScreenText}\nAudio: ${s.audioNote}`
        )
        .join("\n\n")
    : "";

  const styleBadgeColor: Record<string, string> = {
    Question: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Shock: "bg-red-500/20 text-red-400 border-red-500/30",
    Story: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Stat: "bg-green-500/20 text-green-400 border-green-500/30",
    Controversial: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold">
            VS
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Video<span className="text-red-500">Script</span> Studio
          </h1>
          <span className="text-xs text-zinc-500 ml-2 hidden sm:inline">
            AI-Powered Creator Tool
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Input Section */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Create Your Script
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Topic */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-2">
                Video Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 VS Code extensions every dev needs"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
              />
            </div>

            {/* Platform */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-400 mb-2">
                Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      platform === p.id
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium text-sm">{p.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {p.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. beginner developers, 18-30"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                      tone === t
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-8 py-3 font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Script"
              )}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
              {(
                [
                  { id: "hooks", label: "Hooks", count: result.hooks.length },
                  {
                    id: "script",
                    label: "Script",
                    count: result.script.sections.length,
                  },
                  {
                    id: "storyboard",
                    label: "Storyboard",
                    count: result.storyboard.length,
                  },
                  { id: "cta", label: "CTAs", count: result.ctas.length },
                ] as { id: Tab; label: string; count: number }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTeleprompterMode(false);
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs text-zinc-600">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              {/* HOOKS TAB */}
              {activeTab === "hooks" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Hook Options
                    <span className="text-zinc-500 text-sm font-normal ml-2">
                      Ranked by impact
                    </span>
                  </h3>
                  {result.hooks.map((hook, i) => (
                    <div
                      key={i}
                      onClick={() => copyToClipboard(hook.text, i)}
                      className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-red-500/30 hover:bg-red-500/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-zinc-500">
                              #{i + 1}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                styleBadgeColor[hook.style] ||
                                "bg-zinc-500/20 text-zinc-400"
                              }`}
                            >
                              {hook.style}
                            </span>
                          </div>
                          <p className="text-lg sm:text-xl font-bold leading-snug mb-3">
                            &ldquo;{hook.text}&rdquo;
                          </p>
                          <p className="text-sm text-zinc-500 italic">
                            {hook.whyItWorks}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-zinc-600 group-hover:text-red-400 transition-colors">
                          {copiedIndex === i ? "Copied!" : "Click to copy"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SCRIPT TAB */}
              {activeTab === "script" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Full Script</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTeleprompterMode(!teleprompterMode)}
                        className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                          teleprompterMode
                            ? "border-red-500 bg-red-500/10 text-red-400"
                            : "border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        {teleprompterMode ? "Exit Teleprompter" : "Teleprompter Mode"}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(fullScriptText, "fullscript")
                        }
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:border-white/20 transition-all"
                      >
                        {copiedButton === "fullscript"
                          ? "Copied!"
                          : "Copy Full Script"}
                      </button>
                    </div>
                  </div>

                  {teleprompterMode ? (
                    <div
                      ref={teleprompterRef}
                      className="h-[60vh] overflow-y-auto rounded-xl bg-black p-8 sm:p-12"
                    >
                      <div className="max-w-2xl mx-auto space-y-8">
                        {result.script.sections.map((section, i) => (
                          <p
                            key={i}
                            className="text-2xl sm:text-3xl font-medium leading-relaxed text-center text-white"
                          >
                            {section.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {result.script.sections.map((section, i) => (
                        <div
                          key={i}
                          className="flex gap-4 py-3 border-b border-white/5 last:border-0"
                        >
                          <span className="shrink-0 font-mono text-sm text-red-400/70 w-14 pt-0.5">
                            {section.timestamp}
                          </span>
                          <div className="flex-1">
                            <p className="text-white leading-relaxed">
                              {section.text}
                            </p>
                            {section.visualNote && (
                              <p className="text-sm text-zinc-500 italic mt-1">
                                Visual: {section.visualNote}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STORYBOARD TAB */}
              {activeTab === "storyboard" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Visual Storyboard</h3>
                    <button
                      onClick={() =>
                        copyToClipboard(fullStoryboardText, "storyboard")
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:border-white/20 transition-all"
                    >
                      {copiedButton === "storyboard"
                        ? "Copied!"
                        : "Copy Storyboard"}
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
                    {result.storyboard.map((scene, i) => (
                      <div
                        key={i}
                        className="snap-start shrink-0 w-72 rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-300">
                            Scene {scene.sceneNumber}
                          </span>
                          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                            {scene.duration}
                          </span>
                        </div>
                        <div className="h-24 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center p-3 border border-white/5">
                          <p className="text-xs text-zinc-400 text-center leading-relaxed">
                            {scene.visualDescription}
                          </p>
                        </div>
                        {scene.onScreenText && (
                          <div>
                            <span className="text-xs text-zinc-500 block mb-1">
                              On-screen text
                            </span>
                            <p className="text-sm text-white font-medium">
                              {scene.onScreenText}
                            </p>
                          </div>
                        )}
                        {scene.audioNote && (
                          <div>
                            <span className="text-xs text-zinc-500 block mb-1">
                              Audio
                            </span>
                            <p className="text-xs text-zinc-400 italic">
                              {scene.audioNote}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA TAB */}
              {activeTab === "cta" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Call-to-Action Options
                  </h3>
                  {result.ctas.map((cta, i) => (
                    <div
                      key={i}
                      onClick={() => copyToClipboard(cta.text, i + 100)}
                      className="group cursor-pointer flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-red-500/30"
                    >
                      <div>
                        <p className="text-white font-medium mb-1">
                          &ldquo;{cta.text}&rdquo;
                        </p>
                        <span className="text-xs text-zinc-500">
                          Placement:{" "}
                          <span className="text-zinc-400">{cta.placement}</span>
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600 group-hover:text-red-400 transition-colors">
                        {copiedIndex === i + 100 ? "Copied!" : "Click to copy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata Bar */}
            {result.metadata && (
              <div className="flex flex-wrap gap-6 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-4 text-sm">
                <div>
                  <span className="text-zinc-500">Duration </span>
                  <span className="text-white font-medium">
                    {result.metadata.estimatedDuration}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Words </span>
                  <span className="text-white font-medium">
                    {result.metadata.wordCount}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Pace </span>
                  <span className="text-white font-medium">
                    {result.metadata.readingPace}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
