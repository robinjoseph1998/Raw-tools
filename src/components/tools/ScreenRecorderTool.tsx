'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { StatusState } from '@/types';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}

type FrameRate = 30 | 60;

export default function ScreenRecorderTool({
  onStatusChange,
  onToast,
}: {
  onStatusChange: (s: StatusState) => void;
  onToast: (msg: string) => void;
}) {
  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.mediaDevices?.getDisplayMedia;
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [frameRate, setFrameRate] = useState<FrameRate>(30);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [resolution, setResolution] = useState<{ w: number; h: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cleanup all streams and timers
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Get screen stream with frame rate
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: frameRate } },
        audio: true,
      });

      streamRef.current = screenStream;

      // Get resolution from video track
      const videoTrack = screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      if (settings.width && settings.height) {
        setResolution({ w: settings.width, h: settings.height });
      }

      let recordStream = screenStream;

      // If mic enabled, merge audio
      if (micEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = micStream;

          const ctx = new AudioContext();
          audioCtxRef.current = ctx;
          const dest = ctx.createMediaStreamDestination();

          // Add screen audio tracks (if any)
          screenStream.getAudioTracks().forEach(track => {
            const source = ctx.createMediaStreamSource(new MediaStream([track]));
            source.connect(dest);
          });

          // Add mic audio
          const micSource = ctx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          // Create merged stream: screen video + merged audio
          recordStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...dest.stream.getAudioTracks(),
          ]);
        } catch {
          onToast('Mic access denied — recording without mic');
        }
      }

      // Show live preview
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
        videoRef.current.play().catch(() => {});
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const recorder = new MediaRecorder(recordStream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setPreviewUrl(url);
        setFileSize(blob.size);
        setIsRecording(false);
        setIsPaused(false);
        onStatusChange('valid');
        onToast('Recording saved');

        // Show playback
        if (playbackRef.current) {
          playbackRef.current.src = url;
        }

        // Stop live preview
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        cleanup();
      };

      // Handle user clicking browser's "Stop sharing" button
      videoTrack.onended = () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        }
      };

      recorder.start(1000); // collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordedBlob(null);
      setPreviewUrl('');
      setDuration(0);
      setFileSize(0);
      onStatusChange('idle');

      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (err) {
      // User cancelled the picker or permission denied
      const msg = err instanceof Error ? err.message : 'Recording failed';
      if (!msg.includes('cancel') && !msg.includes('abort') && !msg.includes('Permission')) {
        onToast('Failed to start recording');
        onStatusChange('invalid');
      }
    }
  }, [frameRate, micEnabled, previewUrl, cleanup, onStatusChange, onToast]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
      setIsPaused(false);
      const resumeTime = Date.now();
      const currentDuration = duration;
      timerRef.current = setInterval(() => {
        setDuration(currentDuration + Math.floor((Date.now() - resumeTime) / 1000));
      }, 1000);
    }
  }, [duration]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const download = useCallback(() => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('Download started');
  }, [recordedBlob, onToast]);

  const handleClear = useCallback(() => {
    cleanup();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setIsRecording(false);
    setIsPaused(false);
    setRecordedBlob(null);
    setPreviewUrl('');
    setDuration(0);
    setFileSize(0);
    setResolution(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    if (playbackRef.current) playbackRef.current.src = '';
    onStatusChange('idle');
  }, [cleanup, previewUrl, onStatusChange]);

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl glass-panel p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <svg className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-200 mb-2">Desktop Only</h3>
          <p className="text-[13px] text-zinc-400 leading-relaxed max-w-md mx-auto">
            This tool is only available on desktop browsers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {!isRecording && !recordedBlob && (
          <button onClick={startRecording} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            Start Recording
          </button>
        )}

        {isRecording && !isPaused && (
          <button onClick={pauseRecording} className="btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M10 9v6m4-6v6" />
            </svg>
            Pause
          </button>
        )}

        {isRecording && isPaused && (
          <button onClick={resumeRecording} className="btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Resume
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2 !bg-red-500/20 !border-red-500/30 hover:!bg-red-500/30">
            <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span className="text-red-400">Stop</span>
          </button>
        )}

        {recordedBlob && (
          <>
            <button onClick={download} className="btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download WebM
            </button>
            <button onClick={startRecording} className="btn-ghost text-[12px] px-3 py-2">
              New Recording
            </button>
          </>
        )}

        {(recordedBlob || isRecording) && (
          <button onClick={isRecording ? stopRecording : handleClear} className="btn-ghost text-[12px] px-3 py-2 text-zinc-600 hover:text-red-400">
            {isRecording ? '' : 'Clear'}
          </button>
        )}

        {/* FPS & Mic toggles */}
        <div className="ml-auto flex items-center gap-2">
          {/* FPS toggle */}
          {([30, 60] as FrameRate[]).map((fps) => (
            <button
              key={fps}
              onClick={() => setFrameRate(fps)}
              disabled={isRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
                frameRate === fps
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
              } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {fps}fps
            </button>
          ))}
          <button
            onClick={() => setMicEnabled(v => !v)}
            disabled={isRecording}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
              micEnabled
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {micEnabled ? (
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
              ) : (
                <>
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
                  <path d="M3 3l18 18" strokeLinecap="round" />
                </>
              )}
            </svg>
            {micEnabled ? 'Mic On' : 'Mic Off'}
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 rounded-lg glass-panel px-4 py-3">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-[13px] font-mono font-semibold text-zinc-200">{formatTime(duration)}</span>
          <span className="text-[11px] text-zinc-500">{isPaused ? 'Paused' : 'Recording...'}</span>
          {micEnabled && (
            <span className="ml-auto text-[10px] text-purple-400 font-medium flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
              </svg>
              Mic active
            </span>
          )}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Preview panel */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-400/70' : 'bg-purple-400/70'}`} />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">
                {isRecording ? 'Live Preview' : 'Preview'}
              </span>
            </div>
            {resolution && (
              <span className="text-[11px] font-mono text-zinc-500">{resolution.w}x{resolution.h}</span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-black/20">
            {/* Live preview while recording */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`max-w-full max-h-[340px] rounded-lg ${isRecording ? 'block' : 'hidden'}`}
            />
            {/* Playback after recording */}
            {!isRecording && previewUrl && (
              <video
                ref={playbackRef}
                src={previewUrl}
                controls
                playsInline
                className="max-w-full max-h-[340px] rounded-lg"
              />
            )}
            {/* Empty state */}
            {!isRecording && !previewUrl && (
              <div className="flex flex-col items-center gap-3 text-center">
                <svg className="h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-[13px] text-zinc-500">Click &quot;Start Recording&quot; to begin</p>
                <p className="text-[11px] text-zinc-600">You can record your entire screen, a window, or a browser tab</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings & Info panel */}
        <div className="flex flex-col min-h-[380px] lg:min-h-[420px] rounded-xl glass-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
              <span className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Settings & Info</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col p-4 gap-4">
            {/* Audio settings */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Audio</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-zinc-300 font-medium">Microphone</p>
                    <p className="text-[11px] text-zinc-600">Record your voice narration</p>
                  </div>
                  <button
                    onClick={() => setMicEnabled(v => !v)}
                    disabled={isRecording}
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                      micEnabled ? 'bg-purple-500/40' : 'bg-white/[0.08]'
                    } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-200 ${
                      micEnabled ? 'left-5 bg-purple-400' : 'left-0.5 bg-zinc-500'
                    }`} style={{ width: 18, height: 18, top: 2 }} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-zinc-300 font-medium">System Audio</p>
                    <p className="text-[11px] text-zinc-600">Available when sharing a browser tab (Chrome)</p>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">Auto</span>
                </div>
              </div>
            </div>

            {/* Recording info */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Recording Info</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Status</span>
                  <span className={`text-[12px] font-medium ${
                    isRecording ? (isPaused ? 'text-amber-400' : 'text-red-400') : recordedBlob ? 'text-emerald-400' : 'text-zinc-600'
                  }`}>
                    {isRecording ? (isPaused ? 'Paused' : 'Recording') : recordedBlob ? 'Ready' : 'Idle'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Duration</span>
                  <span className="text-[12px] font-mono text-zinc-300">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Format</span>
                  <span className="text-[12px] font-mono text-zinc-300">WebM (VP9)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-zinc-500">Resolution</span>
                  <span className="text-[12px] font-mono text-zinc-300">{resolution ? `${resolution.w} x ${resolution.h}` : '—'}</span>
                </div>
                {fileSize > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">File Size</span>
                    <span className="text-[12px] font-mono text-zinc-300">{formatBytes(fileSize)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">How It Works</h3>
              <ol className="space-y-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-purple-400">1</span>
                  <span className="text-[12px] text-zinc-500">Click &quot;Start Recording&quot; &mdash; pick screen, window, or tab</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-purple-400">2</span>
                  <span className="text-[12px] text-zinc-500">Record with optional mic audio for narration</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-purple-400">3</span>
                  <span className="text-[12px] text-zinc-500">Stop &amp; download as WebM video</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata row */}
      {recordedBlob && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Duration</p>
            <p className="text-[13px] font-mono text-zinc-300">{formatTime(duration)}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">File Size</p>
            <p className="text-[13px] font-mono text-zinc-300">{formatBytes(fileSize)}</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Format</p>
            <p className="text-[13px] font-mono text-zinc-300">WebM</p>
          </div>
          <div className="rounded-lg glass-panel p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Resolution</p>
            <p className="text-[13px] font-mono text-zinc-300">{resolution ? `${resolution.w}x${resolution.h}` : '—'}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section tips-section--purple">
        <div className="flex items-center gap-2 mb-3">
          <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Tips</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Browser</span> — Works in Chrome, Edge, and Firefox</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Microphone</span> — Enable before starting to narrate</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">System Audio</span> — Only available when sharing a browser tab in Chrome</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Privacy</span> — Recording stays in your browser, never uploaded</p>
        </div>
      </div>
    </div>
  );
}
