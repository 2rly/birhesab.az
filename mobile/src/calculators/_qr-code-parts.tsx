/**
 * Müstəqil QR kod kodlayıcısı (ISO/IEC 18004) — əlavə npm paketi olmadan.
 * Saytdakı `qrcode` paketinin istifadə etdiyi parametrlərə uyğundur:
 * səhv düzəltmə səviyyəsi "M", avtomatik versiya (1–40), avtomatik maska seçimi.
 * Rejimlər: rəqəm, alfanumerik və bayt (UTF-8).
 */

/** Hər blokdakı ECC kod sözləri — səviyyə M, versiya 1..40 (indeks 0 istifadə olunmur) */
const ECC_CODEWORDS_PER_BLOCK_M = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
];

/** ECC blok sayı — səviyyə M, versiya 1..40 */
const NUM_ECC_BLOCKS_M = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33,
  35, 37, 38, 40, 43, 45, 47, 49,
];

/** Format məlumatında M səviyyəsinin 2 bitlik kodu */
const ECL_FORMAT_BITS_M = 0;

const ALNUM_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

type Mode = { bits: number; ccBits: [number, number, number] };
const MODE_NUMERIC: Mode = { bits: 0x1, ccBits: [10, 12, 14] };
const MODE_ALNUM: Mode = { bits: 0x2, ccBits: [9, 11, 13] };
const MODE_BYTE: Mode = { bits: 0x4, ccBits: [8, 16, 16] };

function ccBitsFor(mode: Mode, ver: number): number {
  return mode.ccBits[Math.floor((ver + 7) / 17)];
}

function appendBits(val: number, len: number, bb: number[]): void {
  for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1);
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

function toUtf8(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const d = str.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00);
        i++;
      }
    }
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    else
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return out;
}

interface Segment {
  mode: Mode;
  numChars: number;
  data: number[]; // bitlər
}

function makeSegment(text: string): Segment {
  const bb: number[] = [];
  if (/^[0-9]*$/.test(text)) {
    for (let i = 0; i < text.length; ) {
      const n = Math.min(text.length - i, 3);
      appendBits(parseInt(text.substring(i, i + n), 10), n * 3 + 1, bb);
      i += n;
    }
    return { mode: MODE_NUMERIC, numChars: text.length, data: bb };
  }
  if (/^[A-Z0-9 $%*+.\/:-]*$/.test(text)) {
    let i: number;
    for (i = 0; i + 2 <= text.length; i += 2) {
      let temp = ALNUM_CHARSET.indexOf(text.charAt(i)) * 45;
      temp += ALNUM_CHARSET.indexOf(text.charAt(i + 1));
      appendBits(temp, 11, bb);
    }
    if (i < text.length) appendBits(ALNUM_CHARSET.indexOf(text.charAt(i)), 6, bb);
    return { mode: MODE_ALNUM, numChars: text.length, data: bb };
  }
  const bytes = toUtf8(text);
  for (const b of bytes) appendBits(b, 8, bb);
  return { mode: MODE_BYTE, numChars: bytes.length, data: bb };
}

function numRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function numDataCodewords(ver: number): number {
  return Math.floor(numRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK_M[ver] * NUM_ECC_BLOCKS_M[ver];
}

// ---- Reed–Solomon ----
function rsMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = rsMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= rsMultiply(coef, factor);
    });
  }
  return result;
}

