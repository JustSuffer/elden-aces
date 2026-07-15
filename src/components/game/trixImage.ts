import trixIconJpgAsset from "@/assets/trix-icon.asset.json";
import trixIconPngAsset from "@/assets/trix-mascot-icon.png.asset.json";
import trixFullPngAsset from "@/assets/trix-mascot.png.asset.json";
import localTrixIcon from "@/assets/trix-mascot-icon.jpg";

const toRootAsset = (url: string) => {
  if (typeof window === "undefined") return url;
  if (url.startsWith("./")) return new URL(url.slice(2), `${window.location.origin}/`).href;
  if (url.startsWith("/")) return new URL(url, window.location.origin).href;
  return url;
};

export const TRIX_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="62%">
      <stop offset="0" stop-color="#fef3c7"/>
      <stop offset="0.5" stop-color="#d97706"/>
      <stop offset="1" stop-color="#1c1917"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="240" height="240" rx="120" fill="#0c0a09"/>
  <circle cx="120" cy="120" r="104" fill="url(#g)" opacity=".95"/>
  <path d="M58 83c12-34 42-42 62-20 20-22 50-14 62 20-10-5-20-5-30 0 9 12 13 27 13 43 0 36-20 61-45 61s-45-25-45-61c0-16 4-31 13-43-10-5-20-5-30 0Z" fill="#292524" stroke="#fbbf24" stroke-width="6"/>
  <circle cx="92" cy="118" r="24" fill="#fef3c7"/>
  <circle cx="148" cy="118" r="24" fill="#fef3c7"/>
  <circle cx="92" cy="118" r="10" fill="#111827"/>
  <circle cx="148" cy="118" r="10" fill="#111827"/>
  <path d="M120 134l-16-14h32l-16 14Z" fill="#f59e0b" stroke="#451a03" stroke-width="3"/>
  <rect x="83" y="156" width="74" height="46" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="5" filter="url(#glow)"/>
  <path d="M99 179h42" stroke="#fef3c7" stroke-width="6" stroke-linecap="round"/>
  <text x="120" y="45" text-anchor="middle" font-family="serif" font-size="28" font-weight="700" fill="#fef3c7">TRIX</text>
</svg>`)} `;

export const getTrixImageSources = () => [
  toRootAsset(trixIconJpgAsset.url),
  toRootAsset(trixIconPngAsset.url),
  toRootAsset(trixFullPngAsset.url),
  toRootAsset(localTrixIcon),
  TRIX_FALLBACK_IMAGE,
];