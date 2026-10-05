"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DUST_COUNT = 4000;
const ORBIT_COUNT = 500;

const DUST_VERT = /* glsl */ `
  attribute float aRand;
  attribute float aSpeed;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vDepth;
  void main() {
    vec3 pos = position;
    pos.y = mod(pos.y + uTime * aSpeed + 16.0, 32.0) - 16.0;
    pos.x += sin(uTime * 0.22 + aRand * 6.2831) * 0.4;
    pos.x += uMouse.x * (0.5 + aRand * 1.1);
    pos.y += uMouse.y * (0.3 + aRand * 0.6);
    vDepth = aRand;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aRand * 2.2) * (130.0 / -mv.z);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (length(uv) > 0.5) discard;
    float soft = smoothstep(0.5, 0.06, length(uv));
    vec3 col = mix(vec3(0.08, 0.22, 0.55), vec3(0.45, 0.72, 1.0), vDepth);
    gl_FragColor = vec4(col, soft * (0.2 + vDepth * 0.5));
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
    // tilt the whole ring
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
    vec3 col = uDeep + uMid * 0.55 + uLight * (sheen * 0.7 + fres * 1.25);
    gl_FragColor = vec4(col, 0.9);
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

export default function HeroScene() {
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
    scene.fog = new THREE.FogExp2(0x040b1c, 0.05);
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      140
    );
    camera.position.set(0, 0.5, 13);

    const rig = new THREE.Group();
    scene.add(rig);

    // ---- nebula backdrop ----
    const nebulaTex = makeGlowTexture(
      "rgba(30,90,220,0.5)",
      "rgba(20,50,140,0.22)"
    );
    const nebula = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: nebulaTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    nebula.scale.set(46, 46, 1);
    nebula.position.set(0, 1, -14);
    scene.add(nebula);

    const nebula2Tex = makeGlowTexture(
      "rgba(90,40,200,0.28)",
      "rgba(60,30,140,0.12)"
    );
    const nebula2 = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: nebula2Tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    nebula2.scale.set(34, 34, 1);
    nebula2.position.set(-13, -5, -10);
    scene.add(nebula2);

    // ---- ambient dust ----
    const dustGeo = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(DUST_COUNT * 3);
      const rand = new Float32Array(DUST_COUNT);
      const speed = new Float32Array(DUST_COUNT);
      for (let i = 0; i < DUST_COUNT; i++) {
        pos[i * 3] = (Math.random() * 2 - 1) * 18;
        pos[i * 3 + 1] = (Math.random() * 2 - 1) * 16;
        pos[i * 3 + 2] = (Math.random() * 2 - 1) * 11 - 2;
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
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    // ---- memory lattice (wireframe icosahedron) ----
    const latticeGeo = new THREE.WireframeGeometry(
      new THREE.IcosahedronGeometry(3.4, 1)
    );
    const latticeMat = new THREE.LineBasicMaterial({
      color: 0x4da3ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lattice = new THREE.LineSegments(latticeGeo, latticeMat);
    rig.add(lattice);

    const lattice2 = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(4.6, 1)),
      new THREE.LineBasicMaterial({
        color: 0x1c5fc4,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    rig.add(lattice2);

    // ---- glowing core ----
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x061a44) },
        uMid: { value: new THREE.Color(0x2f8dff) },
        uLight: { value: new THREE.Color(0xbfe0ff) },
      },
      transparent: true,
      depthWrite: false,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 4), coreMat);
    rig.add(core);

    const coreGlowTex = makeGlowTexture(
      "rgba(80,160,255,0.85)",
      "rgba(47,141,255,0.3)"
    );
    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreGlowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    coreGlow.scale.set(9, 9, 1);
    rig.add(coreGlow);

    // ---- orbiting data ring ----
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
    rig.add(orbit);

    rig.position.y = 0.4;

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
      orbitMat.uniforms.uTime.value = t;
      coreMat.uniforms.uTime.value = t;

      if (!reduced) {
        lattice.rotation.y = t * 0.12;
        lattice.rotation.x = Math.sin(t * 0.1) * 0.25;
        lattice2.rotation.y = -t * 0.07;
        lattice2.rotation.z = t * 0.05;
        const pulse = 1 + Math.sin(t * 1.6) * 0.07;
        core.scale.setScalar(pulse);
        coreGlow.scale.set(9 * pulse, 9 * pulse, 1);
        rig.rotation.y = mouseC.x * 0.18;
        rig.rotation.x = -mouseC.y * 0.12;
        nebula.position.x = mouseC.x * -1.5;
      }

      // scroll-driven cinematic dolly
      const heroH = mount.clientHeight || 1;
      const sp = Math.min(1, Math.max(0, window.scrollY / heroH));
      camera.position.x += (mouseC.x * 1.6 - camera.position.x) * 0.05;
      camera.position.y += (0.5 + mouseC.y * 0.8 - sp * 2.6 - camera.position.y) * 0.05;
      camera.position.z += (13 - sp * 4 - camera.position.z) * 0.05;
      camera.lookAt(0, 0.3 - sp * 1.4, 0);
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
      nebulaTex.dispose();
      nebula2Tex.dispose();
      coreGlowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
