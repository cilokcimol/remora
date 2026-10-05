"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DUST_COUNT = 2600;
const ORBIT_COUNT = 500;

// Camera journey keyframes across full-page scroll (p = 0..1)
const KEYS = [
  { p: 0.0, pos: [0, 0.5, 13] as const, look: [0, 0.3, 0] as const },
  { p: 0.16, pos: [0, 0.35, 8.5] as const, look: [0, 0.2, 0] as const },
  { p: 0.3, pos: [0, 0.1, 3.5] as const, look: [0, 0, -6] as const },
  { p: 0.44, pos: [0.6, -0.6, -3.5] as const, look: [0, -0.6, -12] as const },
  { p: 0.6, pos: [-1.2, -0.9, -9.5] as const, look: [0.6, 0, -18] as const },
  { p: 0.78, pos: [0, -0.2, -13.5] as const, look: [0, 0.8, -22] as const },
  { p: 1.0, pos: [0, 1.0, -11] as const, look: [0, 1.4, -22] as const },
];

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function sampleJourney(p: number) {
  const c = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < KEYS.length - 2 && c > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth((c - a.p) / Math.max(1e-5, b.p - a.p));
  const lerp = (u: number, v: number) => u + (v - u) * t;
  return {
    pos: [lerp(a.pos[0], b.pos[0]), lerp(a.pos[1], b.pos[1]), lerp(a.pos[2], b.pos[2])],
    look: [lerp(a.look[0], b.look[0]), lerp(a.look[1], b.look[1]), lerp(a.look[2], b.look[2])],
  };
}

const DUST_VERT = /* glsl */ `
  attribute float aRand;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uWarp;
  uniform vec2 uMouse;
  varying float vDepth;
  void main() {
    vec3 pos = position;
    float span = 44.0;
    pos.y = mod(pos.y + uTime * aSpeed * (1.0 + uWarp * 5.0) + span * 0.5, span) - span * 0.5;
    pos.x += sin(uTime * 0.22 + aRand * 6.2831) * 0.4;
    pos.x += uMouse.x * (0.5 + aRand * 1.1);
    pos.y += uMouse.y * (0.3 + aRand * 0.6);
    vDepth = aRand;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // stretch vertically during warp dive for a speed sensation
    float stretch = 1.0 + uWarp * 7.0 * aRand;
    gl_PointSize = (0.6 + aRand * 1.2) * (130.0 / -mv.z) * mix(1.0, stretch, 0.35);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float soft = smoothstep(0.5, 0.06, length(uv));
    vec3 col = mix(vec3(0.08, 0.22, 0.55), vec3(0.45, 0.72, 1.0), vDepth);
    gl_FragColor = vec4(col, soft * (0.12 + vDepth * 0.38));
  }
`;

const ORBIT_VERT = /* glsl */ `
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aRand;
  uniform float uTime;
  varying float vRand;
  void main() {
    float ang = aAngle + uTime * aSpeed;
    vec3 pos = vec3(cos(ang) * aRadius, sin(ang * 0.7) * 0.9 - 1.1, sin(ang) * aRadius);
    pos = vec3(pos.x, pos.y * 0.45 - pos.z * 0.35, pos.y * 0.35 + pos.z * 0.9);
    vRand = aRand;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.5 + aRand * 1.1) * (140.0 / -mv.z);
  }
`;

const ORBIT_FRAG = /* glsl */ `
  varying float vRand;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, length(uv));
    vec3 col = mix(vec3(0.16, 0.55, 1.0), vec3(0.75, 0.9, 1.0), vRand);
    gl_FragColor = vec4(col, soft * 0.55);
  }
`;

const CORE_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 pos = position;
    float w = sin(uTime * 1.4 + pos.y * 4.0) * 0.04
            + sin(uTime * 0.9 + pos.x * 5.0 + pos.z * 3.0) * 0.03;
    pos += normal * w;
    vNormal = normalMatrix * normal;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uLight;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    float sheen = pow(max(dot(N, normalize(vec3(0.35, 0.85, 0.6))), 0.0), 2.5);
    vec3 col = uDeep + uMid * 0.32 + uLight * (sheen * 0.55 + fres * 1.6);
    gl_FragColor = vec4(col, 0.92);
  }
