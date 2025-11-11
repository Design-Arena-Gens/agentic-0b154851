"use client";

import React, { useEffect, useRef, useState } from "react";

type Walker = {
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  bagSide: "left" | "right";
};

type Bird = {
  x: number;
  y: number;
  speed: number;
  amplitude: number;
  phase: number;
};

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

function drawStickFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  options?: { angry?: boolean; carryingBag?: boolean; bagSide?: "left" | "right" }
) {
  const headR = 10 * scale;
  const bodyLen = 35 * scale;
  const limb = 18 * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(2, 2 * scale);
  ctx.strokeStyle = "#111";

  // Head
  ctx.beginPath();
  ctx.arc(0, -bodyLen - headR, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Face
  if (options?.angry) {
    // Eyebrows
    ctx.beginPath();
    ctx.moveTo(-headR * 0.6, -bodyLen - headR * 1.2);
    ctx.lineTo(-headR * 0.2, -bodyLen - headR * 0.9);
    ctx.moveTo(headR * 0.6, -bodyLen - headR * 1.2);
    ctx.lineTo(headR * 0.2, -bodyLen - headR * 0.9);
    ctx.stroke();
    // Mouth (frown)
    ctx.beginPath();
    ctx.arc(0, -bodyLen - headR * 0.6, headR * 0.4, 0, Math.PI, true);
    ctx.stroke();
  } else {
    // Neutral
    ctx.beginPath();
    ctx.arc(0, -bodyLen - headR * 0.6, headR * 0.4, 0, Math.PI);
    ctx.stroke();
  }

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -bodyLen);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  if (options?.angry) {
    // Crossed arms
    ctx.moveTo(-limb, -bodyLen * 0.6);
    ctx.lineTo(0, -bodyLen * 0.4);
    ctx.lineTo(limb, -bodyLen * 0.6);
  } else {
    ctx.moveTo(-limb, -bodyLen * 0.5);
    ctx.lineTo(0, -bodyLen * 0.2);
    ctx.lineTo(limb, -bodyLen * 0.5);
  }
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-limb, limb);
  ctx.moveTo(0, 0);
  ctx.lineTo(limb, limb);
  ctx.stroke();

  // Designer bag (simple patterned rectangle)
  if (options?.carryingBag) {
    const side = options.bagSide ?? "right";
    const bagX = side === "right" ? limb * 0.9 : -limb * 0.9;
    const bagY = -bodyLen * 0.1;
    const bagW = 14 * scale;
    const bagH = 12 * scale;

    ctx.fillStyle = "#c19a6b"; // tan leather color
    ctx.strokeStyle = "#8b6b43";
    ctx.lineWidth = Math.max(1.5, 1.5 * scale);
    ctx.beginPath();
    ctx.rect(bagX - bagW / 2, bagY, bagW, bagH);
    ctx.fill();
    ctx.stroke();

    // Pattern (diagonal criss-cross implying a designer look without branding)
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = Math.max(1, 1 * scale);
    for (let i = -bagW; i < bagW; i += 5 * scale) {
      ctx.beginPath();
      ctx.moveTo(bagX + i, bagY);
      ctx.lineTo(bagX + i + bagH, bagY + bagH);
      ctx.stroke();
    }
    for (let i = -bagW; i < bagW; i += 5 * scale) {
      ctx.beginPath();
      ctx.moveTo(bagX + i, bagY + bagH);
      ctx.lineTo(bagX + i + bagH, bagY);
      ctx.stroke();
    }

    // Handle
    ctx.strokeStyle = "#8b6b43";
    ctx.beginPath();
    ctx.arc(bagX, bagY, bagW * 0.35, Math.PI, 2 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#222";
  ctx.lineWidth = Math.max(1.5, scale);
  // Simple flying bird as a "V" shape
  ctx.beginPath();
  ctx.moveTo(-6 * scale, 0);
  ctx.lineTo(0, -3 * scale);
  ctx.lineTo(6 * scale, 0);
  ctx.stroke();
  ctx.restore();
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.save();
  ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  const padding = 10;
  const metrics = ctx.measureText(text);
  const w = metrics.width + padding * 2;
  const h = 34;
  const r = 8;

  // Bubble
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  const bx = x - w / 2;
  const by = y - h - 14; // above the anchor

  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + w - r, by);
  ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);
  ctx.lineTo(bx + w, by + h - r);
  ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);
  ctx.lineTo(bx + r, by + h);
  ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 14);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 6, y - 14);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = "#111";
  ctx.fillText(text, bx + padding, by + h / 2 + 5);
  ctx.restore();
}

