// Pure layout + routing for Career City. No three.js in here, so the map can be
// reasoned about on its own.
//
// The city is a 2 x 2 grid of blocks. World axes: +x is east (screen right),
// +z is south (towards the camera). Every landmark sits on the north side of a
// horizontal road so its front always faces the camera.

export const ROAD_WIDTH = 8;
export const ROAD_XS = [-44, 0, 44]; // north-south roads
export const ROAD_ZS = [-32, 0, 32]; // east-west roads
export const BOUNDS = { minX: -60, maxX: 60, minZ: -62, maxZ: 50 };

export const RING_RADIUS = 3;
const RING_SETBACK = 9; // ring centre, measured north from the road centre line
const BUILDING_SETBACK = 19; // building centre, same measure

// id -> where the landmark's road access point is.
const PLOTS = {
  home: { x: -22, roadZ: 32 },
  experience: { x: -22, roadZ: 0 },
  projects: { x: 22, roadZ: 0 },
  skills: { x: 22, roadZ: 32 },
  education: { x: -22, roadZ: -32 },
  contact: { x: 22, roadZ: -32 },
};

export const SITES = Object.fromEntries(
  Object.entries(PLOTS).map(([id, plot]) => [
    id,
    {
      id,
      x: plot.x,
      roadZ: plot.roadZ,
      ring: { x: plot.x, z: plot.roadZ - RING_SETBACK },
      building: { x: plot.x, z: plot.roadZ - BUILDING_SETBACK },
    },
  ]),
);

// The car starts on the road right next to the first stop.
export const START = { x: -11, z: 32, heading: -Math.PI / 2 };

/* ---- Road graph: the nine intersections ------------------------------ */
const NODES = [];
ROAD_ZS.forEach((z) => ROAD_XS.forEach((x) => NODES.push({ x, z })));
const nodeIndex = (ix, iz) => iz * ROAD_XS.length + ix;

const EDGES = []; // [a, b] node indices
for (let iz = 0; iz < ROAD_ZS.length; iz += 1) {
  for (let ix = 0; ix < ROAD_XS.length; ix += 1) {
    if (ix + 1 < ROAD_XS.length) EDGES.push([nodeIndex(ix, iz), nodeIndex(ix + 1, iz)]);
    if (iz + 1 < ROAD_ZS.length) EDGES.push([nodeIndex(ix, iz), nodeIndex(ix, iz + 1)]);
  }
}

export const ROAD_SEGMENTS = EDGES.map(([a, b]) => ({ a: NODES[a], b: NODES[b] }));
export const INTERSECTIONS = NODES;

const dist = (p, q) => Math.hypot(p.x - q.x, p.z - q.z);

function projectOnEdge(point, edge) {
  const a = NODES[edge[0]];
  const b = NODES[edge[1]];
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const t = Math.min(1, Math.max(0, ((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz)));
  const p = { x: a.x + dx * t, z: a.z + dz * t };
  return { p, d: dist(point, p) };
}

function nearestRoadPoint(point) {
  let best = null;
  EDGES.forEach((edge) => {
    const hit = projectOnEdge(point, edge);
    if (!best || hit.d < best.d) best = { ...hit, edge };
  });
  return best;
}

/**
 * Waypoints from any position to a stop's ring, keeping to the roads:
 * nearest road point -> intersections (shortest path) -> access point -> ring.
 */
export function routeTo(from, stopId) {
  const site = SITES[stopId];
  if (!site) return [];
  const access = { x: site.x, z: site.roadZ };
  const start = nearestRoadPoint(from);
  const goal = nearestRoadPoint(access);
  const tail = [access, { ...site.ring }];

  const sameEdge = start.edge === goal.edge;
  const direct = sameEdge ? dist(start.p, access) : Infinity;

  // Dijkstra over nine nodes, seeded from both ends of the starting edge.
  const cost = NODES.map(() => Infinity);
  const prev = NODES.map(() => -1);
  const done = NODES.map(() => false);
  start.edge.forEach((n) => {
    cost[n] = dist(start.p, NODES[n]);
  });
  for (let step = 0; step < NODES.length; step += 1) {
    let u = -1;
    for (let i = 0; i < NODES.length; i += 1) {
      if (!done[i] && (u < 0 || cost[i] < cost[u])) u = i;
    }
    if (u < 0 || cost[u] === Infinity) break;
    done[u] = true;
    EDGES.forEach(([a, b]) => {
      if (a !== u && b !== u) return;
      const v = a === u ? b : a;
      const next = cost[u] + dist(NODES[u], NODES[v]);
      if (next < cost[v]) {
        cost[v] = next;
        prev[v] = u;
      }
    });
  }

  let end = goal.edge[0];
  if (cost[goal.edge[1]] + dist(NODES[goal.edge[1]], access) < cost[end] + dist(NODES[end], access)) {
    end = goal.edge[1];
  }
  const viaNodes = cost[end] + dist(NODES[end], access);
  if (direct <= viaNodes) return [start.p, ...tail];

  const chain = [];
  for (let n = end; n >= 0; n = prev[n]) chain.unshift({ ...NODES[n] });
  return [start.p, ...chain, ...tail];
}
