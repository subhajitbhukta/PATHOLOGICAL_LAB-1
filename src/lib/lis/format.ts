// ============================================================
// Formatting helpers — Indian currency, dates, misc
// ============================================================

export function inr(n: number | undefined | null, opts?: { compact?: boolean }): string {
  if (n === undefined || n === null) return "—";
  if (opts?.compact) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  }
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function fmtDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function fmtDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  return `${fmtDate(iso)}, ${fmtTime(iso)}`;
}

export function maskMobile(m: string): string {
  const digits = m.replace(/\D/g, "");
  if (digits.length < 4) return m;
  return `+91 ${digits.slice(-10, -5).replace(/\d/g, "•")} ${digits.slice(-5)}`;
}

export function ageSex(p: { age: number; gender: string }): string {
  return `${p.age}y / ${p.gender === "Male" ? "M" : "F"}`;
}

// Deterministic pseudo-QR pattern generator (visual only)
export function qrMatrix(value: string, size = 21): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) / 4294967296);
  };
  const m: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) m[y][x] = rand() > 0.52;
  // finder patterns
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const edge = x === 0 || y === 0 || x === 6 || y === 6;
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      m[oy + y][ox + x] = edge || core;
    }
    for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
      const yy = oy + y, xx = ox + x;
      if (yy < 0 || xx < 0 || yy >= size || xx >= size) continue;
      if (x === -1 || y === -1 || x === 7 || y === 7) m[yy][xx] = false;
    }
  };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  // timing strips
  for (let i = 8; i < size - 8; i++) { m[6][i] = i % 2 === 0; m[i][6] = i % 2 === 0; }
  return m;
}

// Deterministic barcode bar widths from string
export function barcodeBars(value: string, count = 48): number[] {
  let h = 5381;
  const bars: number[] = [];
  for (let i = 0; i < value.length; i++) h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(1 + ((h >>> (i % 7)) % 4));
  }
  return bars;
}
