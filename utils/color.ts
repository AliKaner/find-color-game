/**
 * Color Utilities for HSB and RGB conversion
 */

export interface HSB {
  h: number;
  s: number;
  b: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const hsbToRgb = (h: number, s: number, b: number): RGB => {
  const S = s / 100;
  const B = b / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => B * (1 - S * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1)),
  };
};

export const hsbToCss = (h: number, s: number, b: number): string => {
  const { r, g, b: blue } = hsbToRgb(h, s, b);
  return `rgb(${r}, ${g}, ${blue})`;
};

export const generateRandomHSB = (): HSB => {
  return {
    h: Math.floor(Math.random() * 361),
    s: Math.floor(Math.random() * 80) + 20, // Avoid too desaturated
    b: Math.floor(Math.random() * 70) + 30, // Avoid too dark
  };
};

export const calculateColorScore = (target: HSB, user: HSB): number => {
  let hDiff = Math.abs(target.h - user.h);
  if (hDiff > 180) hDiff = 360 - hDiff;
  hDiff /= 180;

  const sDiff = Math.abs(target.s - user.s) / 100;
  const bDiff = Math.abs(target.b - user.b) / 100;

  // Weighted distance (Hue 1.5x, Brightness 1.2x)
  const distance = Math.sqrt(
    Math.pow(hDiff * 1.5, 2) + Math.pow(sDiff, 2) + Math.pow(bDiff, 1.2)
  );

  let rawScore = 10 - distance * 6;
  return Math.max(0, Math.min(10, rawScore));
};

export const getFunnyComment = (score: number): string => {
  const comments = [
    "Your brain saw the color and chose treason.",
    "Almost there! Or maybe not.",
    "Is your monitor calibrated? No? Okay.",
    "That's... certainly a color.",
    "Perfectly imperfect.",
    "Close enough for government work.",
    "Your color intuition is unique.",
    "Wait, did you even look at it?",
    "A bold choice.",
    "Magnificent error.",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
};
