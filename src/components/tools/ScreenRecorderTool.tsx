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
type OutputFormat = 'webm' | 'mp4';
// Region to record, in capture pixels
type CropRect = { x: number; y: number; w: number; h: number };

// Insertable-streams track types — Chromium-only, missing from lib.dom
type TrackProcessorCtor = new (init: { track: MediaStreamTrack }) => { readable: ReadableStream<VideoFrame> };
type TrackGeneratorCtor = new (init: { kind: 'video' }) => MediaStreamTrack & { writable: WritableStream<VideoFrame> };

function cropCtors() {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    MediaStreamTrackProcessor?: TrackProcessorCtor;
    MediaStreamTrackGenerator?: TrackGeneratorCtor;
  };
  return w.MediaStreamTrackProcessor && w.MediaStreamTrackGenerator
    ? { Processor: w.MediaStreamTrackProcessor, Generator: w.MediaStreamTrackGenerator }
    : null;
}

// Crop a video track by rewriting each frame's visibleRect — a metadata-only
// crop that costs no pixel copies and, unlike a canvas draw loop, keeps
// producing frames while the tab is hidden. 4:2:0 frames need even-aligned
// rects, and the rect is re-clamped per frame since the source can resize.
function buildCroppedTrack(track: MediaStreamTrack, rect: CropRect): MediaStreamTrack | null {
  const ctors = cropCtors();
  if (!ctors) return null;
  const processor = new ctors.Processor({ track });
  const generator = new ctors.Generator({ kind: 'video' });
  const even = (n: number) => Math.max(0, 2 * Math.floor(n / 2));
  const transformer = new TransformStream<VideoFrame, VideoFrame>({
    transform(frame, controller) {
      try {
        const x = Math.min(even(rect.x), even(frame.codedWidth - 16));
        const y = Math.min(even(rect.y), even(frame.codedHeight - 16));
        const width = Math.max(16, Math.min(even(rect.w), even(frame.codedWidth - x)));
        const height = Math.max(16, Math.min(even(rect.h), even(frame.codedHeight - y)));
        const cropped = new VideoFrame(frame as CanvasImageSource, {
          timestamp: frame.timestamp,
          visibleRect: { x, y, width, height },
        } as VideoFrameInit);
        frame.close();
        controller.enqueue(cropped);
      } catch {
        // Unexpected frame format — pass it through uncropped rather than die
        controller.enqueue(frame);
      }
    },
  });
  processor.readable.pipeThrough(transformer).pipeTo(generator.writable).catch(() => {});
  return generator;
}

// 'video/webm;codecs=vp9,opus' -> 'video/webm'
function baseType(mime: string): string {
  return mime.split(';')[0].trim();
}

// Deliberately unpinned: a codec string like avc1.42E01E declares H.264
// Level 3.0 (max 1620 macroblocks/frame), which 1080p60 exceeds ~12x.
// isTypeSupported() can't catch that — it doesn't know the resolution yet —
// so the encoder only fails later, at capture time. Letting the browser pick
// the profile and level for the actual stream avoids the mismatch entirely.
const MP4_CANDIDATES = [
  'video/mp4',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4;codecs=h264,aac',
];

const WEBM_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

function candidatesFor(format: OutputFormat): string[] {
  return format === 'mp4' ? MP4_CANDIDATES : WEBM_CANDIDATES;
}

// First candidate the browser can actually record, or '' if none
function pickMimeType(format: OutputFormat): string {
  if (typeof MediaRecorder === 'undefined') return '';
  return candidatesFor(format).find(t => MediaRecorder.isTypeSupported(t)) ?? '';
}

// isTypeSupported() only vets the string, so construction is the real test.
// Walk the preferred types, then WebM, then let the browser choose outright.
function createRecorder(stream: MediaStream, format: OutputFormat): MediaRecorder {
  const types = [...candidatesFor(format), ...WEBM_CANDIDATES];
  for (const mimeType of types) {
    if (!MediaRecorder.isTypeSupported(mimeType)) continue;
    try {
      return new MediaRecorder(stream, { mimeType });
    } catch {
      // Declared type the encoder can't honour for this stream — keep going
    }
  }
  return new MediaRecorder(stream);
}

