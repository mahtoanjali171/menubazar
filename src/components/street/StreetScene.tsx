import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { RESTAURANTS, type Restaurant } from "@/lib/restaurants";

const HOME_CAM = new THREE.Vector3(0, 7.5, 17);
const HOME_TARGET = new THREE.Vector3(0, 1.6, -2);
const BUILDING_Z = -3;

type Props = {
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
  onArrive: (r: Restaurant) => void;
};

export default function StreetScene(props: Props) {
  const [ready, setReady] = useState(false);
  return (
    <div className="absolute inset-0" data-scene-ready={ready ? "true" : undefined}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: HOME_CAM.toArray(), fov: 42, near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          requestAnimationFrame(() => setReady(true));
        }}
      >
        <World {...props} />
      </Canvas>
    </div>
  );
}

function World({ selected, onSelect, onArrive }: Props) {
  const fonts = useFontsReady();
  return (
    <>
      <color attach="background" args={["#2b1a2e"]} />
      <fog attach="fog" args={["#3a2236", 22, 55]} />
      <Sky />
      <hemisphereLight args={["#ffb27a", "#2a1a2a", 0.55]} />
      <directionalLight
        position={[-12, 9, 8]}
        intensity={1.4}
        color="#ff9a5a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={12}
        shadow-camera-bottom={-8}
      />
      <Environment resolution={64}>
        <Lightformer intensity={1.2} color="#ffb070" position={[0, 6, 4]} scale={[14, 6, 1]} />
        <Lightformer intensity={0.6} color="#6a5aa0" position={[-6, 2, -6]} rotation-y={Math.PI / 4} scale={[20, 2, 1]} />
      </Environment>

      <Ground />
      {RESTAURANTS.map((r) => (
        <Building key={r.slug} r={r} active={selected?.slug === r.slug} onSelect={onSelect} fontsReady={fonts} />
      ))}
      {[-11.5, -3.75, 3.75, 11.5].map((x) => (
        <StreetLight key={x} x={x} />
      ))}
      <StringLights />
      {[-10, -5, 2.5, 5, 10.5].map((x, i) => (
        <Plant key={x} x={x} z={-0.6} seed={i} />
      ))}
      <Rickshaw />
      <Sparkles count={60} scale={[26, 6, 10]} position={[0, 3, 0]} size={2.5} speed={0.3} color="#ffd59a" />
      <ContactShadows position={[0, 0.011, 0]} opacity={0.4} scale={40} blur={2.5} far={6} />
      <CameraRig selected={selected} onArrive={onArrive} />
    </>
  );
}

function useFontsReady() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all([document.fonts.load("64px 'Yatra One'"), document.fonts.ready]).finally(() => setOk(true));
  }, []);
  return ok;
}

/* ---------- camera ---------- */
const HOME_DIR = HOME_CAM.clone().sub(HOME_TARGET).normalize();
// Distance needed so `halfWidth` world units fit horizontally on screen.
function fitDistance(halfWidth: number, fovDeg: number, aspect: number) {
  return halfWidth / (Math.tan((fovDeg * Math.PI) / 360) * Math.min(aspect, 1.8));
}

