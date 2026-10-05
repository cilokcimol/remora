"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DUST_COUNT = 15000;

const DUST_VERT = /* glsl */ `
  attribute float aRand;
  attribute float aSpeed;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vDepth;
  void main() {
    vec3 pos = position;
    // slow upward drift, wrapped
    pos.y = mod(pos.y + uTime * aSpeed + 14.0, 28.0) - 14.0;
    pos.x += sin(uTime * 0.25 + aRand * 6.2831) * 0.35;
    // gentle mouse parallax on the field
    pos.x += uMouse.x * (0.4 + aRand * 0.9);
    pos.y += uMouse.y * (0.25 + aRand * 0.5);
    vDepth = aRand;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.1 + aRand * 2.4) * (120.0 / -mv.z);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, length(uv));
    vec3 col = mix(vec3(0.10, 0.28, 0.62), vec3(0.45, 0.70, 1.0), vDepth);
    gl_FragColor = vec4(col, soft * (0.25 + vDepth * 0.55));
  }
`;

const DROP_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vT;
  void main() {
    vec3 pos = position;
    float t = clamp(pos.y / 2.4 + 0.5, 0.0, 1.0);
    // teardrop: pinch the top into a tip, stretch vertically
    float pinch = 1.0 - 0.78 * smoothstep(0.12, 1.0, t);
    pos.x *= pinch;
    pos.z *= pinch;
    pos.y *= 1.38;
    // liquid wobble
    float w = sin(uTime * 1.1 + pos.y * 2.6) * 0.035
            + sin(uTime * 0.6 + pos.x * 3.4 + pos.z * 2.0) * 0.025;
    pos += normal * w;
    vT = t;
    vNormal = normalMatrix * normal;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const DROP_FRAG = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uLight;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vT;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
    vec3 col = mix(uDeep, uMid, smoothstep(0.0, 0.6, vT));
    col = mix(col, uLight, smoothstep(0.6, 1.0, vT));
    // top-light sheen
    float sheen = pow(max(dot(N, normalize(vec3(0.4, 0.9, 0.6))), 0.0), 3.0);
    col += uLight * sheen * 0.55;
    col += uLight * fres * 1.1;
    float alpha = 0.32 + fres * 0.68;
    gl_FragColor = vec4(col, alpha);
  }
`;

const RAY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RAY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;
  void main() {
    float x = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
    float y = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float flicker = 0.75 + 0.25 * sin(uTime * 0.5 + uSeed * 6.28);
    vec3 col = vec3(0.20, 0.52, 1.0);
    gl_FragColor = vec4(col, x * y * 0.16 * flicker);
  }
`;

export default function AbyssScene() {
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
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060f22, 0.055);
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 0.6, 12);

    // ---- dust field ----
    const dustGeo = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(DUST_COUNT * 3);
      const rand = new Float32Array(DUST_COUNT);
      const speed = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        pos[i * 3] = (Math.random() * 2 - 1) * 16;
        pos[i * 3 + 1] = (Math.random() * 2 - 1) * 14;
        pos[i * 3 + 2] = (Math.random() * 2 - 1) * 10 - 2;
        rand[i] = Math.random();
        speed[i] = 0.12 + Math.random() * 0.4;
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
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ---- droplet core ----
    const dropGeo = new THREE.IcosahedronGeometry(2.4, 5);
    const dropMat = new THREE.ShaderMaterial({
      vertexShader: DROP_VERT,
      fragmentShader: DROP_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x0a2a5e) },
        uMid: { value: new THREE.Color(0x298dff) },
        uLight: { value: new THREE.Color(0x9ec7ff) },
      },
      transparent: true,
      depthWrite: false,
    });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(0, 0.5, 0);
    scene.add(drop);

    // inner glow sprite behind droplet
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    const g = glowCanvas.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(41,141,255,0.55)");
    grad.addColorStop(0.5, "rgba(41,141,255,0.18)");
    grad.addColorStop(1, "rgba(41,141,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.set(14, 14, 1);
    glow.position.copy(drop.position);
    scene.add(glow);

    // ---- light rays ----
    const rays: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(1.6 + Math.random() * 1.6, 22);
      const mat = new THREE.ShaderMaterial({
        vertexShader: RAY_VERT,
        fragmentShader: RAY_FRAG,
        uniforms: { uTime: { value: 0 }, uSeed: { value: Math.random() } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      const ang = (i / 5) * Math.PI * 2 + 0.4;
      m.position.set(Math.cos(ang) * 6.5, 2, Math.sin(ang) * 4 - 3);
      m.rotation.z = 0.22 + (Math.random() - 0.5) * 0.2;
      m.rotation.y = -ang;
      scene.add(m);
      rays.push(m);
    }

    // ---- interaction ----
    const mouseT = new THREE.Vector2(0, 0);
    const mouseC = new THREE.Vector2(0, 0);
    const onMouse = (e: MouseEvent) => {
      mouseT.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
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
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      mouseC.lerp(mouseT, 0.045);

      dustMat.uniforms.uTime.value = t;
      dustMat.uniforms.uMouse.value.copy(mouseC);
      dropMat.uniforms.uTime.value = t;
      rays.forEach((r) => {
        (r.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      });

      if (!reduced) {
        drop.rotation.y = t * 0.18;
        drop.position.y = 0.5 + Math.sin(t * 0.6) * 0.22;
        glow.position.y = drop.position.y;
        const pulse = 1 + Math.sin(t * 0.8) * 0.04;
        glow.scale.set(14 * pulse, 14 * pulse, 1);
      }

      // scroll-driven camera dolly (hero only)
      const heroH = mount.clientHeight || 1;
      const sp = Math.min(1, Math.max(0, window.scrollY / heroH));
      camera.position.x += (mouseC.x * 1.4 - camera.position.x) * 0.05;
      camera.position.y += (0.6 + mouseC.y * 0.7 - sp * 2.2 - camera.position.y) * 0.05;
      camera.position.z += (12 - sp * 3.2 - camera.position.z) * 0.05;
      camera.lookAt(0, 0.4 - sp * 1.2, 0);

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
        const mat = (mesh as THREE.Mesh).material as THREE.Material;
        if (mat) mat.dispose();
      });
      glowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