export default function CanvasAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g: CanvasRenderingContext2D = ctx;

    let animationFrame = 0;
    let rafId = 0 as number;

    // Ground and sky colors
    const sky = "#e6f2ff";
    const ground = "#eae7dc";

    // Create walkers
    const walkers: Walker[] = Array.from({ length: 7 }).map((_, i) => ({
      x: Math.random() * CANVAS_WIDTH,
      y: CANVAS_HEIGHT - 80 + (Math.random() * 10 - 5),
      speed: 0.6 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
      bagSide: Math.random() > 0.5 ? "left" : "right"
    }));

    // Birds
    const birds: Bird[] = Array.from({ length: 6 }).map((_, i) => ({
      x: Math.random() * CANVAS_WIDTH,
      y: 60 + Math.random() * 60,
      speed: 1.2 + Math.random() * 0.8,
      amplitude: 10 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2
    }));

    function drawBackground() {
      // Sky
      g.fillStyle = sky;
      g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sun subtle
      g.beginPath();
      g.fillStyle = "#fff6a9";
      g.arc(70, 70, 40, 0, Math.PI * 2);
      g.fill();

      // Ground
      g.fillStyle = ground;
      g.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);

      // Distant city silhouettes
      g.fillStyle = "#d8d5cd";
      for (let i = 0; i < 12; i++) {
        const w = 30 + Math.random() * 40;
        const h = 40 + Math.random() * 40;
        const x = i * 80 + (i % 2 === 0 ? 10 : 0);
        const y = CANVAS_HEIGHT - 60 - h - 40;
        g.fillRect(x, y, w, h);
      }
    }

    function step() {
      animationFrame++;
      drawBackground();

      // Birds update/draw (back layer)
      birds.forEach((b) => {
        b.x += b.speed;
        b.phase += 0.06;
        const y = b.y + Math.sin(b.phase) * b.amplitude;
        if (b.x > CANVAS_WIDTH + 20) b.x = -20;
        drawBird(g, b.x, y, 1);
      });

      // Walkers update/draw (mid layer)
      walkers.forEach((w) => {
        w.x += w.speed * w.direction;
        if (w.direction === 1 && w.x > CANVAS_WIDTH + 20) {
          w.x = -20;
        }
        if (w.direction === -1 && w.x < -20) {
          w.x = CANVAS_WIDTH + 20;
        }
        const scale = 0.9;
        drawStickFigure(g, w.x, w.y, scale, {
          angry: false,
          carryingBag: true,
          bagSide: w.bagSide
        });
      });

      // Foreground main character
      const mainX = CANVAS_WIDTH / 2;
      const mainY = CANVAS_HEIGHT - 70;
      drawStickFigure(g, mainX, mainY, 1.5, { angry: true });

      // Speech bubble content
      const bubbleText = "Upset with liars about designer bags.";
      drawSpeechBubble(g, mainX, mainY - 70, bubbleText);

      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  function startRecording() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(60);
    const mimeTypes = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];

    const supported = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t));
    const recorder = new MediaRecorder(stream, supported ? { mimeType: supported } : undefined);

    recordedChunksRef.current = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: supported ?? "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setIsRecording(false);
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
    }
  }

  function resetRecording() {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
    }
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setIsRecording(false);
  }

  return (
    <div className="canvasWrap">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="canvas"
      />
      <div className="controls">
        <button onClick={startRecording} disabled={isRecording} className="btn">
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="btn">
          Stop
        </button>
        <button onClick={resetRecording} className="btn btnGhost">
          Reset
        </button>
      </div>

      {recordedUrl && (
        <div className="result">
          <video src={recordedUrl} controls width={CANVAS_WIDTH / 2} />
          <a href={recordedUrl} download="stick-figure-animation.webm" className="download">
            Download WebM
          </a>
        </div>
      )}
    </div>
  );
}