function CameraRig({ selected, onArrive }: { selected: Restaurant | null; onArrive: (r: Restaurant) => void }) {
  const { camera, controls, size, scene } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: { target: THREE.Vector3; update: () => void; enabled: boolean } | null;
    size: { width: number; height: number };
    scene: THREE.Scene;
  };
  const aspect = size.width / size.height;
  const portrait = aspect < 1;
  const fov = portrait ? 58 : 42;
  const homeDist = Math.max(HOME_CAM.distanceTo(HOME_TARGET), fitDistance(13, fov, aspect));
  const homePos = useMemo(() => HOME_TARGET.clone().addScaledVector(HOME_DIR, homeDist), [homeDist]);
  const focusDist = Math.max(8, fitDistance(3.4, fov, aspect));

  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; r: Restaurant | null } | null>(null);
  const first = useRef(true);

  // Fit the whole street on any screen size (phones included).
  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = homeDist + 6;
      scene.fog.far = homeDist + 40;
    }
    if (!selected && !anim.current && controls) {
      camera.position.copy(homePos);
      controls.target.copy(HOME_TARGET);
      controls.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fov, homeDist, controls]);

  useEffect(() => {
    if (!controls) return;
    if (first.current && !selected) { first.current = false; return; }
    first.current = false;
    const toP = selected ? new THREE.Vector3(selected.x, 2.6, BUILDING_Z + focusDist) : homePos.clone();
    const toT = selected ? new THREE.Vector3(selected.x, 2.4, BUILDING_Z) : HOME_TARGET.clone();
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT, r: selected };
    controls.enabled = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, controls, camera]);

  useFrame((_, delta) => {
    const a = anim.current;
    if (!a || !controls) return;
    a.t = Math.min(1, a.t + Math.min(delta, 0.05) / 1.4);
    const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2;
    camera.position.lerpVectors(a.fromP, a.toP, e);
    controls.target.lerpVectors(a.fromT, a.toT, e);
    controls.update();
    if (a.t >= 1) {
      anim.current = null;
      controls.enabled = true;
      if (a.r) onArrive(a.r);
    }
  });

  return (
    <OrbitControls
      makeDefault
      target={HOME_TARGET.toArray()}
      enablePan
      screenSpacePanning
      enableDamping
      minDistance={4}
      maxDistance={homeDist + 8}
      minPolarAngle={0.35}
      maxPolarAngle={1.42}
      minAzimuthAngle={-0.9}
      maxAzimuthAngle={0.9}
    />
  );
}

/* ---------- environment ---------- */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.15,0.0,1.0);
          vec3 low = vec3(1.0,0.55,0.3); vec3 mid = vec3(0.62,0.27,0.42); vec3 top = vec3(0.13,0.1,0.25);
          vec3 c = mix(low, mid, smoothstep(0.0,0.45,h)); c = mix(c, top, smoothstep(0.45,1.0,h));
          gl_FragColor = vec4(c,1.0);}`,
      }),
    [],
  );
  return (
    <mesh material={mat}>
      <sphereGeometry args={[90, 32, 16]} />
    </mesh>
  );
}

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

function Ground() {
  const road = useMemo(
    () =>
      canvasTex(512, 256, (c) => {
        c.fillStyle = "#3b3437";
        c.fillRect(0, 0, 512, 256);
        for (let i = 0; i < 2500; i++) {
          c.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 220 : 0},200,${Math.random() * 0.06})`;
          c.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
        }
        c.fillStyle = "#e8c070";
        for (let x = 0; x < 512; x += 64) c.fillRect(x + 8, 122, 34, 8);
      }, [4, 1]),
    [],
  );
  const tiles = useMemo(
    () =>
      canvasTex(256, 256, (c) => {
        c.fillStyle = "#b9876a";
        c.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 4; y++)
          for (let x = 0; x < 4; x++) {
            c.fillStyle = `hsl(${18 + Math.random() * 8},${30 + Math.random() * 10}%,${50 + Math.random() * 8}%)`;
            c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
          }
      }, [20, 2]),
    [],
  );
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.02, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#4a3a3a" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 3]}>
        <planeGeometry args={[60, 6]} />
        <meshStandardMaterial map={road} roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, 0.1, -1]}>
        <boxGeometry args={[60, 0.2, 2.2]} />
        <meshStandardMaterial map={tiles} roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[0, 0.1, 6.8]}>
        <boxGeometry args={[60, 0.2, 1.6]} />
        <meshStandardMaterial map={tiles} roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ---------- buildings ---------- */
