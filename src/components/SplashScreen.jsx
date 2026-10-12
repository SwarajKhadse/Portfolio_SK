import React, {
    useEffect,
    useRef,
    useState,
  } from "react";
  
  import {
    Canvas,
  } from "@react-three/fiber";
  
  import ParticleIntro from "./ParticleIntro";
  
  import "./SplashScreen.css";
  
  
  const PRIMARY =
    "#2C3847";
  
  const ACCENT =
    "#FF6047";
  
  
  export default function SplashScreen({
    onComplete,
  }) {
    const [phase, setPhase] =
      useState("splash");
  
    const [progress, setProgress] =
      useState(0);
  
    const completed =
      useRef(false);
  
  
    /* =======================================================
       FULL TIMELINE
  
       0.0–2.35  dots → sphere
       2.35–2.60  sphere settles
       2.60–4.85  sphere → A320
       4.85–5.25  final plane hold
       5.25+       hero reveal
    ======================================================= */
  
    useEffect(() => {
      const started =
        performance.now();
  
      const total =
        5250;
  
      let frame;
  
      const tick = (now) => {
        const elapsed =
          now - started;
  
        const raw =
          Math.min(
            elapsed / total,
            1
          );
  
  
        if (
          raw < 0.48
        ) {
          setProgress(
            Math.round(
              raw /
              0.48 *
              42
            )
          );
        } else {
          setProgress(
            42 +
            Math.round(
              (
                raw -
                0.48
              ) /
              0.52 *
              58
            )
          );
        }
  
  
        if (
          raw >=
          0.50 &&
          phase ===
          "splash"
        ) {
          setPhase(
            "forming-plane"
          );
        }
  
  
        if (
          raw >= 1 &&
          !completed.current
        ) {
          completed.current = true;
  
          setPhase(
            "exiting"
          );
  
          window.setTimeout(() => {
            onComplete?.();
          }, 700);
  
          return;
        }
  
  
        frame =
          requestAnimationFrame(
            tick
          );
      };
  
  
      frame =
        requestAnimationFrame(
          tick
        );
  
  
      return () => {
        cancelAnimationFrame(frame);
      };
    }, [
      onComplete,
      phase,
    ]);
  
  
    const skip =
      () => {
        if (
          completed.current
        ) {
          return;
        }
  
        completed.current =
          true;
  
        setProgress(100);
  
        setPhase(
          "exiting"
        );
  
        window.setTimeout(() => {
          onComplete?.();
        }, 550);
      };
  
  
    return (
      <div
        className={
          `brand-splash ${
            phase === "exiting"
              ? "is-exiting"
              : ""
          }`
        }
        style={{
          "--primary": PRIMARY,
          "--accent": ACCENT,
        }}
        onClick={skip}
      >
  
        {/* subtle ambient light */}
  
        <div
          className="splash-ambient"
        />
  
  
        {/* particle animation */}
  
        <Canvas
          className="particle-splash-canvas"
          camera={{
            position: [
              0,
              0,
              6,
            ],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[
            1,
            1.5,
          ]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference:
              "high-performance",
          }}
        >
  
          <ParticleIntro
            phase={phase}
          />
  
        </Canvas>
  
  
        {/* orbital rings */}
  
        <div
          className="splash-orbit"
        >
  
          <span />
          <span />
          <span />
  
        </div>
  
  
        {/* center brand */}
  
        <div
          className="splash-center"
        >
  
          <div
            className="splash-logo"
          >
            SK<span>.</span>
          </div>
  
          <div
            className="splash-divider"
          />
  
          <div
            className="splash-label"
          >
            FLIGHT SYSTEM / 01
          </div>
  
        </div>
  
  
        {/* progress */}
  
        <div
          className="splash-progress"
        >
  
          <span>
            INITIALISING
          </span>
  
          <strong>
            {String(
              progress
            ).padStart(
              3,
              "0"
            )}
          </strong>
  
          <em>
            %
          </em>
  
        </div>
  
  
        {/* bottom */}
  
        <div
          className="splash-bottom"
        >
  
          <span>
            SWARAJ KHADSE
          </span>
  
          <span>
            PRODUCT DESIGN · UI / UX
          </span>
  
          <span>
            CLICK TO ENTER
          </span>
  
        </div>
  
  
        {/* exit flash */}
  
        <div
          className="splash-flash"
        />
  
      </div>
    );
  }
  