`;

function makeGlowTexture(inner: string, mid: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.45, mid);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function buildFormation(scale: number, coreColor: number) {
  const group = new THREE.Group();
  const lattice = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.4 * scale, 1)),
    new THREE.LineBasicMaterial({
      color: 0x4da3ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(lattice);
  const outer = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(4.6 * scale, 1)),
    new THREE.LineBasicMaterial({
      color: 0x1c5fc4,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(outer);
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: CORE_VERT,
    fragmentShader: CORE_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x061a44) },
      uMid: { value: new THREE.Color(coreColor) },
      uLight: { value: new THREE.Color(0xbfe0ff) },
    },
    transparent: true,
    depthWrite: false,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0 * scale, 4), coreMat);
  group.add(core);
  const glowTex = makeGlowTexture("rgba(70,140,240,0.6)", "rgba(47,141,255,0.22)");
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(6.5 * scale, 6.5 * scale, 1);
  group.add(glow);
  return { group, lattice, outer, core, coreMat, glow, glowTex, baseGlow: 6.5 * scale };
}

export default function JourneyScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040b1c, 0.038);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 160);
    camera.position.set(0, 0.5, 13);

    // ---- deep particle volume (spans the whole journey) ----
    const dustGeo = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(DUST_COUNT * 3);
      const rand = new Float32Array(DUST_COUNT);
      const speed = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        pos[i * 3] = (Math.random() * 2 - 1) * 20;
        pos[i * 3 + 1] = (Math.random() * 2 - 1) * 22;
        pos[i * 3 + 2] = 14 - Math.random() * 44; // z from +14 to -30
        rand[i] = Math.random();
        speed[i] = 0.1 + Math.random() * 0.35;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dustGeo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
      dustGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    }
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uWarp: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    // ---- formation A (hero, z=0) ----
    const fa = buildFormation(1, 0x2f8dff);
    fa.group.position.set(0, 0.4, 0);
    scene.add(fa.group);

    // ---- formation B (finale, z=-22): smaller, violet, distant destination ----
    const fb = buildFormation(0.55, 0x7a5cff);
    fb.group.position.set(0, 1.5, -22);
    scene.add(fb.group);

    // ---- orbit ring around formation A ----
    const orbitGeo = new THREE.BufferGeometry();
    {
      const angle = new Float32Array(ORBIT_COUNT);
      const radius = new Float32Array(ORBIT_COUNT);
      const speed = new Float32Array(ORBIT_COUNT);
      const rand = new Float32Array(ORBIT_COUNT);
      for (let i = 0; i < ORBIT_COUNT; i++) {
        angle[i] = Math.random() * Math.PI * 2;
        radius[i] = 6.8 + Math.random() * 1.1;
        speed[i] = (0.08 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1);
        rand[i] = Math.random();
      }
      orbitGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ORBIT_COUNT * 3), 3));
      orbitGeo.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
      orbitGeo.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
      orbitGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
      orbitGeo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    }
    const orbitMat = new THREE.ShaderMaterial({
      vertexShader: ORBIT_VERT,
      fragmentShader: ORBIT_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const orbit = new THREE.Points(orbitGeo, orbitMat);
    orbit.position.set(0, 0.4, 0);
    scene.add(orbit);

    // ---- nebula washes ----
    const nebTex = makeGlowTexture("rgba(30,90,220,0.4)", "rgba(20,50,140,0.16)");
    const neb1 = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: nebTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    neb1.scale.set(50, 50, 1);
    neb1.position.set(0, 2, -16);
    scene.add(neb1);
    const neb2 = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: nebTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })
    );
    neb2.scale.set(40, 40, 1);
    neb2.position.set(-12, -6, -24);
    scene.add(neb2);

    // ---- interaction ----
    const mouseT = new THREE.Vector2(0, 0);
    const mouseC = new THREE.Vector2(0, 0);
    const onMouse = (e: MouseEvent) => {
      mouseT.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("mousemove", onMouse);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      mouseC.lerp(mouseT, 0.045);

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const j = sampleJourney(p);
      // warp factor peaks while diving through the lattice
      const warp = Math.max(0, 1 - Math.abs(p - 0.36) / 0.14);

      dustMat.uniforms.uTime.value = t;
      dustMat.uniforms.uWarp.value = reduced ? 0 : warp;
      dustMat.uniforms.uMouse.value.copy(mouseC);
      orbitMat.uniforms.uTime.value = t;
      fa.coreMat.uniforms.uTime.value = t;
      fb.coreMat.uniforms.uTime.value = t;

      if (!reduced) {
        fa.lattice.rotation.y = t * 0.12;
        fa.lattice.rotation.x = Math.sin(t * 0.1) * 0.25;
        fa.outer.rotation.y = -t * 0.07;
        fb.lattice.rotation.y = -t * 0.1;
        fb.outer.rotation.z = t * 0.06;
        const pulse = 1 + Math.sin(t * 1.6) * 0.07;
        fa.core.scale.setScalar(pulse);
        fa.glow.scale.set(fa.baseGlow * pulse, fa.baseGlow * pulse, 1);
        fb.core.scale.setScalar(1 + Math.sin(t * 1.3 + 2) * 0.08);
        orbit.rotation.y = Math.sin(t * 0.05) * 0.2;
      }

      // smooth-scroll camera: heavy lerp = cinematic glide
      const k = 0.055;
      camera.position.x += (j.pos[0] + mouseC.x * 1.4 - camera.position.x) * k;
      camera.position.y += (j.pos[1] + mouseC.y * 0.7 - camera.position.y) * k;
      camera.position.z += (j.pos[2] - camera.position.z) * k;
      camera.lookAt(j.look[0] + mouseC.x * 0.6, j.look[1] + mouseC.y * 0.3, j.look[2]);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      nebTex.dispose();
      fa.glowTex.dispose();
      fb.glowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0" aria-hidden="true" />;
}
