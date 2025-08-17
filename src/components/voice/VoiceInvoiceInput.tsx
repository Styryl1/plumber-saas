"use client";

import React, { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { Mic, MicOff, Square, Play, Pause, Trash2, FileText, Volume2 } from "lucide-react";

interface VoiceInvoiceInputProps {
  organizationId: string;
  plumberId: string;
  language?: "nl" | "en";
  onInvoiceCreated?: (invoice: any) => void;
}

interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
  transcript?: string;
}

export function VoiceInvoiceInput({
  organizationId,
  plumberId,
  language = "nl",
  onInvoiceCreated,
}: VoiceInvoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recording, setRecording] = useState<VoiceRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process voice invoice mutation
  const processVoiceInvoiceMutation = api.chat.processVoiceInvoice.useMutation({
    onSuccess: (data) => {
      if (data.success && data.invoice) {
        onInvoiceCreated?.(data.invoice);
        setRecording(null);
        setTranscript("");
        setRecordingTime(0);
      }
    },
    onError: (error) => {
      console.error("Voice invoice processing failed:", error);
    },
  });

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaRecorder = typeof MediaRecorder !== "undefined";
      const hasSpeechRecognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      setIsSupported(hasMediaRecorder && hasSpeechRecognition);
    };

    checkSupport();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "nl" ? "nl-NL" : "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(prev => {
          const newTranscript = prev + finalTranscript;
          return newTranscript + interimTranscript;
        });
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isSupported]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecording({
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          transcript,
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      // Pause speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current && recording) {
      audioRef.current.src = recording.url;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const deleteRecording = () => {
    if (recording) {
      URL.revokeObjectURL(recording.url);
      setRecording(null);
      setTranscript("");
      setRecordingTime(0);
    }
  };

  const generateInvoice = () => {
    if (transcript.trim()) {
      processVoiceInvoiceMutation.mutate({
        organizationId,
        plumberId,
        voiceText: transcript,
        language,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const text = {
    nl: {
      title: "Spraak naar Factuur",
      subtitle: "Spreek uw factuurgegevens in",
      startRecording: "Start opname",
      stopRecording: "Stop opname",
      pauseRecording: "Pauzeer",
      resumeRecording: "Hervat",
      playRecording: "Afspelen",
      deleteRecording: "Verwijderen",
      generateInvoice: "Factuur maken",
      transcribing: "Transcriberen...",
      processing: "Verwerken...",
      transcript: "Transcriptie",
      duration: "Duur",
      example: "Voorbeeld: 'Twee uur werk bij meneer de Vries, 50 euro materiaal, kraan reparatie'",
      notSupported: "Spraakopname wordt niet ondersteund in deze browser",
      error: "Er ging iets mis bij het verwerken van de spraak",
    },
    en: {
      title: "Voice to Invoice",
      subtitle: "Speak your invoice details",
      startRecording: "Start recording",
      stopRecording: "Stop recording",
      pauseRecording: "Pause",
      resumeRecording: "Resume",
      playRecording: "Play",
      deleteRecording: "Delete",
      generateInvoice: "Generate invoice",
      transcribing: "Transcribing...",
      processing: "Processing...",
      transcript: "Transcript",
      duration: "Duration",
      example: "Example: 'Two hours work for Mr. Smith, 50 euros materials, tap repair'",
      notSupported: "Voice recording is not supported in this browser",
      error: "Something went wrong processing the voice",
    },
  };

  const t = text[language];

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Volume2 className="w-5 h-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">{t.notSupported}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center mb-6">
        {!isRecording && !recording ? (
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : isRecording ? (
          <div className="flex items-center space-x-4">
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-mono text-red-500">{formatTime(recordingTime)}</div>
              <div className="text-sm text-gray-500">
                {isPaused ? "Gepauzeerd" : "Opname..."}
              </div>
            </div>
            
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Recording Playback */}
      {recording && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                {t.duration}: {formatTime(recording.duration)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={playRecording}
                  disabled={isPlaying}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteRecording}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <audio ref={audioRef} style={{ display: "none" }} />
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.transcript}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t.example}
          />
        </div>
      )}

      {/* Generate Invoice Button */}
      {transcript && (
        <div className="flex justify-end">
          <button
            onClick={generateInvoice}
            disabled={processVoiceInvoiceMutation.isLoading}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            {processVoiceInvoiceMutation.isLoading ? t.processing : t.generateInvoice}
          </button>
        </div>
      )}

      {/* Error Display */}
      {processVoiceInvoiceMutation.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">
            {processVoiceInvoiceMutation.error.message || t.error}
          </p>
        </div>
      )}

      {/* Success Display */}
      {processVoiceInvoiceMutation.data && processVoiceInvoiceMutation.data.success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">
              Factuur {processVoiceInvoiceMutation.data.invoice?.invoiceNumber} aangemaakt
            </span>
          </div>
          <div className="text-sm text-green-700">
            Totaal: €{processVoiceInvoiceMutation.data.invoice?.totalAmount}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-3">
        <p>{t.example}</p>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}