// Recording MP4 and playing it back are separate capabilities: Chromium on
// Linux often muxes MP4 while lacking a proprietary H.264 decoder, which
// yields a recording that plays audio with a blank picture.
function canPlayMp4(): boolean {
  if (typeof document === 'undefined') return false;
  return document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
}

// Chrome has no AAC encoder, so its native MP4 recordings carry Opus audio —
// which most players (Windows Media Player/Photos, QuickTime, editors) can't
// decode inside an MP4. The browser preview plays it, the downloaded file is
// silent. If the browser can't record AAC, the download needs an audio remux.
function mp4AudioNeedsRemux(): boolean {
  if (typeof MediaRecorder === 'undefined') return false;
  return !MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2');
}

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

  // Only take the native MP4 path when the browser can both record AND play it,
  // otherwise record WebM and transcode on download so the preview always works.
  const nativeMp4 = useMemo(() => pickMimeType('mp4') !== '' && canPlayMp4(), []);

  const cropSupported = useMemo(() => cropCtors() !== null, []);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [cropEnabled, setCropEnabled] = useState(false);
  // Share accepted, waiting for the user to drag a region on the preview
  const [isSelecting, setIsSelecting] = useState(false);
  // Drag selection, in preview-element CSS pixels
  const [selRect, setSelRect] = useState<CropRect | null>(null);
  // True while the active recording is cropped (keeps the region outline up)
  const [cropActive, setCropActive] = useState(false);
  const [frameRate, setFrameRate] = useState<FrameRate>(30);
  const [recordFormat, setRecordFormat] = useState<OutputFormat>('webm');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMime, setRecordedMime] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [resolution, setResolution] = useState<{ w: number; h: number } | null>(null);

  // Set when the recording loads but decodes no video track (blank picture)
  const [previewBroken, setPreviewBroken] = useState(false);

  // Transcode state (only used when the requested format wasn't recorded natively)
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null);
  const croppedTrackRef = useRef<MediaStreamTrack | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  // Converted output is cached so re-downloading the same format is instant
  const convertedRef = useRef<{ format: OutputFormat; blob: Blob } | null>(null);
  const recordedFpsRef = useRef<FrameRate>(30);

  const recordedFormat: OutputFormat = baseType(recordedMime) === 'video/mp4' ? 'mp4' : 'webm';
  // What will actually be recorded — MP4 falls back to WebM without native support
  const plannedFormat: OutputFormat = nativeMp4 ? recordFormat : 'webm';
  const activeFormat = recordedMime ? recordedFormat : plannedFormat;
  const formatLabel = activeFormat === 'mp4' ? 'MP4 (H.264)' : 'WebM (VP9)';

  // Cleanup all streams and timers
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    if (croppedTrackRef.current) { croppedTrackRef.current.stop(); croppedTrackRef.current = null; }
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

  // Abandon a crop selection: drop the captured stream and reset the preview
  const cancelSelection = useCallback(() => {
    cleanup();
    setIsSelecting(false);
    setSelRect(null);
    if (videoRef.current) videoRef.current.srcObject = null;
    onStatusChange('idle');
  }, [cleanup, onStatusChange]);

  // Phase 2: wire audio and start MediaRecorder on an already-captured
  // stream, optionally cropped to `cropRect` (in capture pixels)
  const beginRecording = useCallback(async (screenStream: MediaStream, cropRect: CropRect | null) => {
    try {
      let recordVideoTrack = screenStream.getVideoTracks()[0];

      if (cropRect) {
        const cropped = buildCroppedTrack(recordVideoTrack, cropRect);
        if (cropped) {
          croppedTrackRef.current = cropped;
          recordVideoTrack = cropped;
          setResolution({ w: cropRect.w - (cropRect.w % 2), h: cropRect.h - (cropRect.h % 2) });
        } else {
          onToast('Crop not supported in this browser — recording the full screen');
          cropRect = null;
        }
      }
      setCropActive(cropRect !== null);

      let audioTracks = screenStream.getAudioTracks();

      // If mic enabled, merge audio
      if (micEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = micStream;

          const ctx = new AudioContext();
          audioCtxRef.current = ctx;

          // Created after awaits, so it's outside the click gesture and can
          // start suspended — that emits a silent track and stalls the muxer.
          if (ctx.state === 'suspended') await ctx.resume();

          const dest = ctx.createMediaStreamDestination();

          // Add screen audio tracks (if any)
          screenStream.getAudioTracks().forEach(track => {
            const source = ctx.createMediaStreamSource(new MediaStream([track]));
            source.connect(dest);
          });

          // Add mic audio
          const micSource = ctx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          audioTracks = dest.stream.getAudioTracks();
        } catch {
          onToast('Mic access denied — recording without mic');
        }
      }

      const recordStream = new MediaStream([recordVideoTrack, ...audioTracks]);

      // plannedFormat already downgrades MP4 to WebM when the browser
      // can't play its own MP4 output back
      const recorder = createRecorder(recordStream, plannedFormat);
      // What the browser actually settled on, which may not be what we asked for
      const mimeType = recorder.mimeType || pickMimeType(plannedFormat) || 'video/webm';
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Encoder failures after start() surface here, not as a thrown error
      recorder.onerror = (e) => {
        const err = (e as unknown as { error?: DOMException }).error;
        onToast(`Recording error: ${err?.message || err?.name || 'encoder failed'}`);
        onStatusChange('invalid');
        setIsRecording(false);
        setIsPaused(false);
        setCropActive(false);
        if (videoRef.current) videoRef.current.srcObject = null;
        cleanup();
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedMime(mimeType);
        setPreviewUrl(url);
        setFileSize(blob.size);
        setIsRecording(false);
        setIsPaused(false);
        setCropActive(false);
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

      recorder.start(1000); // collect data every second

      if (plannedFormat === 'mp4' && baseType(mimeType) !== 'video/mp4') {
        onToast('MP4 unavailable at these settings — recording WebM');
      }

      recordedFpsRef.current = frameRate;
      convertedRef.current = null;
      setIsRecording(true);
      setIsPaused(false);
      setIsSelecting(false);
      setRecordedBlob(null);
      setRecordedMime(mimeType);
      setPreviewUrl('');
      setDuration(0);
      setFileSize(0);
      setConverting(false);
      setConvertProgress(0);
      setPreviewBroken(false);
      onStatusChange('idle');

      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (err) {
      cleanup();
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsRecording(false);
      setIsSelecting(false);
      const msg = err instanceof Error ? err.message : 'Recording failed';
      onToast(`Couldn't start recording: ${msg || 'unknown error'}`);
      onStatusChange('invalid');
    }
  }, [frameRate, plannedFormat, micEnabled, previewUrl, cleanup, onStatusChange, onToast]);

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

      // Show live preview
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
        videoRef.current.play().catch(() => {});
      }

      // Browser's "Stop sharing" button: stop an active recording, or abandon
      // a crop selection that's still waiting on the user
      videoTrack.onended = () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
          recorderRef.current.stop();
        } else {
          cancelSelection();
        }
      };

      if (cropEnabled && cropSupported) {
        // Recording starts when the user confirms a region on the preview
        setIsSelecting(true);
        setSelRect(null);
        onStatusChange('idle');
        return;
      }

      await beginRecording(screenStream, null);
    } catch (err) {
      // getDisplayMedia may already have granted a stream before we failed —
      // without this the share stays live and the browser keeps showing
      // "you are sharing your screen" with no way to stop it
      cleanup();
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsRecording(false);
      setIsSelecting(false);

      const name = err instanceof DOMException ? err.name : '';
      const msg = err instanceof Error ? err.message : 'Recording failed';

      // User dismissed the picker — not an error worth reporting
      const cancelled = name === 'NotAllowedError' || name === 'AbortError'
        || /cancel|abort|permission/i.test(msg);

      if (!cancelled) {
        onToast(`Couldn't start recording: ${msg || name || 'unknown error'}`);
        onStatusChange('invalid');
      }
    }
  }, [frameRate, cropEnabled, cropSupported, beginRecording, cancelSelection, cleanup, onStatusChange, onToast]);

  // Confirm the crop selection (or record the full screen when nothing was
  // dragged) — maps the preview-pixel rect onto capture pixels
  const confirmCrop = useCallback(async () => {
    const stream = streamRef.current;
    const video = videoRef.current;
    if (!stream || !video) return;

    let rect: CropRect | null = null;
    if (selRect && selRect.w >= 10 && selRect.h >= 10 && video.videoWidth > 0) {
      const box = video.getBoundingClientRect();
      const scaleX = video.videoWidth / box.width;
      const scaleY = video.videoHeight / box.height;
      rect = {
        x: Math.round(selRect.x * scaleX),
        y: Math.round(selRect.y * scaleY),
        w: Math.round(selRect.w * scaleX),
        h: Math.round(selRect.h * scaleY),
      };
    }

    await beginRecording(stream, rect);
  }, [selRect, beginRecording]);

  const onCropPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const box = overlay.getBoundingClientRect();
    dragStartRef.current = { x: e.clientX - box.left, y: e.clientY - box.top };
    setSelRect(null);
    overlay.setPointerCapture(e.pointerId);
  }, []);

  const onCropPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    const start = dragStartRef.current;
    if (!overlay || !start) return;
    const box = overlay.getBoundingClientRect();
    const cx = Math.min(Math.max(e.clientX - box.left, 0), box.width);
    const cy = Math.min(Math.max(e.clientY - box.top, 0), box.height);
    setSelRect({
      x: Math.min(start.x, cx),
      y: Math.min(start.y, cy),
      w: Math.abs(cx - start.x),
      h: Math.abs(cy - start.y),
    });
  }, []);

  const onCropPointerUp = useCallback(() => {
    dragStartRef.current = null;
  }, []);

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

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } finally {
      setFfmpegLoading(false);
    }
  }, []);

  // Transcode the recording into `target` with ffmpeg.wasm. With `copyVideo`
  // the video stream passes through untouched and only audio is re-encoded —
  // fast, used to swap Opus for AAC in native MP4 recordings.
  const convertTo = useCallback(async (target: OutputFormat, copyVideo = false): Promise<Blob | null> => {
    if (!recordedBlob) return null;
    setConverting(true);
    setConvertProgress(0);

    const inputName = `recording.${recordedFormat}`;
    const outputName = `output.${target}`;

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      ffmpeg.on('progress', ({ progress: p }) => {
        setConvertProgress(Math.max(0, Math.min(100, Math.round(p * 100))));
      });

      await ffmpeg.writeFile(inputName, await fetchFile(recordedBlob));

      // MediaRecorder output is variable frame rate with no duration header,
      // so regenerate timestamps and pin the output to the recorded frame rate.
      const args = ['-fflags', '+genpts', '-i', inputName];

      if (copyVideo) {
        args.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart');
      } else if (target === 'mp4') {
        args.push(
          '-r', String(recordedFpsRef.current),
          '-c:v', 'libx264',
          '-preset', 'veryfast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
        );
      } else {
        args.push('-r', String(recordedFpsRef.current), '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-c:a', 'libopus');
      }

      args.push(outputName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([data as any], { type: `video/${target}` });

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      if (blob.size === 0) throw new Error('Conversion produced an empty file');

      convertedRef.current = { format: target, blob };
      setConvertProgress(100);
      return blob;
    } catch (err) {
      onToast('Conversion failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return null;
    } finally {
      setConverting(false);
    }
  }, [recordedBlob, recordedFormat, loadFFmpeg, onToast]);

  const saveBlob = useCallback((blob: Blob, format: OutputFormat) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const download = useCallback(async (format: OutputFormat) => {
    if (!recordedBlob || converting) return;

    // Reuse an earlier conversion of the same format
    const cached = convertedRef.current;
    if (cached && cached.format === format) {
      saveBlob(cached.blob, format);
      onToast('Download started');
      return;
    }

    // Already in the requested format — no transcode, except native MP4 with
    // Opus audio, which is remuxed to AAC so players outside the browser
    // aren't silent
    if (format === recordedFormat) {
      if (format === 'mp4' && mp4AudioNeedsRemux()) {
        onToast('Preparing MP4 audio...');
        const blob = await convertTo('mp4', true);
        // Remux failed — ship the original rather than nothing
        saveBlob(blob ?? recordedBlob, 'mp4');
        onToast('Download started');
        return;
      }
      saveBlob(recordedBlob, format);
      onToast('Download started');
      return;
    }

    onToast(`Converting to ${format.toUpperCase()}...`);
    const blob = await convertTo(format);
    if (blob) {
      saveBlob(blob, format);
      onToast('Download started');
    }
  }, [recordedBlob, recordedFormat, converting, convertTo, saveBlob, onToast]);

  const handleClear = useCallback(() => {
    cleanup();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    convertedRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setIsSelecting(false);
    setSelRect(null);
    setCropActive(false);
    setRecordedBlob(null);
    setRecordedMime('');
    setPreviewUrl('');
    setDuration(0);
    setFileSize(0);
    setResolution(null);
    setConverting(false);
    setConvertProgress(0);
    setPreviewBroken(false);
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
        {!isRecording && !recordedBlob && !isSelecting && (
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

        {recordedBlob && !isSelecting && (
          <>
            {(['webm', 'mp4'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => download(fmt)}
                disabled={converting}
                className={`btn-secondary inline-flex items-center gap-2 text-[12px] px-4 py-2 ${converting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {fmt.toUpperCase()}
                {fmt !== recordedFormat && convertedRef.current?.format !== fmt && (
                  <span className="text-[10px] text-zinc-600">converts</span>
                )}
              </button>
            ))}
            <button onClick={startRecording} disabled={converting} className={`btn-ghost text-[12px] px-3 py-2 ${converting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              New Recording
            </button>
          </>
        )}

        {(recordedBlob || isRecording) && !isSelecting && (
          <button onClick={isRecording ? stopRecording : handleClear} className="btn-ghost text-[12px] px-3 py-2 text-zinc-600 hover:text-red-400">
            {isRecording ? '' : 'Clear'}
          </button>
        )}

        {/* Format, FPS & Mic toggles */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Format toggle — only meaningful when the browser can record MP4 directly */}
          {nativeMp4 && !recordedBlob && (
            <div className="flex items-center gap-2 pr-2 mr-1 border-r border-white/[0.08]">
              {(['webm', 'mp4'] as OutputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setRecordFormat(fmt)}
                  disabled={isRecording}
                  title={`Record directly as ${fmt.toUpperCase()}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
                    recordFormat === fmt
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Crop toggle — needs insertable streams (Chromium) */}
          {cropSupported && (
            <button
              onClick={() => setCropEnabled(v => !v)}
              disabled={isRecording || isSelecting}
              title="Record only a selected area of the screen"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
                cropEnabled
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
              } ${isRecording || isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2" />
              </svg>
              {cropEnabled ? 'Crop On' : 'Crop Off'}
            </button>
          )}

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

      {/* Conversion progress */}
      {converting && (
        <div className="rounded-lg glass-panel px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-zinc-400">
              {ffmpegLoading ? 'Loading FFmpeg engine...' : 'Converting video...'}
            </span>
            <span className="text-[12px] font-mono text-purple-400">{convertProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-400/70 transition-all duration-300"
              style={{ width: `${ffmpegLoading ? 0 : convertProgress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">
            Runs entirely in your browser — long recordings can take a while.
          </p>
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
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-auto bg-black/20">
            {/* Live preview while recording or selecting a crop region */}
            <div className={`relative ${isRecording || isSelecting ? 'block' : 'hidden'}`}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="max-w-full max-h-[340px] rounded-lg"
              />
              {isSelecting && (
                <div
                  ref={overlayRef}
                  className="absolute inset-0 cursor-crosshair touch-none rounded-lg overflow-hidden"
                  onPointerDown={onCropPointerDown}
                  onPointerMove={onCropPointerMove}
                  onPointerUp={onCropPointerUp}
                >
                  {selRect && selRect.w > 2 && selRect.h > 2 ? (
                    <div
                      className="absolute border-2 border-purple-400"
                      style={{ left: selRect.x, top: selRect.y, width: selRect.w, height: selRect.h, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                      <p className="text-[12px] text-zinc-200 bg-black/70 px-3 py-1.5 rounded-lg">Drag to select the area to record</p>
                    </div>
                  )}
                </div>
              )}
              {/* Region outline while a cropped recording is running */}
              {isRecording && cropActive && selRect && (
                <div
                  className="absolute border-2 border-red-400/80 pointer-events-none"
                  style={{ left: selRect.x, top: selRect.y, width: selRect.w, height: selRect.h }}
                />
              )}
            </div>
            {/* Crop selection controls */}
            {isSelecting && (
              <div className="flex items-center gap-2">
                <button onClick={confirmCrop} className="btn-primary inline-flex items-center gap-2 text-[12px] px-4 py-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                  {selRect && selRect.w >= 10 && selRect.h >= 10 ? 'Record Selected Area' : 'Record Full Screen'}
                </button>
                <button onClick={cancelSelection} className="btn-ghost text-[12px] px-3 py-2 text-zinc-600 hover:text-red-400">
                  Cancel
                </button>
              </div>
            )}
            {/* Playback after recording */}
            {!isRecording && !isSelecting && previewUrl && (
              <div className="flex flex-col items-center gap-3 w-full">
                <video
                  ref={playbackRef}
                  src={previewUrl}
                  controls
                  playsInline
                  onLoadedMetadata={(e) => setPreviewBroken(e.currentTarget.videoWidth === 0)}
                  onError={() => setPreviewBroken(true)}
                  className="max-w-full max-h-[340px] rounded-lg"
                />
                {previewBroken && (
                  <div className="max-w-md rounded-lg bg-amber-500/[0.07] border border-amber-500/20 px-3 py-2.5 text-center">
                    <p className="text-[12px] text-amber-300/90 font-medium">This browser can&apos;t display the recorded video</p>
                    <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                      It has no decoder for this format, so the preview is blank. The file itself is fine —
                      download it and play it in a media player, or record in WebM instead.
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* Empty state */}
            {!isRecording && !isSelecting && !previewUrl && (
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
                  <span className="text-[12px] font-mono text-zinc-300">{formatLabel}</span>
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
                  <span className="text-[12px] text-zinc-500">Stop &amp; download as WebM or MP4</span>
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
            <p className="text-[13px] font-mono text-zinc-300">{activeFormat.toUpperCase()}</p>
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
          {cropSupported && (
            <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Crop</span> — Turn on Crop, then drag over the preview to record just that area</p>
          )}
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">MP4</span> — {nativeMp4 ? 'Pick MP4 before recording for an instant download, or convert afterwards' : 'Your browser records WebM, so MP4 downloads are converted in-browser'}</p>
          <p className="text-[12px] text-zinc-500 leading-relaxed"><span className="text-zinc-300 font-medium">Privacy</span> — Recording stays in your browser, never uploaded</p>
        </div>
      </div>
    </div>
  );
}
