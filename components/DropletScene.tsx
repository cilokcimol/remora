"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 14000;

const VERT = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aRand;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vHeight;
  varying float vAlpha;

  float easeOutCubic(float x) { return 1.0 - pow(1.0 - x, 3.0); }

  void main() {
    // staggered assembly: each particle has its own progress window
    float p = clamp(uProgress * 1.6 - aRand * 0.6, 0.0, 1.0);
    p = easeOutCubic(p);
    vec3 pos = mix(aStart, aEnd, p);

    // gentle floating drift
    float drift = sin(uTime * 0.6 + aRand * 6.2831) * 0.06;
    pos.y += drift * p;

    // mouse repel on the xy plane
    vec2 toP = pos.xy - uMouse;
    float dist = length(toP);
    float force = exp(-dist * dist * 0.55) * 1.4 * p;
    pos.xy += normalize(toP + vec2(0.0001)) * force;

    vHeight = clamp((aEnd.y / 3.4 + 0.5), 0.0, 1.0);
    vAlpha = p;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + aRand * 2.6) * (140.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  varying float vHeight;
  varying float vAlpha;
  uniform float uPixelRatio;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);

    // Sui blue gradient: deep navy at bottom, bright blue at top
    vec3 deep = vec3(0.04, 0.15, 0.35);
    vec3 mid  = vec3(0.16, 0.55, 1.00);
    vec3 top  = vec3(0.55, 0.78, 1.00);
    vec3 col = mix(deep, mid, smoothstep(0.0, 0.55, vHeight));
    col = mix(col, top, smoothstep(0.55, 1.0, vHeight));

    gl_FragColor = vec4(col, soft * 0.85 * vAlpha);
  }
`;

function dropletPoint(): [number, number, number] {
  // random point in unit sphere, then morphed into a teardrop
  let x = 0, y = 0, z = 0;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
  } while (x * x + y * y + z * z > 1);
  const t = (y + 1) / 2; // 0 bottom -> 1 top
  const pinch = 1 - 0.88 * smoothstep(0.05, 1.0, t); // pointed tip
  const bulge = 1 + 0.18 * smoothstep(0.0, 1.0, -y); // rounder base
  const R = 2.3;
  return [x * pinch * bulge * R, y * 1.45 * R, z * pinch * bulge * R];
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function DropletScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.4, 11);

    const start = new Float32Array(COUNT * 3);
    const end = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 7 + Math.random() * 5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      start[i * 3] = r * Math.sin(ph) * Math.cos(th);
      start[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      start[i * 3 + 2] = r * Math.cos(ph);
      const [dx, dy, dz] = dropletPoint();
      end[i * 3] = dx;
      end[i * 3 + 1] = dy;
      end[i * 3 + 2] = dz;
      rand[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(end.slice(), 3));
    geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(999, 999) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const mouse = new THREE.Vector2(999, 999);
    const onMouse = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // convert to world units on the z=0 plane (approx for fov 45, dist 11)
      mouse.set(nx * 8.6 * (rect.width / rect.height > 1 ? rect.width / rect.height : 1) * 0.62, ny * 5.3);
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const assembleDur = 2.8;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const u = mat.uniforms;
      u.uTime.value = t;
      if (!reduced) {
        u.uProgress.value = Math.min(1, t / assembleDur);
        points.rotation.y = t * 0.12;
        points.position.y = Math.sin(t * 0.5) * 0.15;
      } else {
        u.uProgress.value = 1;
      }
      // ease mouse toward target
      (u.uMouse.value as THREE.Vector2).lerp(mouse, 0.08);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
