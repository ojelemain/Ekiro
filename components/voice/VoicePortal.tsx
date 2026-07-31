"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Sprout, Wrench, Languages, CheckCircle2 } from "lucide-react";
import { useDialect } from "@/context/DialectContext";

type SubmissionKind = "produce" | "infrastructure";
type RecorderState = "idle" | "recording" | "review" | "submitted";

interface VoiceSubmission {
  id: string;
  kind: SubmissionKind;
  durationSeconds: number;
  createdAt: number;
  transcript: string | null;
}

// Minimal ambient typing for the Web Speech API, which is not present in
// standard TS DOM lib typings across all environments.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function VoicePortal() {
  const { phrases, dialect, toggleDialect } = useDialect();
  const [kind, setKind] = useState<SubmissionKind>("produce");
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<VoiceSubmission[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  const startRecording = useCallback(() => {
    setTranscript(null);
    setElapsedSeconds(0);
    setRecorderState("recording");

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const RecognitionCtor = getSpeechRecognition();
    if (RecognitionCtor) {
      const recognition = new RecognitionCtor();
      recognition.lang = dialect === "eki-yo" ? "yo-NG" : "en-NG";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const text = Array.from(event.results as ArrayLike<SpeechRecognitionResultLike>)
          .map((r) => r[0].transcript)
          .join(" ");
        setTranscript(text);
      };
      recognition.onerror = () => {
        // Fall back silently to manual review; audio itself is still captured.
      };
      recognition.onend = () => {
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  }, [dialect]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recognitionRef.current?.stop();
    setRecorderState("review");
  }, []);

  const confirmSubmission = useCallback(() => {
    const submission: VoiceSubmission = {
      id: `voice-${Date.now()}`,
      kind,
      durationSeconds: elapsedSeconds,
      createdAt: Date.now(),
      transcript,
    };
    setSubmissions((prev) => [submission, ...prev]);
    setRecorderState("submitted");
  }, [kind, elapsedSeconds, transcript]);

  const restart = useCallback(() => {
    setRecorderState("idle");
    setElapsedSeconds(0);
    setTranscript(null);
  }, []);

  return (
    <div className="min-h-screen bg-ekiti-neutral text-ekiti-canvas flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="font-display text-xl">EKIRO Voice Hub</div>
        <button
          type="button"
          onClick={toggleDialect}
          className="flex items-center gap-2 px-4 py-3 min-h-[56px] rounded-sm bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
          aria-label="Switch language"
        >
          <Languages size={18} className="text-ekiti-gold" />
          {dialect === "eki-yo" ? "Yorùbá" : "English"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="font-display text-2xl sm:text-3xl max-w-md mb-10 leading-snug">{phrases.greeting}</p>

        {recorderState === "idle" && (
          <>
            <div className="flex gap-4 mb-10">
              <button
                type="button"
                onClick={() => setKind("produce")}
                className={`flex flex-col items-center justify-center gap-2 w-[100px] h-[100px] rounded-sm border-2 transition-colors ${
                  kind === "produce" ? "border-ekiti-gold bg-white/10" : "border-white/20"
                }`}
                aria-pressed={kind === "produce"}
              >
                <Sprout size={32} className="text-ekiti-gold" />
                <span className="text-xs font-semibold">Ọjà</span>
              </button>
              <button
                type="button"
                onClick={() => setKind("infrastructure")}
                className={`flex flex-col items-center justify-center gap-2 w-[100px] h-[100px] rounded-sm border-2 transition-colors ${
                  kind === "infrastructure" ? "border-ekiti-gold bg-white/10" : "border-white/20"
                }`}
                aria-pressed={kind === "infrastructure"}
              >
                <Wrench size={32} className="text-ekiti-gold" />
                <span className="text-xs font-semibold">Ìdíwọ́n</span>
              </button>
            </div>

            <p className="text-sm opacity-70 mb-8 max-w-xs">{phrases.askListing}</p>

            <button
              type="button"
              onClick={startRecording}
              className="w-[140px] h-[140px] rounded-full bg-ekiti-gold text-ekiti-neutral flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Start recording"
            >
              <Mic size={52} />
            </button>
          </>
        )}

        {recorderState === "recording" && (
          <>
            <div className="mb-8 flex items-center gap-3 text-ekiti-gold font-mono text-lg">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              {phrases.recording} · {elapsedSeconds}s
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="w-[140px] h-[140px] rounded-full bg-white text-ekiti-neutral flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Stop recording"
            >
              <Square size={48} />
            </button>
          </>
        )}

        {recorderState === "review" && (
          <div className="w-full max-w-sm">
            <div className="rounded-sm bg-white/10 p-5 mb-8 text-left">
              <div className="text-xs uppercase tracking-widest opacity-60 mb-2 font-mono">
                {elapsedSeconds}s recorded
              </div>
              <p className="text-sm leading-relaxed">
                {transcript ?? "Audio captured. Transcript unavailable on this device — the recording will be sent as-is."}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={confirmSubmission}
                className="min-w-[140px] min-h-[80px] px-5 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
              >
                {phrases.confirm}
              </button>
              <button
                type="button"
                onClick={restart}
                className="min-w-[140px] min-h-[80px] px-5 rounded-sm border border-white/30 font-semibold"
              >
                {phrases.cancel}
              </button>
            </div>
          </div>
        )}

        {recorderState === "submitted" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 size={56} className="text-ekiti-gold" />
            <p className="font-display text-xl max-w-xs">{phrases.submitted}</p>
            <button
              type="button"
              onClick={restart}
              className="mt-4 min-h-[80px] px-6 rounded-sm bg-white/10 hover:bg-white/20 font-semibold"
            >
              Record another
            </button>
          </div>
        )}
      </main>

      {submissions.length > 0 && (
        <footer className="px-6 pb-8">
          <div className="font-mono text-[11px] uppercase tracking-widest opacity-50 mb-3">
            Recent submissions ({submissions.length})
          </div>
          <ul className="space-y-2">
            {submissions.slice(0, 5).map((s) => (
              <li key={s.id} className="text-xs opacity-70 font-mono">
                {s.kind === "produce" ? "Ọjà" : "Ìdíwọ́n"} · {s.durationSeconds}s ·{" "}
                {new Date(s.createdAt).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </div>
  );
}