type Style = { wall: string; trim: string; accent: string; signBg: string; signFg: string; glow: string };
const STYLES: Record<Restaurant["slug"], Style> = {
  "chhotu-dhaba": { wall: "#e2b04a", trim: "#7a3b1f", accent: "#2f6e5a", signBg: "#c0392b", signFg: "#ffe9a8", glow: "#ffb347" },
  "hub-360": { wall: "#e9dcc9", trim: "#2f4a5e", accent: "#d4673a", signBg: "#1f3446", signFg: "#ffd27a", glow: "#ffd27a" },
  "dragon-delight": { wall: "#9c2a26", trim: "#2a1a14", accent: "#e0a83a", signBg: "#2a120f", signFg: "#ffcf5a", glow: "#ff6a3a" },
};

function useWallTex(color: string) {
  return useMemo(
    () =>
      canvasTex(256, 256, (c) => {
        c.fillStyle = color;
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1800; i++) {
          c.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 40},${Math.random() > 0.5 ? 240 : 20},${Math.random() > 0.5 ? 200 : 10},${Math.random() * 0.07})`;
          const s = 2 + Math.random() * 6;
          c.fillRect(Math.random() * 256, Math.random() * 256, s, s);
        }
        c.fillStyle = "rgba(0,0,0,0.12)";
        c.fillRect(0, 230, 256, 26);
      }),
    [color],
  );
}

function Building({ r, active, onSelect, fontsReady }: { r: Restaurant; active: boolean; onSelect: (r: Restaurant) => void; fontsReady: boolean }) {
  const s = STYLES[r.slug];
  const [hover, setHover] = useState(false);
  const wallTex = useWallTex(s.wall);
  const signTex = useMemo(
    () =>
      canvasTex(1024, 256, (c) => {
        c.fillStyle = s.signBg;
        c.fillRect(0, 0, 1024, 256);
        c.strokeStyle = s.signFg;
        c.lineWidth = 10;
        c.strokeRect(14, 14, 996, 228);
        c.fillStyle = s.signFg;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `128px ${fontsReady ? "'Yatra One', serif" : "serif"}`;
        c.fillText(r.name, 512, 140);
      }),
    [r.name, s, fontsReady],
  );

  const windowMat = useRef<THREE.MeshStandardMaterial>(null);
  const signMat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const bulbs = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    const on = active ? 1 : hover ? 0.55 : 0;
    const t = state.clock.elapsedTime;
    const flick = 0.92 + Math.sin(t * 13 + r.x) * 0.04 + Math.sin(t * 7.3) * 0.04;
    if (windowMat.current) windowMat.current.emissiveIntensity += ((0.7 + on * 2.2) * flick - windowMat.current.emissiveIntensity) * k;
    if (signMat.current) signMat.current.emissiveIntensity += (0.35 + on * 1.6 - signMat.current.emissiveIntensity) * k;
    if (light.current) light.current.intensity += (2 + on * 22 - light.current.intensity) * k;
    if (bulbs.current) bulbs.current.emissiveIntensity += (0.4 + on * 4 * flick - bulbs.current.emissiveIntensity) * k;
  });

  const W = 5.6;
  const H = r.slug === "hub-360" ? 4.6 : r.slug === "dragon-delight" ? 4 : 3.4;
  const cursor = (v: boolean) => {
    setHover(v);
    document.body.style.cursor = v ? "pointer" : "";
  };

  return (
    <group
      position={[r.x, 0.2, BUILDING_Z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(r);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        cursor(true);
      }}
      onPointerOut={() => cursor(false)}
    >
      {/* body */}
      <mesh castShadow receiveShadow position={[0, H / 2, -1.2]}>
        <boxGeometry args={[W, H, 3]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>
      {/* plinth */}
      <mesh castShadow position={[0, 0.12, -1.2]}>
        <boxGeometry args={[W + 0.2, 0.24, 3.2]} />
        <meshStandardMaterial color={s.trim} roughness={0.8} />
      </mesh>
      {/* windows + door */}
      <mesh position={[0, 1.15, 0.31]}>
        <boxGeometry args={[1.1, 1.9, 0.05]} />
        <meshStandardMaterial ref={windowMat} color="#3a2010" emissive={s.glow} emissiveIntensity={0.7} />
      </mesh>
      {[-1.8, 1.8].map((x) => (
        <group key={x} position={[x, 1.35, 0.31]}>
          <mesh>
            <boxGeometry args={[1.3, 1.1, 0.05]} />
            <meshStandardMaterial color="#3a2010" emissive={s.glow} emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[1.42, 0.08, 0.06]} />
            <meshStandardMaterial color={s.trim} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.08, 1.18, 0.06]} />
            <meshStandardMaterial color={s.trim} />
          </mesh>
        </group>
      ))}
      {/* upper windows / jharokha */}
      {H > 3.5 &&
        [-1.6, 0, 1.6].map((x) => (
          <group key={x} position={[x, H - 1.1, 0.31]}>
            <mesh>
              <boxGeometry args={[0.8, 0.9, 0.05]} />
              <meshStandardMaterial color="#2a1810" emissive={s.glow} emissiveIntensity={0.5} />
            </mesh>
            <mesh castShadow position={[0, -0.5, 0.15]}>
              <boxGeometry args={[1, 0.1, 0.35]} />
              <meshStandardMaterial color={s.trim} />
            </mesh>
            {r.slug !== "hub-360" && (
              <mesh castShadow position={[0, 0.55, 0.12]} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.45, 0.45, 0.12, 16, 1, false, -Math.PI / 2, Math.PI]} />
                <meshStandardMaterial color={s.accent} />
              </mesh>
            )}
          </group>
        ))}
      {/* awning */}
      <mesh castShadow position={[0, 2.55, 0.85]} rotation-x={0.45}>
        <boxGeometry args={[W - 0.2, 0.06, 1.3]} />
        <meshStandardMaterial color={s.accent} roughness={0.7} />
      </mesh>
      {/* awning bulbs */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-2.4 + i * 0.6, 2.22, 1.42]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial ref={i === 0 ? bulbs : null} color="#fff2c8" emissive="#ffcc66" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* signboard */}
      <group position={[0, 3.05, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[4.7, 1.25, 0.12]} />
          <meshStandardMaterial color={s.trim} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[4.5, 1.1]} />
          <meshStandardMaterial ref={signMat} map={signTex} emissiveMap={signTex} emissive="#ffffff" emissiveIntensity={0.35} />
        </mesh>
      </group>
      <Roof slug={r.slug} W={W} H={H} s={s} />
      <pointLight ref={light} position={[0, 2.2, 2.2]} color={s.glow} intensity={2} distance={9} decay={1.6} />
    </group>
  );
}

function Roof({ slug, W, H, s }: { slug: Restaurant["slug"]; W: number; H: number; s: Style }) {
  if (slug === "chhotu-dhaba")
    return (
      <group position={[0, H, -1.2]}>
        <mesh castShadow position={[0, 0.35, 0]} rotation-z={0}>
          <cylinderGeometry args={[0.01, 2.4, 0.9, 4, 1]} />
          <meshStandardMaterial color="#8a8f8a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[1.9, 0.6, -0.6]}>
          <cylinderGeometry args={[0.35, 0.35, 0.8, 12]} />
          <meshStandardMaterial color="#2a5d8a" />
        </mesh>
      </group>
    );
  if (slug === "hub-360")
    return (
      <group position={[0, H, -1.2]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[W + 0.3, 0.2, 3.3]} />
          <meshStandardMaterial color={s.trim} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 1.1, 32]} />
          <meshStandardMaterial color={s.wall} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.95, 0.06, 8, 40]} />
          <meshStandardMaterial color={s.signFg} emissive={s.signFg} emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[1.05, 0.4, 32]} />
          <meshStandardMaterial color={s.accent} />
        </mesh>
      </group>
    );
  return (
    <group position={[0, H, -1.2]}>
      {[0, 1].map((i) => (
        <group key={i} position={[0, 0.2 + i * 0.9, 0]} scale={1 - i * 0.35}>
          <mesh castShadow>
            <cylinderGeometry args={[2.6, 3.9, 0.55, 4, 1]} />
            <meshStandardMaterial color={s.trim} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.6, 0.5, 1.6]} />
            <meshStandardMaterial color={s.wall} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.1, 0]}>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial color={s.accent} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-2.4, 2.4].map((x) => (
        <Lantern key={x} x={x} y={-0.6} z={1.6} />
      ))}
    </group>
  );
}

function Lantern({ x, y, z }: { x: number; y: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.z = Math.sin(st.clock.elapsedTime * 1.6 + x) * 0.12;
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshStandardMaterial color="#ff3a20" emissive="#ff4a1a" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.25]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

/* ---------- props ---------- */
function StreetLight({ x }: { x: number }) {
  const light = useRef<THREE.PointLight>(null);
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const f = x === 3.75 && Math.sin(t * 3.1) > 0.97 ? 0.3 : 1 + Math.sin(t * 20 + x) * 0.03;
    if (light.current) light.current.intensity = 9 * f;
    if (bulb.current) bulb.current.emissiveIntensity = 3 * f;
  });
  return (
    <group position={[x, 0.2, 0]}>
      <mesh castShadow position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 3.4, 8]} />
        <meshStandardMaterial color="#2a2522" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.35, 0.3]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.035, 0.035, 0.6, 6]} />
        <meshStandardMaterial color="#2a2522" />
      </mesh>
      <mesh position={[0, 3.25, 0.6]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial ref={bulb} color="#fff1c8" emissive="#ffc46b" emissiveIntensity={3} />
      </mesh>
      <pointLight ref={light} position={[0, 3.0, 0.7]} color="#ffbe6b" intensity={9} distance={8} decay={1.5} />
    </group>
  );
}

function StringLights() {
  const group = useRef<THREE.Group>(null);
  const bulbs = useMemo(() => {
    const out: { p: [number, number, number]; c: string }[] = [];
    const cols = ["#ffcf6b", "#ff7a5a", "#7ad8ff", "#a8ff8a", "#ffcf6b"];
    for (let i = 0; i <= 60; i++) {
      const x = -12 + (i / 60) * 24;
      const seg = ((x + 12) % 8) / 8;
      const y = 4.6 - Math.sin(seg * Math.PI) * 0.6;
      out.push({ p: [x, y, 1.6], c: cols[i % cols.length]! });
    }
    return out;
  }, []);
  useFrame((st) => {
    if (group.current) group.current.rotation.x = Math.sin(st.clock.elapsedTime * 0.8) * 0.02;
  });
  return (
    <group ref={group}>
      {bulbs.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

function Plant({ x, z, seed }: { x: number; z: number; seed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.z = Math.sin(st.clock.elapsedTime * 1.2 + seed) * 0.04;
  });
  return (
    <group position={[x, 0.2, z]}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.25, 0.18, 0.45, 12]} />
        <meshStandardMaterial color="#a8532e" roughness={0.9} />
      </mesh>
      <group ref={ref} position={[0, 0.45, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} castShadow position={[Math.cos(i * 1.3) * 0.15, 0.3 + (i % 3) * 0.18, Math.sin(i * 1.3) * 0.15]}>
            <icosahedronGeometry args={[0.26 - (i % 3) * 0.03, 0]} />
            <meshStandardMaterial color={i % 2 ? "#3f7d3a" : "#5a9a42"} roughness={0.8} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Rickshaw() {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (!ref.current) return;
    const t = (st.clock.elapsedTime * 0.12) % 1;
    ref.current.position.x = -26 + t * 52;
    ref.current.position.y = 0.02 + Math.abs(Math.sin(st.clock.elapsedTime * 8)) * 0.02;
  });
  return (
    <group ref={ref} position={[0, 0, 4.2]}>
      <mesh castShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[1.6, 0.7, 0.9]} />
        <meshStandardMaterial color="#2f7a3e" />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.95]} />
        <meshStandardMaterial color="#e5c040" />
      </mesh>
      <mesh position={[0.8, 0.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#fff3c0" emissiveIntensity={3} />
      </mesh>
      {([[-0.55, 0.42], [-0.55, -0.42], [0.65, 0]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.16, 0.06, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}
