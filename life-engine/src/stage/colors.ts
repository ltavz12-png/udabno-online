/** Small colour helpers for the procedural stage. */

export function hexNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear interpolate two 0xRRGGBB colours. */
export function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return (r << 16) | (g << 8) | bl;
}

export function mixHex(a: string, b: string, t: number): number {
  return mix(hexNum(a), hexNum(b), t);
}

/**
 * Map an atmosphere value in [0,1] (0 = dawn, 1 = deepest night) to a two-stop
 * sky gradient, blending across dawn→day→dusk→night keyframes.
 */
export function skyGradientColors(
  atmosphere: number,
  sky: { dawn: readonly [string, string]; day: readonly [string, string]; dusk: readonly [string, string]; night: readonly [string, string] },
): [number, number] {
  const stops: Array<readonly [string, string]> = [sky.dawn, sky.day, sky.dusk, sky.night];
  const x = Math.max(0, Math.min(1, atmosphere)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  return [mixHex(stops[i][0], stops[i + 1][0], f), mixHex(stops[i][1], stops[i + 1][1], f)];
}
