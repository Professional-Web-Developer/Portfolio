'use client';

import { useEffect, useRef } from 'react';
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  OctahedronGeometry,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { STOPS } from './stops';
import {
  BOUNDS,
  INTERSECTIONS,
  RING_RADIUS,
  ROAD_SEGMENTS,
  ROAD_WIDTH,
  ROAD_XS,
  ROAD_ZS,
  SITES,
  START,
  routeTo,
} from './cityMap';

/* ---- Driving feel ----------------------------------------------------- */
const MAX_SPEED = 17;
const AUTO_SPEED = 20;
const ACCEL = 26;
const BRAKE = 36;
const TURN_RATE = 5.5; // rad/s
const CAR_RADIUS = 1.5;
const REARM_DISTANCE = RING_RADIUS + 3;
// px: labels never go above the HUD (top bar, plus the stop strip and hint on small screens)
const LABEL_MIN_Y = 108;
const LABEL_MIN_Y_SMALL = 214;

/* ---- Palette (materials stay the same; the lights change per theme) --- */
const C = {
  grass: '#8fce7c',
  grassDark: '#7fc070',
  road: '#565e6e',
  dash: '#f1f3f6',
  pavement: '#d5dae2',
  plaza: '#e7e2d8',
  drive: '#c3c9d3',
  trunk: '#8a5a3c',
  pole: '#3d4654',
  water: '#5aa9e6',
  car: '#ff5a4f',
  carDark: '#22303f',
  tyre: '#1c222b',
  amber: '#ffb300',
  done: '#22b573',
};
const FILLER_COLORS = ['#ece4d6', '#d6dee9', '#ead6cf', '#d0dfd4', '#ddd4ea', '#f1e5c6', '#cfe0e6'];
const FOLIAGE_COLORS = ['#4fae62', '#3f9d58', '#63bd6c', '#58a84b'];

const THEMES = {
  light: {
    sky: '#bfe4ff',
    hemiSky: '#ffffff',
    hemiGround: '#b7d9a8',
    hemi: 1.75,
    sun: '#fff0d2',
    sunPower: 2.3,
    windows: ['#8fc1ea', '#a9d2f2', '#7fb3df', '#c4e2f7'],
    glass: '#a9d2f2',
    bulb: '#f4efe2',
    carLight: 0,
    beacon: 0.2,
  },
  dark: {
    sky: '#0d1526',
    hemiSky: '#8aa0e6',
    hemiGround: '#243247',
    hemi: 0.95,
    sun: '#a9bcff',
    sunPower: 0.85,
    windows: ['#ffd27a', '#ffe3a3', '#27324a', '#ffc65c', '#1f2940'],
    glass: '#ffdf9e',
    bulb: '#ffdc8f',
    carLight: 70,
    beacon: 0.3,
  },
};

