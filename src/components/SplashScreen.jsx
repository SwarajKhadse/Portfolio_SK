import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ParticleIntro from "./ParticleIntro.jsx";
import planeSilhouette from "../assets/plane-silhouette.svg";
import "./SplashScreen.css";

const INTRO_DURATION = 5250;
const EXIT_DURATION = 620;

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("splash");
  const [progress, setProgress] = useState(0);
  const [planeVisible, setPlaneVisible] = useState(false);
  const completedRef = useRef(false);
  const formingPlaneRef = useRef(false);
  const frameRef = useRef(0);
  const timeoutRef = useRef(0);

  const handlePlaneVisible = useCallback(() => setPlaneVisible(true), []);

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
      aria-label="Skip The Portfolio Introduction"
    >
      <div className="splash-ambient" aria-hidden="true" />

      <Canvas
        className="particle-splash-canvas"
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <ParticleIntro phase={phase} onPlaneVisible={handlePlaneVisible} />
        </Suspense>
      </Canvas>

      {phase === "forming-plane" && !planeVisible && (
        <img
          className="splash-plane-fallback"
          src={planeSilhouette}
          alt=""
          aria-hidden="true"
        />
      )}

      <div className="splash-center">
        <div className="splash-logo">
          sk<span>.</span>
        </div>
        <div className="splash-divider" />
        <div className="splash-label">Design In Motion / 01</div>
      </div>

      <div className="splash-progress" aria-live="off">
        <span>{phase === "forming-plane" ? "Getting Ready For Takeoff" : "Setting The Scene"}</span>
        <strong>{String(progress).padStart(3, "0")}</strong>
        <em>%</em>
      </div>

      <footer className="splash-bottom">
        <span>Swaraj Khadse</span>
        <span>Product Design · UI / UX · Frontend</span>
        <span>Click To Enter</span>
      </footer>
    </div>
  );
}
