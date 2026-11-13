'use client';

import { useEffect, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';

/* ---- Graph layout ------------------------------------------------- */
const CORE_RADIUS = 0.55;
const AGENT_RADIUS = 0.22;
const TOOL_RADIUS = 0.07;
const ORBIT_RADIUS = 2.1;
const TOOL_DISTANCE = 0.6;
const GRAPH_EXTENT = 3.05; // half-size the camera must fit

// Three tilted orbits: [tilt around X, tilt around Z, angular speed]
const ORBITS = [
  [0.42, 0.18, 0.11],
  [-0.5, -0.62, -0.09],
  [1.12, 0.3, 0.075],
];
// Five sub-agents: [orbit index, start angle, tool count] (12 tools in total)
const AGENTS = [
  [0, 0.35, 3],
  [0, 3.5, 2],
  [1, 1.5, 3],
  [1, 4.55, 2],
  [2, 2.6, 2],
];
const AGENT_ORDER = [0, 2, 4, 1, 3];

/* ---- Delegation timeline (seconds) -------------------------------- */
const INTERVAL = 2.4;
const T_OUT = 0.5; // core -> agent
const T_FAN = 0.3; // agent -> tools
const T_FLASH = 0.45; // tools flash
const T_BACK = 0.5; // agent -> core, success colour
const T_HOLD = 0.35; // keep the last log row lit
const MAX_ACTIVE = 2;
// The brief asked for ~0.35, but --border-strong at 35% disappears on white.
const EDGE_OPACITY = 0.8;
const BASE_TILT_X = 0.28;
const BASE_TILT_Y = -0.2;
const POOL_SIZE = 8;

const FALLBACK = {
  '--primary': '#1a73e8',
  '--accent': '#8430ce',
  '--subtle': '#80868b',
  '--success': '#188038',
  '--border-strong': '#bdc1c6',
};

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

function readPalette() {
  const style = getComputedStyle(document.documentElement);
  const out = {};
  Object.keys(FALLBACK).forEach((name) => {
    const color = new Color(FALLBACK[name]);
    const raw = style.getPropertyValue(name).trim();
    // Only hex / rgb() values are handed to three; anything else keeps the fallback.
    if (/^(#[0-9a-f]{3,8}|rgb\([\d\s,.%]+\))$/i.test(raw)) color.set(raw.slice(0, raw[0] === '#' && raw.length > 7 ? 7 : undefined));
    out[name] = color;
  });
  return out;
}

// Unlit materials have no shading, so bake a little per-face tone into vertex
// colours: the solids read as faceted without any lights.
function bakeFacets(geometry, base) {
  const normals = geometry.getAttribute('normal');
  let attr = geometry.getAttribute('color');
  if (!attr) {
    attr = new BufferAttribute(new Float32Array(normals.count * 3), 3);
    geometry.setAttribute('color', attr);
  }
  const lx = 0.35;
  const ly = 0.8;
  const lz = 0.48;
  for (let i = 0; i < normals.count; i += 1) {
    const d = normals.getX(i) * lx + normals.getY(i) * ly + normals.getZ(i) * lz;
    const k = 0.7 + 0.3 * d; // 0.4 .. 1.0
    attr.setXYZ(i, base.r * k, base.g * k, base.b * k);
  }
  attr.needsUpdate = true;
}

export default function AgentScene({ onStep }) {
  const hostRef = useRef(null);
  const onStepRef = useRef(onStep);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const canvas = document.createElement('canvas');
    canvas.className = 'agent-scene__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.tabIndex = -1;

    // Probe for a context ourselves so a failure stays silent.
    let gl = null;
    try {
      gl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (e) {
      gl = null;
    }
    if (!gl) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
    } catch (e) {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(canvas);

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const disposables = [];
    const track = (item) => {
      disposables.push(item);
      return item;
    };

    /* ---- Scene ---------------------------------------------------- */
    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 50);
    const tilt = new Group(); // pointer tilt
    const graph = new Group(); // slow Y rotation
    tilt.add(graph);
    scene.add(tilt);

    // Orchestrator
    const coreGeometry = track(new IcosahedronGeometry(CORE_RADIUS, 1));
    const coreMaterial = track(new MeshBasicMaterial({ vertexColors: true }));
    const core = new Mesh(coreGeometry, coreMaterial);
    graph.add(core);

    const shellSource = new IcosahedronGeometry(CORE_RADIUS * 1.25, 1);
    const shellGeometry = track(new WireframeGeometry(shellSource));
    shellSource.dispose();
    const shellMaterial = track(new LineBasicMaterial({ transparent: true, opacity: 0.55 }));
    const shell = new LineSegments(shellGeometry, shellMaterial);
    graph.add(shell);

    // Orbit rings
    const ringMaterial = track(new LineBasicMaterial({ transparent: true, opacity: 0.45 }));
    const ringPoints = new Float32Array(96 * 3);
    for (let i = 0; i < 96; i += 1) {
      const a = (i / 96) * Math.PI * 2;
      ringPoints[i * 3] = Math.cos(a) * ORBIT_RADIUS;
      ringPoints[i * 3 + 2] = Math.sin(a) * ORBIT_RADIUS;
    }
    const ringGeometry = track(new BufferGeometry());
    ringGeometry.setAttribute('position', new BufferAttribute(ringPoints, 3));
    const orbits = ORBITS.map(([rx, rz, speed]) => {
      const ring = new LineLoop(ringGeometry, ringMaterial);
      ring.rotation.set(rx, 0, rz);
      ring.updateMatrix();
      graph.add(ring);
      const u = new Vector3(1, 0, 0).applyEuler(ring.rotation);
      const v = new Vector3(0, 0, 1).applyEuler(ring.rotation);
      const n = new Vector3(0, 1, 0).applyEuler(ring.rotation);
      return { u, v, n, speed };
    });

    // Sub-agents and their tools
    const agentGeometry = track(new OctahedronGeometry(AGENT_RADIUS, 0));
    const agentMaterial = track(new MeshBasicMaterial({ vertexColors: true }));
    const toolGeometry = track(new SphereGeometry(TOOL_RADIUS, 14, 10));
    const tools = [];
    const agents = AGENTS.map(([orbitIndex, angle, toolCount], index) => {
      const mesh = new Mesh(agentGeometry, agentMaterial);
      graph.add(mesh);
      const toolMaterial = track(new MeshBasicMaterial());
      const agent = {
        mesh,
        orbit: orbits[orbitIndex],
        angle,
        toolMaterial,
        flash: 0,
        bump: 0,
        tools: [],
        spin: 0.4 + index * 0.13,
      };
      for (let k = 0; k < toolCount; k += 1) {
        const tool = new Mesh(toolGeometry, toolMaterial);
        graph.add(tool);
        const entry = { mesh: tool, phase: (k / toolCount) * Math.PI * 2 + index * 1.1 };
        agent.tools.push(entry);
        tools.push(entry);
      }
      return agent;
    });

    // Edges: core -> agent and agent -> tool, one dynamic buffer
    const edgeCount = agents.length + tools.length;
    const edgePositions = new Float32Array(edgeCount * 6);
    const edgeGeometry = track(new BufferGeometry());
    const edgeAttribute = new BufferAttribute(edgePositions, 3);
    edgeGeometry.setAttribute('position', edgeAttribute);
    const edgeMaterial = track(new LineBasicMaterial({ transparent: true, opacity: EDGE_OPACITY }));
    const edges = new LineSegments(edgeGeometry, edgeMaterial);
    edges.frustumCulled = false;
    graph.add(edges);

    // Pulse pool
    const pulseGeometry = track(new SphereGeometry(0.075, 12, 8));
    const pulseOutMaterial = track(new MeshBasicMaterial());
    const pulseBackMaterial = track(new MeshBasicMaterial());
    const pool = [];
    for (let i = 0; i < POOL_SIZE; i += 1) {
      const pulse = new Mesh(pulseGeometry, pulseOutMaterial);
      pulse.visible = false;
      graph.add(pulse);
      pool.push(pulse);
    }

    /* ---- Colours -------------------------------------------------- */
    let palette = readPalette();
    const applyPalette = () => {
      palette = readPalette();
      bakeFacets(coreGeometry, palette['--primary']);
      bakeFacets(agentGeometry, palette['--accent']);
      shellMaterial.color.copy(palette['--primary']);
      ringMaterial.color.copy(palette['--border-strong']);
      edgeMaterial.color.copy(palette['--border-strong']);
      pulseOutMaterial.color.copy(palette['--primary']);
      pulseBackMaterial.color.copy(palette['--success']);
      agents.forEach((agent) => agent.toolMaterial.color.copy(palette['--subtle']));
    };
    applyPalette();

    /* ---- Layout of moving parts ----------------------------------- */
    const tmpOut = new Vector3();
    const tmpTan = new Vector3();
    const tmpDir = new Vector3();
    const SPREAD = 0.8;
    const layout = () => {
      let e = 0;
      agents.forEach((agent) => {
        const { u, v, n } = agent.orbit;
        const c = Math.cos(agent.angle);
        const s = Math.sin(agent.angle);
        const p = agent.mesh.position;
        p.set(u.x * c + v.x * s, u.y * c + v.y * s, u.z * c + v.z * s);
        tmpOut.copy(p);
        tmpTan.set(v.x * c - u.x * s, v.y * c - u.y * s, v.z * c - u.z * s);
        p.multiplyScalar(ORBIT_RADIUS);

        edgePositions[e] = tmpOut.x * CORE_RADIUS * 1.25;
        edgePositions[e + 1] = tmpOut.y * CORE_RADIUS * 1.25;
        edgePositions[e + 2] = tmpOut.z * CORE_RADIUS * 1.25;
        edgePositions[e + 3] = p.x;
        edgePositions[e + 4] = p.y;
        edgePositions[e + 5] = p.z;
        e += 6;

        agent.tools.forEach((tool) => {
          const cp = Math.cos(tool.phase);
          const sp = Math.sin(tool.phase);
          tmpDir
            .copy(tmpOut)
            .multiplyScalar(Math.cos(SPREAD))
            .addScaledVector(tmpTan, cp * Math.sin(SPREAD))
            .addScaledVector(n, sp * Math.sin(SPREAD));
          tool.mesh.position.copy(p).addScaledVector(tmpDir, TOOL_DISTANCE);
          edgePositions[e] = p.x;
          edgePositions[e + 1] = p.y;
          edgePositions[e + 2] = p.z;
          edgePositions[e + 3] = tool.mesh.position.x;
          edgePositions[e + 4] = tool.mesh.position.y;
          edgePositions[e + 5] = tool.mesh.position.z;
          e += 6;
        });
      });
      edgeAttribute.needsUpdate = true;
    };

    /* ---- Delegations ---------------------------------------------- */
    const delegations = [];
    let sinceLast = INTERVAL - 0.7; // first delegation shortly after mount
    let turn = 0;
    let corePulse = 1; // 0..1 progress of the core's scale bump, 1 = idle
    let lastStep = -1;
    const emitStep = (index) => {
      if (index === lastStep) return;
      lastStep = index;
      const cb = onStepRef.current;
      if (typeof cb === 'function') cb(index);
    };
    const takePulse = (material) => {
      const pulse = pool.find((item) => !item.visible);
      if (!pulse) return null;
      pulse.material = material;
      pulse.visible = true;
      pulse.scale.setScalar(1);
      return pulse;
    };
    const release = (pulse) => {
      if (pulse) pulse.visible = false;
    };
    const origin = new Vector3();

    const startDelegation = () => {
      const agent = agents[AGENT_ORDER[turn % AGENT_ORDER.length]];
      turn += 1;
      delegations.push({ agent, t: 0, stage: -1, out: null, fan: [], back: null });
      corePulse = 0;
    };

    const stepDelegation = (d, dt) => {
      d.t += dt;
      const { agent } = d;
      const a = agent.mesh.position;
      const tFan = T_OUT;
      const tFlash = tFan + T_FAN;
      const tBack = tFlash + T_FLASH;
      const tEnd = tBack + T_BACK;

      if (d.stage < 0) {
        d.stage = 0;
        d.out = takePulse(pulseOutMaterial);
        emitStep(0);
      }
      if (d.stage === 0) {
        if (d.out) d.out.position.lerpVectors(origin, a, easeInOut(clamp01(d.t / T_OUT)));
        if (d.t >= tFan) {
          d.stage = 1;
          release(d.out);
          d.out = null;
          agent.bump = 1;
          d.fan = agent.tools.map(() => takePulse(pulseOutMaterial));
          emitStep(1);
        }
      }
      if (d.stage === 1) {
        const k = easeInOut(clamp01((d.t - tFan) / T_FAN));
        d.fan.forEach((pulse, i) => {
          if (!pulse) return;
          pulse.position.lerpVectors(a, agent.tools[i].mesh.position, k);
          pulse.scale.setScalar(0.7);
        });
        if (d.t >= tFlash) {
          d.stage = 2;
          d.fan.forEach(release);
          d.fan = [];
          agent.flash = 1;
          emitStep(2);
        }
      }
      if (d.stage === 2 && d.t >= tBack) {
        d.stage = 3;
        d.back = takePulse(pulseBackMaterial);
        emitStep(3);
      }
      if (d.stage === 3) {
        if (d.back) d.back.position.lerpVectors(a, origin, easeInOut(clamp01((d.t - tBack) / T_BACK)));
        if (d.t >= tEnd) {
          d.stage = 4;
          release(d.back);
          d.back = null;
        }
      }
      return d.t >= tEnd + T_HOLD;
    };

    /* ---- Frame ---------------------------------------------------- */
    const pointer = { x: 0, y: 0 };
    const renderFrame = () => renderer.render(scene, camera);

    const update = (dt) => {
      graph.rotation.y += dt * 0.05;
      core.rotation.y += dt * 0.25;
      core.rotation.x += dt * 0.11;
      shell.rotation.y -= dt * 0.18;
      shell.rotation.z -= dt * 0.07;

      agents.forEach((agent) => {
        agent.angle += agent.orbit.speed * dt;
        agent.mesh.rotation.y += dt * agent.spin;
        agent.mesh.rotation.x += dt * agent.spin * 0.6;
        agent.bump = Math.max(0, agent.bump - dt * 2.2);
        agent.mesh.scale.setScalar(1 + 0.35 * agent.bump);
        if (agent.flash > 0 || agent.flashDirty) {
          agent.flash = Math.max(0, agent.flash - dt / (T_FLASH + 0.35));
          agent.toolMaterial.color.lerpColors(palette['--subtle'], palette['--primary'], agent.flash);
          agent.flashDirty = agent.flash > 0;
          const s = 1 + 0.7 * agent.flash;
          agent.tools.forEach((tool) => tool.mesh.scale.setScalar(s));
        }
      });
      layout();

      sinceLast += dt;
      if (sinceLast >= INTERVAL && delegations.length < MAX_ACTIVE) {
        sinceLast = 0;
        startDelegation();
      }
      for (let i = delegations.length - 1; i >= 0; i -= 1) {
        if (stepDelegation(delegations[i], dt)) {
          delegations.splice(i, 1);
          if (!delegations.length) emitStep(-1);
        }
      }

      if (corePulse < 1) {
        corePulse = Math.min(1, corePulse + dt / 0.5);
        const s = 1 + 0.12 * Math.sin(corePulse * Math.PI);
        core.scale.setScalar(s);
        shell.scale.setScalar(s);
      }

      // Damped pointer tilt, at most 0.15 rad
      const k = 1 - Math.exp(-dt * 3);
      tilt.rotation.x += (BASE_TILT_X + pointer.y * 0.15 - tilt.rotation.x) * k;
      tilt.rotation.y += (BASE_TILT_Y + pointer.x * 0.15 - tilt.rotation.y) * k;
    };

    /* ---- Loop control --------------------------------------------- */
    let raf = 0;
    let last = 0;
    let inView = false;
    let hasSize = false;
    let dead = false;
    let shown = false;

    const reveal = () => {
      if (shown) return;
      shown = true;
      canvas.classList.add('is-ready');
    };
    const tick = (now) => {
      raf = 0;
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      renderFrame();
      reveal();
      raf = requestAnimationFrame(tick);
    };
    const shouldRun = () => !dead && inView && hasSize && !document.hidden && !reducedQuery.matches;
    const sync = () => {
      if (shouldRun()) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    // Single frame for reduced motion, theme changes and resizes while paused.
    const drawStill = () => {
      if (dead || !hasSize || raf) return;
      renderFrame();
      reveal();
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      hasSize = w > 0 && h > 0;
      if (!hasSize) {
        sync();
        return;
      }
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const half = Math.tan((camera.fov * Math.PI) / 360);
      camera.position.set(0, 0, Math.max(GRAPH_EXTENT / half, GRAPH_EXTENT / (half * camera.aspect)));
      camera.updateProjectionMatrix();
      sync();
      drawStill();
    };

    const onPointer = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onVisibility = () => sync();
    const onReducedChange = () => {
      if (reducedQuery.matches) {
        delegations.splice(0).forEach((d) => {
          release(d.out);
          release(d.back);
          d.fan.forEach(release);
        });
        emitStep(-1);
      }
      sync();
      drawStill();
    };

    let teardown = () => {};
    const onContextLost = (event) => {
      event.preventDefault();
      teardown();
    };

    const resizeObserver = new ResizeObserver(resize);
    const viewObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: '0px' },
    );
    const themeObserver = new MutationObserver(() => {
      applyPalette();
      drawStill();
    });

    teardown = () => {
      if (dead) return;
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      resizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedQuery.removeEventListener('change', onReducedChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      emitStep(-1);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      try {
        renderer.forceContextLoss();
      } catch (e) {
        /* context already gone */
      }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };

    layout();
    tilt.rotation.set(BASE_TILT_X, BASE_TILT_Y, 0); // pleasant resting pose, also the static frame
    canvas.addEventListener('webglcontextlost', onContextLost);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reducedQuery.addEventListener('change', onReducedChange);
    resizeObserver.observe(host);
    viewObserver.observe(host);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resize();

    return teardown;
  }, []);

  return <div ref={hostRef} className="agent-scene" aria-hidden="true" />;
}
