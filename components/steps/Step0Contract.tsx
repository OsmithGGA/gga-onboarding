"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, CheckCircle, Loader2, AlertCircle, RotateCcw } from "lucide-react";

interface Client {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  business_name?: string;
}

interface Props {
  client: Client;
  contractHtml: string;
  completed: boolean;
  onComplete: () => void;
}

export default function Step0Contract({
  client,
  contractHtml,
  completed,
  onComplete,
}: Props) {
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const firstName = client.first_name || client.name?.split(" ")[0] || "there";

  // Fill canvas with white background on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  }, []);

  // Get canvas-relative position accounting for DPI scaling
  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!hasScrolledToBottom) return;
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    if (!hasDrawnSignature) setHasDrawnSignature(true);
  }

  function stopDrawing() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clearSignature() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  }

  const canSign =
    hasScrolledToBottom &&
    agreed &&
    signatureName.trim().length > 2 &&
    hasDrawnSignature;

  async function handleSign() {
    if (!canSign) return;
    setError("");
    setSigning(true);

    const canvas = canvasRef.current;
    const signatureImage = canvas?.toDataURL("image/png") || "";

    try {
      const res = await fetch("/api/sign-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          signatureName: signatureName.trim(),
          signatureImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSigning(false);
        return;
      }

      onComplete();
    } catch {
      setError("Connection error. Please check your internet and try again.");
      setSigning(false);
    }
  }

  if (completed) {
    return (
      <div className="flex items-start gap-3 p-5 bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl">
        <CheckCircle className="w-5 h-5 text-[#ADFF00] flex-shrink-0 mt-0.5" />
        <p className="text-[#ADFF00] text-sm font-medium">
          Agreement signed and stored. Welcome aboard — let&apos;s get to work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header copy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#ADFF00]" />
          <h3 className="text-white font-semibold text-base">
            Your Client Agreement
          </h3>
        </div>
        <p className="text-[#888] text-sm leading-relaxed">
          Before anything else, please read and sign your client agreement below.
          This outlines exactly what GGA commits to delivering for you, your
          payment schedule, and your 30-lead guarantee in full.
        </p>
        <p className="text-[#888] text-sm leading-relaxed">
          Take a moment to read it through. Once signed, it&apos;s stored
          securely and you&apos;ll receive a copy by email. This step must be
          completed before the rest of the portal unlocks.
        </p>
      </div>

      {/* Scroll indicator */}
      {!hasScrolledToBottom && (
        <div className="flex items-center gap-2 text-[#666] text-xs bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Please scroll through the full agreement before signing.</span>
        </div>
      )}

      {/* Scrollable contract */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[55vh] overflow-y-auto border border-[#222] rounded-xl bg-[#0a0a0a] p-6"
      >
        {contractHtml ? (
          <div
            className="prose prose-invert prose-sm max-w-none text-[#ccc] leading-relaxed
              prose-headings:text-white prose-headings:font-semibold
              prose-strong:text-white prose-strong:font-semibold
              prose-p:text-[#aaa] prose-p:leading-relaxed
              prose-li:text-[#aaa] prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: contractHtml }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#555] text-sm">
              Contract template not yet configured. Please contact GGA.
            </p>
          </div>
        )}
      </div>

      {/* Signature section */}
      <div
        className={`space-y-5 transition-opacity duration-300 ${
          hasScrolledToBottom ? "opacity-100" : "opacity-40 pointer-events-none"
        }`}
      >
        <div className="border-t border-[#1a1a1a] pt-5">
          <p className="text-[#888] text-sm mb-5 font-medium">
            By signing below, you confirm you have read and agree to all terms
            of this agreement.
          </p>

          {/* Full legal name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#888] mb-2">
              Full legal name
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder={`e.g. ${firstName} ${client.last_name || "Smith"}`}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#333] text-sm focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00]/20 transition-colors"
              disabled={!hasScrolledToBottom}
            />
          </div>

          {/* Signature pad */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#888]">
                Draw your signature
              </label>
              {hasDrawnSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <div className="relative border border-[#333] rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={900}
                height={180}
                className="w-full touch-none cursor-crosshair block"
                style={{ height: "140px" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawnSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-[#bbb] text-sm select-none">
                    Sign here with your mouse or finger
                  </p>
                </div>
              )}
            </div>
            {hasScrolledToBottom && !hasDrawnSignature && (
              <p className="text-[#555] text-xs mt-1.5">
                Draw your signature in the box above
              </p>
            )}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group mb-5">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                  agreed
                    ? "bg-[#ADFF00] border-[#ADFF00]"
                    : "bg-transparent border-[#333] group-hover:border-[#555]"
                }`}
              >
                {agreed && (
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[#888] text-sm leading-relaxed">
              I have read and agree to the terms of this client agreement with
              Green Growth Agency
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign button */}
          <button
            onClick={handleSign}
            disabled={!canSign || signing}
            className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            {signing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing your agreement...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Sign Agreement
              </>
            )}
          </button>

          {!canSign && !signing && hasScrolledToBottom && (
            <p className="text-[#555] text-xs text-center mt-3">
              {!signatureName.trim()
                ? "Enter your full legal name above"
                : !hasDrawnSignature
                ? "Draw your signature in the box above"
                : !agreed
                ? "Check the box above to confirm you agree"
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
