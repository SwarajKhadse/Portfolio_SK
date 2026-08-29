import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

import ParticleIntro from "./components/ParticleIntro.jsx";
import WorkSection from "./components/WorkSection.jsx";

import "./App.css";

function App() {
  const [phase, setPhase] = useState("splash");

  /*
   * ENTER EXPERIENCE
   */
  const handleEnter = () => {
    if (phase !== "splash") return;

    setPhase("distorting");
  };

  /*
   * DISTORTING -> HERO
   */
  useEffect(() => {
    if (phase !== "distorting") return;

    const timer = setTimeout(() => {
      setPhase("hero");
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  return (
    <main
      className={`app app-${phase}`}
    >
      {/* =================================
          INTRO EXPERIENCE
      ================================= */}

      <section className="intro">
        <Canvas
          className="particle-canvas"
          camera={{
            position: [0, 0, 6],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.5]}
        >
          <ParticleIntro
            phase={phase}
          />
        </Canvas>

        <div className="vignette" />

        {/* HEADER */}

        <header className="top-bar">
          <div className="logo">
            SK<span>.</span>
          </div>

          <div className="top-right">
            PORTFOLIO / 2026
          </div>
        </header>


        {/* =================================
            SPLASH
        ================================= */}

        {phase === "splash" && (
          <div className="splash-ui">

            <div className="splash-side-text">
              AN IMMERSIVE
              <br />
              DIGITAL EXPERIENCE
            </div>

            <div className="splash-center">

              <div className="splash-index">
                01 / 04
              </div>

              <button
                type="button"
                className="enter-button"
                onClick={handleEnter}
              >
                <span>
                  ENTER EXPERIENCE
                </span>

                <span className="enter-circle">
                  ↓
                </span>
              </button>

              <div className="touch-hint">
                CLICK / TOUCH TO BEGIN
              </div>

            </div>

          </div>
        )}


        {/* =================================
            TRANSITION
        ================================= */}

        {phase === "distorting" && (
          <div className="transition-ui">

            <span>
              ENTERING
            </span>

            <div className="transition-line">
              <span />
            </div>

          </div>
        )}


        {/* =================================
            HERO
        ================================= */}

        {phase === "hero" && (
          <section className="hero">

            <div className="hero-content">

              <div className="hero-eyebrow">
                PRODUCT DESIGNER
                <span>×</span>
                UI / UX
              </div>

              <h1>
                SWARAJ
                <br />
                KHADSE
              </h1>

              <p>
                Designing digital experiences
                <br />
                where complexity becomes clarity.
              </p>

              <button
                type="button"
                className="hero-scroll"
                onClick={() =>
                  document
                    .getElementById("work")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                SCROLL TO EXPLORE
                <span>↓</span>
              </button>

            </div>

          </section>
        )}

        {/* BOTTOM INFO */}

        <div className="bottom-left">
          © 2026 SWARAJ KHADSE
        </div>

        <div className="bottom-right">
          AVAILABLE FOR SELECT PROJECTS
        </div>
      </section>


      {/* =================================
          WORK
      ================================= */}

      <WorkSection />

    </main>
  );
}

export default App;