// Pure layout math (no Three.js) so it can be unit-tested.
// Each function returns [{x, y, z, look}] where `look` is a point the tile should face (or null).

export const TABLE = { cols: 20, rows: 10, dx: 140, dy: 180 };
export const GRID = { cols: 10, rows: 4, layers: 5, dx: 220, dy: 260, dz: 500 }; // 10 x 4 x 5 = 200
export const SPHERE_RADIUS = 800;
export const HELIX = { radius: 900, turnStep: 0.3, rise: 10 };
export const CAPACITY = TABLE.cols * TABLE.rows; // 200

export function tableLayout(n) {
  return Array.from({ length: n }, (_, i) => {
    const c = i % TABLE.cols;
    const r = Math.floor(i / TABLE.cols) % TABLE.rows;
    return {
      x: (c - (TABLE.cols - 1) / 2) * TABLE.dx,
      y: -(r - (TABLE.rows - 1) / 2) * TABLE.dy,
      z: 0,
      look: null,
    };
  });
}

export function sphereLayout(n) {
  return Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / n);
    const theta = Math.sqrt(n * Math.PI) * phi;
    const x = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
    const y = SPHERE_RADIUS * Math.cos(phi);
    const z = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
    return { x, y, z, look: { x: x * 2, y: y * 2, z: z * 2 } };
  });
}

/** Double helix: even tiles form strand A, odd tiles strand B (rotated 180°). */
export function helixLayout(n) {
  const perStrand = Math.ceil(n / 2);
  return Array.from({ length: n }, (_, i) => {
    const strand = i % 2;
    const k = Math.floor(i / 2);
    const theta = k * HELIX.turnStep + strand * Math.PI;
    const x = HELIX.radius * Math.sin(theta);
    const y = -(k - (perStrand - 1) / 2) * HELIX.rise;
    const z = -HELIX.radius * Math.cos(theta);
    return { x, y, z, look: { x: x * 2, y, z: z * 2 } };
  });
}

/** 5 (depth) x 4 (height) x 10 (width) grid. */
export function gridLayout(n) {
  const perLayer = GRID.cols * GRID.rows;
  return Array.from({ length: n }, (_, i) => {
    const c = i % GRID.cols;
    const r = Math.floor(i / GRID.cols) % GRID.rows;
    const l = Math.floor(i / perLayer) % GRID.layers;
    return {
      x: (c - (GRID.cols - 1) / 2) * GRID.dx,
      y: -(r - (GRID.rows - 1) / 2) * GRID.dy,
      z: (l - (GRID.layers - 1) / 2) * GRID.dz,
      look: null,
    };
  });
}

export const LAYOUTS = { table: tableLayout, sphere: sphereLayout, helix: helixLayout, grid: gridLayout };