function addEccAndInterleave(data: number[], ver: number): number[] {
  const numBlocks = NUM_ECC_BLOCKS_M[ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK_M[ver];
  const rawCodewords = Math.floor(numRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const div = rsDivisor(blockEccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

function alignmentPositions(ver: number, size: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

function maskFn(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

/** Mətni QR matrisinə çevirir (true = tünd modul). Tutum aşılarsa null. */
export function encodeQR(text: string): boolean[][] | null {
  const seg = makeSegment(text);

  // Versiya seçimi (M səviyyəsi, artırılmadan — `qrcode` paketində olduğu kimi)
  let ver = 1;
  let usedBits = 0;
  for (; ; ver++) {
    const cc = ccBitsFor(seg.mode, ver);
    const capacityBits = numDataCodewords(ver) * 8;
    if (seg.numChars < 1 << cc) {
      usedBits = 4 + cc + seg.data.length;
      if (usedBits <= capacityBits) break;
    }
    if (ver >= 40) return null;
  }

  // Bit axını
  const bb: number[] = [];
  appendBits(seg.mode.bits, 4, bb);
  appendBits(seg.numChars, ccBitsFor(seg.mode, ver), bb);
  for (const b of seg.data) bb.push(b);
  const capacityBits = numDataCodewords(ver) * 8;
  appendBits(0, Math.min(4, capacityBits - bb.length), bb);
  appendBits(0, (8 - (bb.length % 8)) % 8, bb);
  for (let pad = 0xec; bb.length < capacityBits; pad ^= 0xec ^ 0x11) appendBits(pad, 8, bb);

  const dataCodewords: number[] = [];
  while (dataCodewords.length * 8 < bb.length) dataCodewords.push(0);
  bb.forEach((b, i) => {
    dataCodewords[i >>> 3] |= b << (7 - (i & 7));
  });

  const allCodewords = addEccAndInterleave(dataCodewords, ver);

  // Matris
  const size = ver * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const setF = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  // Vaxt (timing) xətləri
  for (let i = 0; i < size; i++) {
    setF(6, i, i % 2 === 0);
    setF(i, 6, i % 2 === 0);
  }
  // Axtarış (finder) naxışları
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = cx + dx;
        const yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, dist !== 2 && dist !== 4);
      }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);
  // Düzləndirmə (alignment) naxışları
  const pos = alignmentPositions(ver, size);
  const n = pos.length;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) setF(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }

  const drawFormat = (mask: number) => {
    const data = (ECL_FORMAT_BITS_M << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setF(8, i, getBit(bits, i));
    setF(8, 7, getBit(bits, 6));
    setF(8, 8, getBit(bits, 7));
    setF(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setF(14 - i, 8, getBit(bits, i));
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setF(8, size - 15 + i, getBit(bits, i));
    setF(8, size - 8, true);
  };
  drawFormat(0); // yer tutucu

  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setF(a, b, bit);
      setF(b, a, bit);
    }
  }

  // Kod sözlərinin yerləşdirilməsi (ziqzaq)
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIdx < allCodewords.length * 8) {
          modules[y][x] = getBit(allCodewords[bitIdx >>> 3], 7 - (bitIdx & 7));
          bitIdx++;
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) if (!isFunction[y][x] && maskFn(mask, x, y)) modules[y][x] = !modules[y][x];
  };

  // Ən aşağı cərimə xallı maskanı seç
  let bestMask = 0;
  let minPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    applyMask(m);
    drawFormat(m);
    const p = penalty(modules, size);
    if (p < minPenalty) {
      minPenalty = p;
      bestMask = m;
    }
    applyMask(m); // geri qaytar (XOR)
  }
  applyMask(bestMask);
  drawFormat(bestMask);

  return modules;
}

function penalty(m: boolean[][], size: number): number {
  let result = 0;
  const N1 = 3, N2 = 3, N3 = 40, N4 = 10;

  // Qayda 1: eyni rəngli ardıcıl 5+ modul (sətir və sütun)
  for (let y = 0; y < size; y++) {
    let runX = 1, runY = 1;
    for (let x = 1; x < size; x++) {
      if (m[y][x] === m[y][x - 1]) runX++;
      else {
        if (runX >= 5) result += N1 + (runX - 5);
        runX = 1;
      }
      if (m[x][y] === m[x - 1][y]) runY++;
      else {
        if (runY >= 5) result += N1 + (runY - 5);
        runY = 1;
      }
    }
    if (runX >= 5) result += N1 + (runX - 5);
    if (runY >= 5) result += N1 + (runY - 5);
  }

  // Qayda 2: 2x2 eyni rəngli bloklar
  for (let y = 0; y < size - 1; y++)
    for (let x = 0; x < size - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) result += N2;
    }

  // Qayda 3: 1:1:3:1:1 finder-bənzər naxışlar
  const P1 = [true, false, true, true, true, false, true, false, false, false, false];
  const P2 = [false, false, false, false, true, false, true, true, true, false, true];
  for (let y = 0; y < size; y++)
    for (let x = 0; x <= size - 11; x++) {
      let r1 = true, r2 = true, c1 = true, c2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[y][x + k] !== P1[k]) r1 = false;
        if (m[y][x + k] !== P2[k]) r2 = false;
        if (m[x + k][y] !== P1[k]) c1 = false;
        if (m[x + k][y] !== P2[k]) c2 = false;
      }
      if (r1) result += N3;
      if (r2) result += N3;
      if (c1) result += N3;
      if (c2) result += N3;
    }

  // Qayda 4: tünd/açıq balans
  let dark = 0;
  for (const row of m) for (const c of row) if (c) dark++;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * N4;
  return result;
}

/** Matrisi SVG path sətrinə çevirir (sətir üzrə ardıcıl tünd modulları birləşdirir). */
export function qrPath(matrix: boolean[][], margin: number): string {
  let d = "";
  matrix.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < row.length && row[x + len]) len++;
      // 0.04 modul üst-üstə düşmə — sətirlər arasında antialiasing xətlərinin qarşısını alır
      d += `M${x + margin} ${y + margin}h${len}v1.04h-${len}z`;
      x += len;
    }
  });
  return d;
}
