import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ParticleIntro from "./ParticleIntro.jsx";
import "./SplashScreen.css";

const INTRO_DURATION = 5250;
const EXIT_DURATION = 620;

function SplashAircraftFallback() {
  return (
    <group position={[0.05, 0.12, 0]} rotation={[0.08, -0.26, 0]} scale={0.9}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.105, 2.6, 5, 12]} />
        <meshStandardMaterial color="#f5fbff" metalness={0.28} roughness={0.3} />
      </mesh>
      <mesh position={[-0.05, 0.05, 0]}>
        <boxGeometry args={[0.55, 0.055, 2.55]} />
        <meshStandardMaterial color="#e8f5ff" metalness={0.22} roughness={0.34} />
      </mesh>
      <mesh position={[-1.15, 0.09, 0]}>
        <boxGeometry args={[0.42, 0.045, 0.9]} />
        <meshStandardMaterial color="#dceeff" metalness={0.18} roughness={0.36} />
      </mesh>
      <mesh position={[1.55, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.48, 16]} />
        <meshStandardMaterial color="#f8fcff" metalness={0.25} roughness={0.28} />
      </mesh>
      <mesh position={[-1.45, 0.18, 0]}>
        <boxGeometry args={[0.16, 0.32, 0.075]} />
        <meshStandardMaterial color="#e8f5ff" metalness={0.22} roughness={0.34} />
      </mesh>
    </group>
  );
}

class SplashAssetBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Splash aircraft failed to load; showing the safe fallback.", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("splash");
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const formingPlaneRef = useRef(false);
  const frameRef = useRef(0);
  const timeoutRef = useRef(0);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelAnimationFrame(frameRef.current);
    window.clearTimeout(timeoutRef.current);
    setProgress(100);
    setPhase("exiting");
    timeoutRef.current = window.setTimeout(() => {
      onComplete?.();
    }, EXIT_DURATION);
  }, [onComplete]);

  useEffect(() => {
    const startedAt = performance.now();
    let cancelled = false;

    const tick = (now) => {
      if (cancelled || completedRef.current) return;

      const rawProgress = Math.min((now - startedAt) / INTRO_DURATION, 1);
      setProgress(Math.round(rawProgress * 100));

      if (rawProgress >= 0.5 && !formingPlaneRef.current) {
        formingPlaneRef.current = true;
        setPhase("forming-plane");
      }

      if (rawProgress >= 1) {
        finish();
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, [finish]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish]);

  return (
    <div
      className={`brand-splash ${phase === "forming-plane" ? "is-forming-plane" : ""} ${phase === "exiting" ? "is-exiting" : ""}`}
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="skip the portfolio introduction"
    >
      <div className="splash-ambient" aria-hidden="true" />

      <Canvas
        className="particle-splash-canvas"
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <SplashAssetBoundary fallback={<SplashAircraftFallback />}>
          <Suspense fallback={<SplashAircraftFallback />}>
            <ParticleIntro phase={phase} />
          </Suspense>
        </SplashAssetBoundary>
      </Canvas>

      <div className="splash-orbit" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="splash-center">
        <div className="splash-logo">
          sk<span>.</span>
        </div>
        <div className="splash-divider" />
        <div className="splash-label">design in motion / 01</div>
      </div>

      <div className="splash-progress" aria-live="off">
        <span>{phase === "forming-plane" ? "getting ready for takeoff" : "setting the scene"}</span>
        <strong>{String(progress).padStart(3, "0")}</strong>
        <em>%</em>
      </div>

      <footer className="splash-bottom">
        <span>swaraj khadse</span>
        <span>product design · ui / ux · frontend</span>
        <span>click to enter</span>
      </footer>
    </div>
  );
}