const wrapAngle = (a) => {
  let out = a;
  while (out > Math.PI) out -= Math.PI * 2;
  while (out < -Math.PI) out += Math.PI * 2;
  return out;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Small seeded generator so the city is identical on every visit.
function seeded(seed) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

export default function CityScene({ apiRef, onEvent }) {
  const hostRef = useRef(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const emit = (type, payload) => {
      const cb = onEventRef.current;
      if (typeof cb === 'function') cb(type, payload);
    };

    const canvas = document.createElement('canvas');
    canvas.className = 'city-scene__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.tabIndex = -1;

    // Probe for a context ourselves so a failure stays silent and we can fall back.
    let failTimer = 0;
    const failSoon = () => {
      failTimer = window.setTimeout(() => emit('fail'), 0);
      return () => window.clearTimeout(failTimer);
    };
    let gl = null;
    try {
      gl = canvas.getContext('webgl2', { alpha: false, antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      gl = null;
    }
    if (!gl) return failSoon();

    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, context: gl, antialias: true });
    } catch (e) {
      return failSoon();
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    host.appendChild(canvas);

    const disposables = [];
    const track = (item) => {
      disposables.push(item);
      return item;
    };
    const rand = seeded(11);

    /* ---- Shared geometry and materials ---------------------------- */
    const prismShape = new Shape();
    prismShape.moveTo(-0.5, 0);
    prismShape.lineTo(0.5, 0);
    prismShape.lineTo(0, 1);
    prismShape.closePath();
    const sawShape = new Shape();
    sawShape.moveTo(-0.5, 0);
    sawShape.lineTo(0.5, 0);
    sawShape.lineTo(-0.5, 1);
    sawShape.closePath();
    const arrowShape = new Shape();
    arrowShape.moveTo(0, 1.5);
    arrowShape.lineTo(1.25, 0);
    arrowShape.lineTo(0.5, 0);
    arrowShape.lineTo(0.5, -1.2);
    arrowShape.lineTo(-0.5, -1.2);
    arrowShape.lineTo(-0.5, 0);
    arrowShape.lineTo(-1.25, 0);
    arrowShape.closePath();

    const geo = {
      box: track(new BoxGeometry(1, 1, 1)),
      cyl: track(new CylinderGeometry(1, 1, 1, 16)),
      cone: track(new ConeGeometry(1, 1, 16)),
      pyramid: track(new ConeGeometry(1, 1, 4).rotateY(Math.PI / 4)),
      sphere: track(new SphereGeometry(1, 16, 12)),
      dome: track(new SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
      prism: track(new ExtrudeGeometry(prismShape, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5)),
      saw: track(new ExtrudeGeometry(sawShape, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5)),
      foliage: track(new IcosahedronGeometry(1, 0)),
      torus: track(new TorusGeometry(1, 0.28, 8, 20)),
      ground: track(new PlaneGeometry(520, 520).rotateX(-Math.PI / 2)),
      ring: track(new RingGeometry(RING_RADIUS - 0.55, RING_RADIUS, 40).rotateX(-Math.PI / 2)),
      disc: track(new CircleGeometry(RING_RADIUS - 0.55, 32).rotateX(-Math.PI / 2)),
      beacon: track(new CylinderGeometry(RING_RADIUS - 0.7, RING_RADIUS - 0.7, 1, 28, 1, true).translate(0, 0.5, 0)),
      gem: track(new OctahedronGeometry(0.9, 0)),
      arrow: track(new ShapeGeometry(arrowShape).rotateX(-Math.PI / 2)),
    };

    const lambertCache = new Map();
    const lam = (hex, flat) => {
      const key = `${hex}${flat ? 'f' : ''}`;
      if (!lambertCache.has(key)) {
        lambertCache.set(key, track(new MeshLambertMaterial({ color: hex, flatShading: Boolean(flat) })));
      }
      return lambertCache.get(key);
    };

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 1, 420);
    const world = new Group();
    scene.add(world);

    const put = (parent, geometry, material, sx, sy, sz, x, y, z, shadow = true) => {
      const mesh = new Mesh(geometry, material);
      mesh.scale.set(sx, sy, sz);
      mesh.position.set(x, y, z);
      mesh.castShadow = shadow;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    // y is always the bottom of the shape.
    const box = (parent, w, h, d, hex, x, y, z, shadow) => put(parent, geo.box, lam(hex), w, h, d, x, y + h / 2, z, shadow);
    const cyl = (parent, r, h, hex, x, y, z) => put(parent, geo.cyl, lam(hex), r, h, r, x, y + h / 2, z);
    const cone = (parent, r, h, hex, x, y, z) => put(parent, geo.cone, lam(hex), r, h, r, x, y + h / 2, z);
    const pyramid = (parent, w, h, d, hex, x, y, z) =>
      put(parent, geo.pyramid, lam(hex, true), w / Math.SQRT2, h, d / Math.SQRT2, x, y + h / 2, z);
    const prism = (parent, w, h, d, hex, x, y, z) => put(parent, geo.prism, lam(hex), w, h, d, x, y, z);

    /* ---- Ground, roads, blocks ------------------------------------- */
    const ground = new Mesh(geo.ground, lam(C.grass));
    ground.receiveShadow = true;
    world.add(ground);

    const half = ROAD_WIDTH / 2;
    const spanX = ROAD_XS[ROAD_XS.length - 1] - ROAD_XS[0];
    const spanZ = ROAD_ZS[ROAD_ZS.length - 1] - ROAD_ZS[0];
    ROAD_ZS.forEach((z) => box(world, spanX + ROAD_WIDTH, 0.06, ROAD_WIDTH, C.road, 0, 0, z, false));
    ROAD_XS.forEach((x) => box(world, ROAD_WIDTH, 0.06, spanZ + ROAD_WIDTH, C.road, x, 0.001, 0, false));

    // City blocks: a pavement slab with a lawn inset.
    const blocks = [];
    for (let ix = 0; ix < ROAD_XS.length - 1; ix += 1) {
      const x0 = ROAD_XS[ix] + half;
      const x1 = ROAD_XS[ix + 1] - half;
      for (let iz = 0; iz < ROAD_ZS.length - 1; iz += 1) {
        blocks.push({ x0, x1, z0: ROAD_ZS[iz] + half, z1: ROAD_ZS[iz + 1] - half });
      }
      blocks.push({ x0, x1, z0: ROAD_ZS[0] - half - 26, z1: ROAD_ZS[0] - half }); // northern strip
    }
    blocks.forEach((b) => {
      const w = b.x1 - b.x0;
      const d = b.z1 - b.z0;
      const cx = (b.x0 + b.x1) / 2;
      const cz = (b.z0 + b.z1) / 2;
      box(world, w, 0.12, d, C.pavement, cx, 0, cz, false);
      box(world, w - 3, 0.15, d - 3, C.grassDark, cx, 0, cz, false);
    });

    /* ---- Collision shapes and instanced scenery lists --------------- */
    const rects = []; // { x0, x1, z0, z1 } building footprints
    const circles = []; // { x, z, r } trees, pond
    const windows = []; // [x, y, z, sx, sy, sz]
    const addRect = (cx, cz, w, d) => rects.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });

    // Rows of windows on one face of a box ('s' faces the camera, 'e' / 'w' are the sides).
    const windowGrid = (face, cx, cz, w, d, y0, y1, cols, rows, ww = 0.9, wh = 1.1) => {
      const span = face === 's' ? w : d;
      for (let r = 0; r < rows; r += 1) {
        const y = y0 + ((r + 0.5) / rows) * (y1 - y0);
        for (let c = 0; c < cols; c += 1) {
          const t = ((c + 0.5) / cols - 0.5) * (span - 1.2);
          if (face === 's') windows.push([cx + t, y, cz + d / 2 + 0.02, ww, wh, 0.12]);
          else windows.push([cx + (face === 'e' ? w / 2 + 0.02 : -w / 2 - 0.02), y, cz + t, 0.12, wh, ww]);
        }
      }
    };

    /* ---- Landmarks -------------------------------------------------- */
    // Each builder works in local coordinates: origin at the building centre,
    // front facing +z (south). It returns the footprint and label height.
    const glassMaterial = track(new MeshBasicMaterial({ color: THEMES.light.glass }));
    const builders = {
      home(g, ox, oz) {
        box(g, 10, 5, 8, '#f7e6c4', 0, 0, 0);
        prism(g, 11.4, 3.4, 9, '#e2574c', 0, 5, 0);
        box(g, 1.1, 2.6, 1.1, '#b9483f', 3, 6, -1.5);
        box(g, 1.7, 2.7, 0.25, '#7a4a2b', 0, 0, 4.05);
        box(g, 3, 0.25, 1.6, '#cfd5dd', 0, 0, 4.8, false);
        box(g, 4.4, 3, 5, '#f1dcb4', -7, 0, 1);
        prism(g, 5, 1.5, 5.6, '#c9463c', -7, 3, 1);
        box(g, 3, 2.3, 0.2, '#9aa5b5', -7, 0, 3.55);
        windowGrid('s', ox - 3, oz, 4, 8, 1.6, 3.8, 1, 1, 1.5, 1.5);
        windowGrid('s', ox + 3, oz, 4, 8, 1.6, 3.8, 1, 1, 1.5, 1.5);
        windowGrid('e', ox, oz, 10, 8, 1.6, 3.8, 2, 1, 1.3, 1.4);
        return { w: 15, d: 9, cx: -1.9, label: 9.5 };
      },
      experience(g, ox, oz) {
        box(g, 13, 3, 10, '#d8e0ee', 0, 0, 0);
        box(g, 9, 14, 7.6, '#4f86e8', 0, 3, -0.4);
        box(g, 9.4, 0.5, 8, '#e9eef7', 0, 17, -0.4);
        box(g, 6, 4.5, 5.2, '#6c9df0', 0, 17.5, -0.6);
        box(g, 6.4, 0.4, 5.6, '#e9eef7', 0, 22, -0.6);
        cyl(g, 0.14, 4, '#3d4654', 1.4, 22.4, -1);
        put(g, geo.sphere, lam('#ff5a4f'), 0.35, 0.35, 0.35, 1.4, 26.5, -1);
        box(g, 3.4, 2.4, 0.3, '#22303f', 0, 0, 5.05);
        box(g, 5, 0.3, 1.6, '#4f86e8', 0, 2.5, 5.6);
        windowGrid('s', ox, oz - 0.4, 9, 7.6, 4, 16.4, 4, 6, 1.3, 1.25);
        windowGrid('e', ox, oz - 0.4, 9, 7.6, 4, 16.4, 3, 6, 1.3, 1.25);
        windowGrid('w', ox, oz - 0.4, 9, 7.6, 4, 16.4, 3, 6, 1.3, 1.25);
        windowGrid('s', ox, oz - 0.6, 6, 5.2, 18.3, 21.4, 3, 2, 1.1, 1);
        windowGrid('s', ox - 4.4, oz, 4, 10, 0.8, 2.4, 2, 1, 1.2, 1.2);
        windowGrid('s', ox + 4.4, oz, 4, 10, 0.8, 2.4, 2, 1, 1.2, 1.2);
        return { w: 13, d: 10, cx: 0, label: 28 };
      },
      projects(g) {
        box(g, 16, 5, 10, '#f1f3f8', 0, 0, 0);
        box(g, 16.3, 0.9, 10.3, '#8b5cf6', 0, 4.3, 0);
        put(g, geo.box, glassMaterial, 9.5, 3.2, 0.3, -2.2, 2, 5.05, false);
        box(g, 0.25, 3.4, 0.4, '#8b5cf6', -2.2, 0.4, 5.1);
        box(g, 0.25, 3.4, 0.4, '#8b5cf6', -5.4, 0.4, 5.1);
        box(g, 0.25, 3.4, 0.4, '#8b5cf6', 1, 0.4, 5.1);
        box(g, 2, 3, 0.3, '#3b2a6b', 5.2, 0, 5.05);
        put(g, geo.dome, lam('#a78bfa', true), 3.6, 3.6, 3.6, -3.6, 5.2, -0.6);
        // A little rocket on the roof: projects that launch.
        cyl(g, 0.75, 3.4, '#f5f6fa', 4.8, 5.9, -0.5);
        cone(g, 0.78, 1.6, '#ff5a4f', 4.8, 9.3, -0.5);
        box(g, 2.6, 1.1, 0.2, '#ff5a4f', 4.8, 5.3, -0.5);
        box(g, 0.2, 1.1, 2.6, '#ff5a4f', 4.8, 5.3, -0.5);
        cyl(g, 1.3, 0.3, '#3b2a6b', 4.8, 5.2, -0.5);
        return { w: 16, d: 10, cx: 0, label: 12 };
      },
      skills(g) {
        box(g, 16, 5, 10, '#f3a95b', 0, 0, 0);
        [-5.33, 0, 5.33].forEach((x) => put(g, geo.saw, lam('#d9822b'), 5.33, 2.2, 10, x, 5, 0));
        box(g, 16.3, 0.5, 10.3, '#b96a1c', 0, 4.6, 0);
        [-5.2, 0, 5.2].forEach((x) => {
          box(g, 3.8, 3.4, 0.25, '#3d4654', x, 0, 5.05);
          [0.7, 1.5, 2.3, 3.1].forEach((y) => box(g, 3.8, 0.12, 0.3, '#5c6779', x, y, 5.06, false));
        });
        // A gear above the doors.
        const gear = new Group();
        gear.position.set(0, 9.4, 3.4);
        put(gear, geo.torus, lam('#eef1f6'), 1.7, 1.7, 2.2, 0, 0, 0);
        for (let i = 0; i < 8; i += 1) {
          const tooth = put(gear, geo.box, lam('#eef1f6'), 0.85, 0.95, 0.62, 0, 0, 0);
          const a = (i / 8) * Math.PI * 2;
          tooth.position.set(Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0);
          tooth.rotation.z = a + Math.PI / 2;
        }
        const hub = put(gear, geo.cyl, lam('#b96a1c'), 0.7, 0.5, 0.7, 0, 0, 0);
        hub.rotation.x = Math.PI / 2;
        g.add(gear);
        box(g, 0.5, 2.4, 0.5, '#b96a1c', 0, 5, 3.4);
        return { w: 16, d: 10, cx: 0, label: 13 };
      },
      education(g, ox, oz) {
        box(g, 17, 5.5, 8, '#f0d9b0', 0, 0, -0.8);
        box(g, 17.4, 0.6, 8.4, '#c8553d', 0, 5.5, -0.8);
        box(g, 11, 0.5, 3.4, '#e6e0d4', 0, 0, 4.4, false);
        for (let i = 0; i < 6; i += 1) cyl(g, 0.42, 4.6, '#fbf8f1', -4.5 + i * 1.8, 0.5, 4.6);
        box(g, 11, 0.6, 3, '#fbf8f1', 0, 5.1, 4.4);
        prism(g, 11.4, 2.4, 3, '#fbf8f1', 0, 5.7, 4.4);
        // Clock tower with a spire.
        box(g, 3.4, 6.5, 3.4, '#f0d9b0', 0, 6.1, -1.2);
        pyramid(g, 4.2, 3.4, 4.2, '#2f8f6b', 0, 12.6, -1.2);
        const clock = put(g, geo.cyl, lam('#ffffff'), 1.05, 0.2, 1.05, 0, 10.6, 0.55);
        clock.rotation.x = Math.PI / 2;
        box(g, 0.16, 0.8, 0.1, '#22303f', 0, 10.6, 0.7, false);
        box(g, 0.6, 0.16, 0.1, '#22303f', 0.25, 10.5, 0.7, false);
        windowGrid('s', ox - 6.5, oz - 0.8, 4, 8, 1.2, 4.6, 2, 2, 1, 1.2);
        windowGrid('s', ox + 6.5, oz - 0.8, 4, 8, 1.2, 4.6, 2, 2, 1, 1.2);
        windowGrid('e', ox, oz - 0.8, 17, 8, 1.2, 4.6, 3, 2, 1, 1.2);
        windowGrid('w', ox, oz - 0.8, 17, 8, 1.2, 4.6, 3, 2, 1, 1.2);
        return { w: 17, d: 10.5, cx: 0, label: 17.5 };
      },
      contact(g, ox, oz) {
        box(g, 13, 5.2, 9, '#35a79c', 0, 0, 0);
        box(g, 13.4, 0.7, 9.4, '#f5f6fa', 0, 5.2, 0);
        // Striped awning.
        for (let i = 0; i < 9; i += 1) {
          const stripe = box(g, 1.2, 0.18, 2.4, i % 2 ? '#f5f6fa' : '#ef5350', -4.8 + i * 1.2, 3.3, 5.3);
          stripe.rotation.x = 0.42;
        }
        box(g, 2, 2.8, 0.25, '#1f6f68', 0, 0, 4.55);
        // Envelope sign on the roof.
        box(g, 5.4, 3.3, 0.5, '#fdfdfd', 0, 6.6, 2.4);
        const flapL = box(g, 3.25, 0.22, 0.2, '#ef5350', -1.32, 8.75, 2.7, false);
        flapL.rotation.z = -0.62;
        const flapR = box(g, 3.25, 0.22, 0.2, '#ef5350', 1.32, 8.75, 2.7, false);
        flapR.rotation.z = 0.62;
        box(g, 0.3, 0.9, 0.3, '#22303f', -2, 5.9, 2.4);
        box(g, 0.3, 0.9, 0.3, '#22303f', 2, 5.9, 2.4);
        // Pillar box out front.
        cyl(g, 0.62, 1.7, '#ef5350', 5.4, 0, 7);
        put(g, geo.dome, lam('#ef5350'), 0.62, 0.45, 0.62, 5.4, 1.7, 7);
        box(g, 0.7, 0.14, 0.1, '#22303f', 5.4, 1.25, 7.6, false);
        windowGrid('s', ox - 4.2, oz, 4, 9, 0.9, 2.9, 2, 1, 1.2, 1.5);
        windowGrid('s', ox + 4.2, oz, 4, 9, 0.9, 2.9, 2, 1, 1.2, 1.5);
        windowGrid('e', ox, oz, 13, 9, 1.2, 4, 3, 1, 1.2, 1.4);
        windowGrid('w', ox, oz, 13, 9, 1.2, 4, 3, 1, 1.2, 1.4);
        return { w: 13, d: 9, cx: 0, label: 11.5 };
      },
    };

    const ringTodo = track(new MeshBasicMaterial({ color: C.amber }));
    const ringDone = track(new MeshBasicMaterial({ color: C.done }));
    const discTodo = track(new MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.3, depthWrite: false }));
    const discDone = track(new MeshBasicMaterial({ color: C.done, transparent: true, opacity: 0.22, depthWrite: false }));
    const beaconMaterial = track(
      new MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide }),
    );
    const gemMaterial = track(new MeshLambertMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 0.55, flatShading: true }));

    const labelLayer = document.createElement('div');
    labelLayer.className = 'city-labels';
    labelLayer.setAttribute('aria-hidden', 'true');
    host.appendChild(labelLayer);

    const sites = STOPS.map((stop, index) => {
      const site = SITES[stop.id];
      const group = new Group();
      group.position.set(site.building.x, 0.15, site.building.z);
      world.add(group);
      const info = builders[stop.id](group, site.building.x, site.building.z);
      addRect(site.building.x + info.cx, site.building.z, info.w, info.d);
      box(world, info.w + 4, 0.2, info.d + 3.5, C.plaza, site.building.x + info.cx, 0, site.building.z + 0.5, false);
      // Driveway from the road to the ring.
      box(world, 7.5, 0.19, 10, C.drive, site.x, 0, site.roadZ - half - 4.6, false);

      const marker = new Group();
      marker.position.set(site.ring.x, 0.26, site.ring.z);
      const ring = new Mesh(geo.ring, ringTodo);
      const disc = new Mesh(geo.disc, discTodo);
      disc.position.y = -0.02;
      const beacon = new Mesh(geo.beacon, beaconMaterial);
      beacon.scale.y = 13;
      const gem = new Mesh(geo.gem, gemMaterial);
      gem.position.y = 4.2;
      gem.scale.set(1, 1.35, 1);
      marker.add(ring, disc, beacon, gem);
      world.add(marker);

      const label = document.createElement('div');
      label.className = 'city-label';
      label.dataset.stop = stop.id;
      const num = document.createElement('span');
      num.className = 'city-label__num';
      num.textContent = String(index + 1);
      const text = document.createElement('span');
      text.textContent = stop.name;
      label.append(num, text);
      label.addEventListener('click', () => emit('pick', stop.id));
      labelLayer.appendChild(label);

      return {
        id: stop.id,
        ring: site.ring,
        marker,
        ringMesh: ring,
        disc,
        beacon,
        gem,
        label,
        num,
        index,
        anchor: new Vector3(site.building.x + info.cx, info.label, site.building.z),
        visited: false,
        armed: true,
        shown: false,
      };
    });
    const siteById = Object.fromEntries(sites.map((site) => [site.id, site]));

    /* ---- Filler buildings ------------------------------------------- */
    const filler = (x, z, w, d, h) => {
      const hex = FILLER_COLORS[Math.floor(rand() * FILLER_COLORS.length)];
      box(world, w, h, d, hex, x, 0.15, z);
      box(world, w + 0.4, 0.35, d + 0.4, '#aab3c2', x, h + 0.15, z);
      if (rand() > 0.5) box(world, w * 0.35, 0.9, d * 0.35, '#9aa5b5', x + w * 0.15, h + 0.5, z - d * 0.1);
      const rows = Math.max(1, Math.round((h - 1.2) / 1.9));
      const cols = Math.max(2, Math.round(w / 2.2));
      windowGrid('s', x, z, w, d, 1.1, h - 0.3, cols, rows);
      windowGrid('e', x, z, w, d, 1.1, h - 0.3, Math.max(2, Math.round(d / 2.4)), rows);
      windowGrid('w', x, z, w, d, 1.1, h - 0.3, Math.max(2, Math.round(d / 2.4)), rows);
      addRect(x, z, w, d);
    };
    // Either side of every landmark, kept lower than the landmark itself.
    Object.values(SITES).forEach((site) => {
      [-1, 1].forEach((side) => {
        if (site.id === 'home' && side < 0) return; // the house has its garage there
        filler(site.x + side * 14.5, site.roadZ - 17 - rand() * 2, 5.5, 6 + rand() * 1.5, 3.6 + rand() * 3.2);
      });
    });
    // Low rows along the southern, western and eastern edges.
    [-50, -36, -22, -9, 12, 26, 40, 52].forEach((x) => filler(x, 44.5 + rand() * 1.5, 6 + rand() * 2, 5.5, 2.8 + rand() * 2));
    [-22, -8, 10, 24].forEach((z) => {
      filler(-55, z, 6, 6.5 + rand() * 2, 3.5 + rand() * 4);
      filler(55, z + 3, 6, 6.5 + rand() * 2, 3.5 + rand() * 4);
    });
    filler(-54, -48, 7, 7, 6);
    filler(54, -47, 7, 7, 5);

    // Pond in the bottom-right, away from the routes.
    put(world, geo.cyl, lam(C.water), 5.6, 0.12, 4.2, 0, 0.1, 45.2, false);
    put(world, geo.cyl, lam('#e7e2d8'), 6.1, 0.1, 4.7, 0, 0.06, 45.2, false);
    circles.push({ x: 0, z: 45.2, r: 4.4 });

    /* ---- Windows, lane dashes, trees, lamps (instanced) -------------- */
    const dummy = new Object3D();
    const instanced = (geometry, material, count, shadow) => {
      const mesh = track(new InstancedMesh(geometry, material, count));
      mesh.castShadow = Boolean(shadow);
      mesh.receiveShadow = Boolean(shadow);
      world.add(mesh);
      return mesh;
    };
    const place = (mesh, i, x, y, z, sx, sy, sz, ry = 0) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(sx, sy, sz);
      dummy.rotation.set(0, ry, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };

    const windowMaterial = track(new MeshBasicMaterial({ color: '#ffffff' }));
    const windowMesh = instanced(geo.box, windowMaterial, windows.length, false);
    windows.forEach((w, i) => place(windowMesh, i, w[0], w[1] + 0.15, w[2], w[3], w[4], w[5]));
    const windowSeeds = windows.map(() => rand());

    const dashes = [];
    ROAD_SEGMENTS.forEach(({ a, b }) => {
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      const along = a.z === b.z;
      for (let t = 7; t <= length - 7; t += 4) {
        dashes.push([a.x + ((b.x - a.x) / length) * t, a.z + ((b.z - a.z) / length) * t, along]);
      }
    });
    const dashMesh = instanced(geo.box, lam(C.dash), dashes.length, false);
    dashes.forEach((d, i) => place(dashMesh, i, d[0], 0.075, d[1], d[2] ? 1.8 : 0.28, 0.02, d[2] ? 0.28 : 1.8));

    const nearRoad = (x, z, margin) =>
      ROAD_SEGMENTS.some(({ a, b }) => {
        const minX = Math.min(a.x, b.x) - half - margin;
        const maxX = Math.max(a.x, b.x) + half + margin;
        const minZ = Math.min(a.z, b.z) - half - margin;
        const maxZ = Math.max(a.z, b.z) + half + margin;
        return x > minX && x < maxX && z > minZ && z < maxZ;
      });
    const blocked = (x, z, margin) =>
      nearRoad(x, z, margin) ||
      rects.some((r) => x > r.x0 - margin - 1 && x < r.x1 + margin + 1 && z > r.z0 - margin - 1 && z < r.z1 + margin + 4) ||
      circles.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + margin + 1) ||
      Object.values(SITES).some((s) => Math.abs(x - s.x) < 6 + margin && z < s.roadZ && z > s.roadZ - 16);

    const trees = [];
    const tryTree = (x, z, collide) => {
      if (blocked(x, z, 1.4)) return;
      const s = 0.8 + rand() * 0.7;
      trees.push([x, z, s, rand()]);
      if (collide) circles.push({ x, z, r: 0.55 });
    };
    for (let i = 0; i < 230; i += 1) {
      tryTree(BOUNDS.minX - 2 + rand() * (BOUNDS.maxX - BOUNDS.minX + 4), BOUNDS.minZ - 2 + rand() * (BOUNDS.maxZ - BOUNDS.minZ + 4), true);
    }
    // A thick belt of trees just outside the playable area marks the edge of town.
    for (let i = 0; i < 260; i += 1) {
      const a = rand() * Math.PI * 2;
      const r = 1 + rand() * 0.55;
      const x = Math.cos(a) * 74 * r;
      const z = -6 + Math.sin(a) * 70 * r;
      if (x > BOUNDS.minX - 3 && x < BOUNDS.maxX + 3 && z > BOUNDS.minZ - 3 && z < BOUNDS.maxZ + 3) continue;
      tryTree(x, z, false);
    }
    const trunkMesh = instanced(geo.cyl, lam(C.trunk), trees.length, true);
    const foliageMaterial = track(new MeshLambertMaterial({ color: '#ffffff', flatShading: true }));
    const foliageMesh = instanced(geo.foliage, foliageMaterial, trees.length, true);
    const tint = new Color();
    trees.forEach((t, i) => {
      place(trunkMesh, i, t[0], 0.9 * t[2], t[1], 0.22 * t[2], 1.8 * t[2], 0.22 * t[2]);
      place(foliageMesh, i, t[0], 2.9 * t[2], t[1], 1.55 * t[2], 1.9 * t[2], 1.55 * t[2], t[3] * 6);
      foliageMesh.setColorAt(i, tint.set(FOLIAGE_COLORS[Math.floor(t[3] * FOLIAGE_COLORS.length)]));
    });

    const lamps = [];
    INTERSECTIONS.forEach((n) => {
      [
        [-1, -1],
        [1, 1],
      ].forEach(([sx, sz]) => lamps.push([n.x + sx * (half + 1.1), n.z + sz * (half + 1.1)]));
    });
    const poleMesh = instanced(geo.cyl, lam(C.pole), lamps.length, true);
    const bulbMaterial = track(new MeshBasicMaterial({ color: THEMES.light.bulb }));
    const bulbMesh = instanced(geo.sphere, bulbMaterial, lamps.length, false);
    lamps.forEach((l, i) => {
      place(poleMesh, i, l[0], 2.2, l[1], 0.11, 4.4, 0.11);
      place(bulbMesh, i, l[0], 4.6, l[1], 0.42, 0.42, 0.42);
    });

    /* ---- The car ------------------------------------------------------ */
    const car = new Group();
    const carBody = new Group();
    car.add(carBody);
    box(carBody, 1.95, 0.6, 3.7, C.car, 0, 0.32, 0);
    box(carBody, 1.7, 0.62, 1.9, C.carDark, 0, 0.92, -0.3);
    box(carBody, 1.76, 0.14, 1.7, '#f5f6fa', 0, 1.54, -0.42);
    const windscreen = box(carBody, 1.6, 0.08, 0.75, '#9fd3ff', 0, 1.3, 0.78, false);
    windscreen.rotation.x = 0.55;
    box(carBody, 0.5, 0.04, 1.2, '#ffffff', 0, 0.92, 1.25, false);
    box(carBody, 2.02, 0.2, 0.3, '#f5f6fa', 0, 0.3, 1.82);
    box(carBody, 2.02, 0.2, 0.3, '#f5f6fa', 0, 0.3, -1.82);
    const headlightMaterial = track(new MeshBasicMaterial({ color: '#fff3c4' }));
    const tailMaterial = track(new MeshBasicMaterial({ color: '#b3261e' }));
    put(carBody, geo.box, headlightMaterial, 0.42, 0.22, 0.1, -0.62, 0.68, 1.86, false);
    put(carBody, geo.box, headlightMaterial, 0.42, 0.22, 0.1, 0.62, 0.68, 1.86, false);
    put(carBody, geo.box, tailMaterial, 0.42, 0.2, 0.1, -0.62, 0.68, -1.86, false);
    put(carBody, geo.box, tailMaterial, 0.42, 0.2, 0.1, 0.62, 0.68, -1.86, false);
    const wheels = [
      [-1, 1.18],
      [1, 1.18],
      [-1, -1.18],
      [1, -1.18],
    ].map(([sx, z]) => {
      const wheel = put(car, geo.cyl, lam(C.tyre), 0.44, 0.34, 0.44, sx * 0.98, 0.44, z);
      wheel.rotation.z = Math.PI / 2;
      return wheel;
    });
    const carLight = new PointLight('#ffe0a3', 0, 26, 1.6);
    carLight.position.set(0, 3.2, 2.5);
    car.add(carLight);
    car.position.y = 0.1;
    world.add(car);

    // Arrow on the ground that points to the nearest stop not yet visited.
    const arrowMaterial = track(new MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.95, depthWrite: false }));
    const arrow = new Mesh(geo.arrow, arrowMaterial);
    arrow.visible = false;
    arrow.renderOrder = 2;
    world.add(arrow);

    /* ---- Lights and theme ---------------------------------------------- */
    const hemi = new HemisphereLight('#ffffff', '#b7d9a8', 1.6);
    scene.add(hemi);
    const sun = new DirectionalLight('#fff0d2', 2.2);
    sun.position.set(48, 90, 62);
    sun.castShadow = true;
    const shadowSize = coarse ? 1024 : 2048;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    sun.shadow.camera.left = -92;
    sun.shadow.camera.right = 92;
    sun.shadow.camera.top = 92;
    sun.shadow.camera.bottom = -92;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 260;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.12;
    scene.add(sun);
    scene.add(sun.target);
    scene.fog = new Fog('#bfe4ff', 120, 300);

    const applyTheme = () => {
      const t = THEMES[currentTheme()];
      scene.background = new Color(t.sky);
      scene.fog.color.set(t.sky);
      hemi.color.set(t.hemiSky);
      hemi.groundColor.set(t.hemiGround);
      hemi.intensity = t.hemi;
      sun.color.set(t.sun);
      sun.intensity = t.sunPower;
      glassMaterial.color.set(t.glass);
      bulbMaterial.color.set(t.bulb);
      carLight.intensity = t.carLight;
      beaconMaterial.opacity = t.beacon;
      windowSeeds.forEach((seed, i) => {
        windowMesh.setColorAt(i, tint.set(t.windows[Math.floor(seed * t.windows.length)]));
      });
      if (windowMesh.instanceColor) windowMesh.instanceColor.needsUpdate = true;
    };
    applyTheme();

    /* ---- Game state ------------------------------------------------------ */
    const state = {
      x: START.x,
      z: START.z,
      heading: START.heading,
      speed: 0,
      paused: true,
      auto: null, // { id, path, index, time, checkAt, checkX, checkZ }
      padX: 0,
      padZ: 0,
      nearest: undefined,
    };
    const keys = new Set();
    const KEY_DIRS = {
      ArrowUp: [0, -1],
      KeyW: [0, -1],
      ArrowDown: [0, 1],
      KeyS: [0, 1],
      ArrowLeft: [-1, 0],
      KeyA: [-1, 0],
      ArrowRight: [1, 0],
      KeyD: [1, 0],
    };

    const stopAuto = (notify) => {
      if (!state.auto) return;
      state.auto = null;
      if (notify) emit('autoCancel');
    };
    const arrive = (site) => {
      state.auto = null;
      state.speed = 0;
      site.armed = false;
      emit('arrive', site.id);
    };

    const api = {
      driveTo(id) {
        const site = siteById[id];
        if (!site) return;
        if (Math.hypot(state.x - site.ring.x, state.z - site.ring.z) < RING_RADIUS * 0.8) {
          arrive(site);
          return;
        }
        const path = routeTo({ x: state.x, z: state.z }, id);
        state.auto = { id, path, index: 0, time: 0, checkAt: 2.5, checkX: state.x, checkZ: state.z };
      },
      cancelAuto() {
        stopAuto(false);
      },
      reset() {
        stopAuto(true);
        state.x = START.x;
        state.z = START.z;
        state.heading = START.heading;
        state.speed = 0;
        keys.clear();
        sites.forEach((site) => {
          site.armed = true;
        });
      },
      setPaused(value) {
        state.paused = Boolean(value);
        if (state.paused) {
          keys.clear();
          state.padX = 0;
          state.padZ = 0;
        }
      },
      setPad(x, z) {
        state.padX = x;
        state.padZ = z;
        if (state.auto && !state.paused && Math.hypot(x, z) > 0.2) stopAuto(true);
      },
      setVisited(ids) {
        sites.forEach((site) => {
          const visited = ids.includes(site.id);
          if (visited === site.visited) return;
          site.visited = visited;
          site.ringMesh.material = visited ? ringDone : ringTodo;
          site.disc.material = visited ? discDone : discTodo;
          site.beacon.visible = !visited;
          site.gem.visible = !visited;
          site.label.classList.toggle('is-visited', visited);
          site.num.textContent = visited ? '✓' : String(site.index + 1);
        });
        state.nearest = undefined; // recompute and re-announce
      },
    };
    if (apiRef) apiRef.current = api;

    /* ---- Simulation ------------------------------------------------------- */
    const steer = (wantX, wantZ, strength, maxSpeed, turnRate, dt) => {
      const want = Math.atan2(wantX, wantZ);
      const diff = wrapAngle(want - state.heading);
      state.heading = wrapAngle(state.heading + clamp(diff, -turnRate * dt, turnRate * dt));
      return maxSpeed * strength * (0.22 + 0.78 * Math.max(0, Math.cos(diff)));
    };

    const collide = () => {
      // Push the car out of anything it overlaps; pushes never trap it.
      rects.forEach((r) => {
        const x0 = r.x0 - CAR_RADIUS;
        const x1 = r.x1 + CAR_RADIUS;
        const z0 = r.z0 - CAR_RADIUS;
        const z1 = r.z1 + CAR_RADIUS;
        if (state.x <= x0 || state.x >= x1 || state.z <= z0 || state.z >= z1) return;
        const left = state.x - x0;
        const right = x1 - state.x;
        const up = state.z - z0;
        const down = z1 - state.z;
        const least = Math.min(left, right, up, down);
        if (least === left) state.x = x0;
        else if (least === right) state.x = x1;
        else if (least === up) state.z = z0;
        else state.z = z1;
        state.speed *= 0.86;
      });
      circles.forEach((c) => {
        const dx = state.x - c.x;
        const dz = state.z - c.z;
        const d = Math.hypot(dx, dz);
        const min = c.r + CAR_RADIUS * 0.8;
        if (d >= min) return;
        if (d < 0.001) {
          state.x += min;
          return;
        }
        state.x = c.x + (dx / d) * min;
        state.z = c.z + (dz / d) * min;
      });
      state.x = clamp(state.x, BOUNDS.minX, BOUNDS.maxX);
      state.z = clamp(state.z, BOUNDS.minZ, BOUNDS.maxZ);
    };

    const stepAuto = (dt) => {
      const auto = state.auto;
      const site = siteById[auto.id];
      auto.time += dt;
      // Watchdog: if the car makes no progress (or takes far too long), put it on the ring.
      if (auto.time >= auto.checkAt) {
        const moved = Math.hypot(state.x - auto.checkX, state.z - auto.checkZ);
        auto.checkAt = auto.time + 2.5;
        auto.checkX = state.x;
        auto.checkZ = state.z;
        if (moved < 1.5 || auto.time > 45) {
          state.x = site.ring.x;
          state.z = site.ring.z;
          state.heading = Math.PI;
          arrive(site);
          return 0;
        }
      }
      const last = auto.path.length - 1;
      let point = auto.path[auto.index];
      let dx = point.x - state.x;
      let dz = point.z - state.z;
      let d = Math.hypot(dx, dz);
      while (auto.index < last && d < 3.2) {
        auto.index += 1;
        point = auto.path[auto.index];
        dx = point.x - state.x;
        dz = point.z - state.z;
        d = Math.hypot(dx, dz);
      }
      if (auto.index === last && d < 0.9) {
        arrive(site);
        return 0;
      }
      let target = steer(dx, dz, 1, AUTO_SPEED, 6.5, dt);
      if (auto.index >= last - 1) target = Math.min(target, 4.5 + d * 1.3);
      return target;
    };

    const tmp = new Vector3();
    const camFocus = new Vector3(START.x - 6, 0, START.z);
    let camScale = 1;
    let camShiftX = 0; // world units; keeps the car clear of the stop list on wide screens
    let labelMinY = LABEL_MIN_Y;
    let viewW = 1;
    let viewH = 1;
    let time = 0;
    let statAt = 0;

    const update = (dt) => {
      time += dt;
      let target = 0;
      if (!state.paused) {
        if (state.auto) {
          target = stepAuto(dt);
        } else {
          let ix = state.padX;
          let iz = state.padZ;
          keys.forEach((code) => {
            ix += KEY_DIRS[code][0];
            iz += KEY_DIRS[code][1];
          });
          const mag = Math.hypot(ix, iz);
          if (mag > 0.15) target = steer(ix, iz, Math.min(1, mag), MAX_SPEED, TURN_RATE, dt);
        }
      }
      state.speed += clamp(target - state.speed, -BRAKE * dt, ACCEL * dt);
      if (state.paused) state.speed = 0;
      const travelled = state.speed * dt;
      state.x += Math.sin(state.heading) * travelled;
      state.z += Math.cos(state.heading) * travelled;
      collide();

      car.position.x = state.x;
      car.position.z = state.z;
      car.rotation.y = state.heading;
      carBody.position.y = Math.sin(time * 14) * 0.012 * Math.min(1, state.speed / 6);
      wheels.forEach((wheel) => {
        wheel.rotation.x += travelled / 0.44;
      });

      // Rings: trigger, re-arm, animate.
      let nearest = null;
      let nearestD = Infinity;
      sites.forEach((site, i) => {
        const d = Math.hypot(state.x - site.ring.x, state.z - site.ring.z);
        if (d > REARM_DISTANCE) site.armed = true;
        else if (d < RING_RADIUS && site.armed && !state.paused && !state.auto) arrive(site);
        if (!site.visited && d < nearestD) {
          nearest = site;
          nearestD = d;
        }
        const pulse = 1 + Math.sin(time * 3 + i) * 0.05;
        site.ringMesh.scale.setScalar(site.visited ? 1 : pulse);
        site.gem.position.y = 4.4 + Math.sin(time * 2.2 + i) * 0.45;
        site.gem.rotation.y = time * 1.4 + i;
      });
      const nearestId = nearest ? nearest.id : null;
      if (nearestId !== state.nearest) {
        state.nearest = nearestId;
        emit('nearest', nearestId);
      }

      // Guide arrow, in front of the car, pointing at the nearest unvisited ring.
      const guide = state.auto ? null : nearest;
      if (guide && nearestD > 8) {
        const dx = (guide.ring.x - state.x) / nearestD;
        const dz = (guide.ring.z - state.z) / nearestD;
        const reach = 5.2 + Math.sin(time * 4) * 0.5;
        arrow.visible = true;
        arrow.position.set(state.x + dx * reach, 0.5, state.z + dz * reach);
        arrow.rotation.y = Math.atan2(-dx, -dz);
      } else {
        arrow.visible = false;
      }

      // Fixed-angle follow camera: "up" on the keyboard is always "up" on screen.
      const k = 1 - Math.exp(-dt * 5);
      camFocus.x += (state.x + camShiftX - camFocus.x) * k;
      camFocus.z += (state.z - 5 - camFocus.z) * k;
      camera.position.set(camFocus.x, 50 * camScale, camFocus.z + 39 * camScale);
      camera.lookAt(camFocus.x, 0, camFocus.z);

      if (time >= statAt) {
        statAt = time + 0.15;
        host.dataset.carX = state.x.toFixed(2);
        host.dataset.carZ = state.z.toFixed(2);
        host.dataset.auto = state.auto ? state.auto.id : '';
      }
    };

    const placeLabels = () => {
      camera.updateMatrixWorld();
      sites.forEach((site) => {
        tmp.copy(site.anchor).project(camera);
        const rawY = (-tmp.y * 0.5 + 0.5) * viewH;
        // A label just above the HUD is nudged down below it; one far above is
        // hidden, so labels of distant buildings never pile up over a nearer one.
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.25 && tmp.y > -1.2 && rawY > labelMinY - 48;
        if (visible !== site.shown) {
          site.shown = visible;
          site.label.style.display = visible ? '' : 'none';
        }
        if (!visible) return;
        const x = (tmp.x * 0.5 + 0.5) * viewW;
        const y = Math.max(labelMinY, rawY);
        site.label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      });
    };

    /* ---- Loop control ------------------------------------------------------ */
    let raf = 0;
    let last = 0;
    let hasSize = false;
    let dead = false;
    let shown = false;

    const frame = (dt) => {
      // Fixed small steps keep collisions solid; up to 0.25 s of real time per
      // frame is simulated, so a slow device still moves at real speed.
      const steps = Math.max(1, Math.ceil(dt / 0.034));
      for (let i = 0; i < steps; i += 1) update(dt / steps);
      renderer.render(scene, camera);
      placeLabels();
      if (!shown) {
        shown = true;
        host.dataset.ready = 'true';
        canvas.classList.add('is-ready');
        emit('ready');
      }
    };
    // Slow device: render fewer pixels rather than drop to a slideshow.
    let slowTime = 0;
    let slowFrames = 0;
    const adapt = (rawDt) => {
      slowTime += rawDt;
      if (rawDt > 1 / 28) slowFrames += 1;
      if (slowTime < 2) return;
      if (slowFrames > 40 && pixelRatio > 0.75) {
        pixelRatio = Math.max(0.75, pixelRatio - 0.5);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(viewW, viewH, false);
      }
      slowTime = 0;
      slowFrames = 0;
    };
    const tick = (now) => {
      raf = 0;
      if (dead) return;
      const rawDt = (now - last) / 1000;
      const dt = Math.min(0.25, rawDt);
      last = now;
      adapt(rawDt);
      frame(dt);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = !dead && hasSize && !document.hidden;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      hasSize = w > 0 && h > 0;
      if (hasSize) {
        viewW = w;
        viewH = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Narrow (portrait) screens pull the camera back so a whole landmark stays in view.
        camScale = clamp(1.45 / camera.aspect, 1, 1.9);
        const wide = w > 820;
        camShiftX = wide && camera.aspect > 1.2 ? -6 : 0;
        labelMinY = wide ? LABEL_MIN_Y : LABEL_MIN_Y_SMALL;
        camera.updateProjectionMatrix();
        scene.fog.near = 110 * camScale;
        scene.fog.far = 290 * camScale;
      }
      sync();
    };

    const isTyping = (target) =>
      target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    const onKeyDown = (event) => {
      if (!KEY_DIRS[event.code] || event.metaKey || event.ctrlKey || event.altKey) return;
      if (state.paused || isTyping(event.target)) return;
      event.preventDefault();
      keys.add(event.code);
      stopAuto(true);
    };
    const onKeyUp = (event) => {
      keys.delete(event.code);
    };
    const onBlur = () => keys.clear();
    const onVisibility = () => {
      keys.clear();
      sync();
    };

    let teardown = () => {};
    const onContextLost = (event) => {
      event.preventDefault();
      teardown();
      emit('fail');
    };
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(applyTheme);

    teardown = () => {
      if (dead) return;
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      if (apiRef && apiRef.current === api) apiRef.current = null;
      disposables.forEach((item) => item.dispose());
      sun.shadow.dispose();
      renderer.dispose();
      try {
        renderer.forceContextLoss();
      } catch (e) {
        /* context already gone */
      }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (labelLayer.parentNode) labelLayer.parentNode.removeChild(labelLayer);
      delete host.dataset.ready;
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    resizeObserver.observe(host);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resize();

    return teardown;
  }, [apiRef]);

  return <div ref={hostRef} className="city-scene" />;
}
