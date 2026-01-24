"use client";

import { useEffect, useRef } from "react";

interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
}

/**
 * Simple QR Code component using Canvas API
 * Generates a basic QR-like grid pattern for demo purposes
 * For production, use a library like 'qrcode' or 'qr-code-styling'
 */
export function QRCode({ value, size = 150, bgColor = "#ffffff", fgColor = "#000000" }: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Generate a simple hash-based pattern (demo QR-like appearance)
        const moduleCount = 25; // Grid size
        const moduleSize = size / moduleCount;
        const padding = 2;

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        ctx.fillStyle = fgColor;

        // Draw finder patterns (corners)
        const drawFinderPattern = (x: number, y: number) => {
            // Outer square
            ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
            ctx.fillStyle = bgColor;
            ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
            ctx.fillStyle = fgColor;
            ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
        };

        // Top-left finder
        drawFinderPattern(padding, padding);
        // Top-right finder
        drawFinderPattern(moduleCount - 7 - padding, padding);
        // Bottom-left finder
        drawFinderPattern(padding, moduleCount - 7 - padding);

        // Generate data pattern based on value hash
        const seed = Math.abs(hash);
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                // Skip finder pattern areas
                if (
                    (row < 9 + padding && col < 9 + padding) ||
                    (row < 9 + padding && col > moduleCount - 9 - padding) ||
                    (row > moduleCount - 9 - padding && col < 9 + padding)
                ) {
                    continue;
                }

                // Generate pseudo-random pattern based on position and seed
                const posHash = (row * moduleCount + col + seed) % 100;
                if (posHash > 50) {
                    ctx.fillStyle = fgColor;
                    ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 0.5, moduleSize - 0.5);
                }
            }
        }
    }, [value, size, bgColor, fgColor]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded-lg"
            style={{ imageRendering: "pixelated" }}
        />
    );
}


/**
 * Hook to generate QR code data URL
 */
export function useQRCode(value: string, size: number = 150): string | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    if (typeof window === "undefined") return null;

    // Create canvas if needed
    if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Same drawing logic as component
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    const padding = 2;

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash = hash & hash;
    }

    ctx.fillStyle = "#000000";

    const drawFinder = (x: number, y: number) => {
        ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = "#000000";
        ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinder(padding, padding);
    drawFinder(moduleCount - 7 - padding, padding);
    drawFinder(padding, moduleCount - 7 - padding);

    const seed = Math.abs(hash);
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (
                (row < 9 + padding && col < 9 + padding) ||
                (row < 9 + padding && col > moduleCount - 9 - padding) ||
                (row > moduleCount - 9 - padding && col < 9 + padding)
            ) continue;

            if ((row * moduleCount + col + seed) % 100 > 50) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 0.5, moduleSize - 0.5);
            }
        }
    }

    return canvas.toDataURL("image/png");
}
