import { Canvas } from "@react-three/fiber";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ParticleIntro from "./components/ParticleIntro.jsx";

import AboutIntro from "./components/AboutIntro.jsx";

import WorkSection from "./components/WorkSection.jsx";

import ExperienceSection from "./components/ExperienceSection.jsx";

import EkamevaCaseStudy from "./components/case-study/EkamevaCaseStudy.jsx";

import "./App.css";


function App() {

  const [phase, setPhase] =
    useState("splash");


  const [view, setView] =
    useState("hero");


  const [transitioning, setTransitioning] =
    useState(false);


  /*
   * CASE STUDY OPEN / CLOSE
   */

  const [caseStudy, setCaseStudy] =
    useState(false);


  const wheelLocked =
    useRef(false);


  /* =====================================
     ENTER EXPERIENCE
  ===================================== */

  const handleEnter = () => {

    if (
      phase !== "splash"
    ) {
      return;
    }

    setPhase(
      "distorting"
    );
  };


  /* =====================================
     DISTORTING → HERO
  ===================================== */

  useEffect(() => {

    if (
      phase !==
      "distorting"
    ) {
      return;
    }

    const timer =
      setTimeout(() => {

        setPhase("hero");

      }, 3000);


    return () => {

      clearTimeout(timer);

    };

  }, [phase]);


  /* =====================================
     VIEW TRANSITIONS

     HERO
       ↓
     ABOUT
       ↓
     WORK
       ↓
     EXPERIENCE
  ===================================== */

  useEffect(() => {

    const handleWheel = (
      event
    ) => {

      /*
       * Don't change the main
       * chapter while case study
       * is open.
       */

      if (caseStudy) {
        return;
      }


      if (
        wheelLocked.current
      ) {
        return;
      }


      /*
       * Ignore tiny trackpad movements
       */

      if (
        Math.abs(event.deltaY) < 30
      ) {
        return;
      }


      /* =================================
         SCROLL DOWN
      ================================= */

      if (
        event.deltaY > 30
      ) {


        /* HERO → ABOUT */

        if (
          view === "hero"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "about"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /* ABOUT → WORK */

        if (
          view === "about"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "work"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /* WORK → EXPERIENCE */

        if (
          view === "work"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "experience"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /*
         * EXPERIENCE → NOTHING
         */

        return;
      }


      /* =================================
         SCROLL UP
      ================================= */

      if (
        event.deltaY < -30
      ) {


        /* EXPERIENCE → WORK */

        if (
          view === "experience"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "work"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /* WORK → ABOUT */

        if (
          view === "work"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "about"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /* ABOUT → HERO */

        if (
          view === "about"
        ) {

          wheelLocked.current =
            true;

          setTransitioning(
            true
          );


          setTimeout(() => {

            setView(
              "hero"
            );

          }, 450);


          setTimeout(() => {

            setTransitioning(
              false
            );

            wheelLocked.current =
              false;

          }, 1300);


          return;
        }


        /*
         * HERO → NOTHING
         */

        return;
      }

    };


    window.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: true,
      }
    );


    return () => {

      window.removeEventListener(
        "wheel",
        handleWheel
      );

    };

  }, [
    view,
    caseStudy,
  ]);


  return (

    <main
      className={`
        app
        view-${view}
        ${
          transitioning
            ? "is-transitioning"
            : ""
        }
        ${
          caseStudy
            ? "case-study-open"
            : ""
        }
      `}
    >


      {/* =================================
          FIXED HEADER
      ================================= */}

      <header
        className="top-bar"
      >

        <div className="logo">

          SK<span>.</span>

        </div>


        <div className="top-right">

          PORTFOLIO / 2026

        </div>

      </header>


      {/* =================================
          VIEW 01 — HERO
      ================================= */}

      <section
        className={`
          hero-view
          ${
            view === "hero"
              ? "active"
              : ""
          }
        `}
      >

        <Canvas
          className="particle-canvas"
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
        >

          <ParticleIntro
            phase={phase}
          />

        </Canvas>


        <div className="vignette" />


        {/* SPLASH */}

        {phase ===
          "splash" && (

          <div
            className="splash-ui"
          >

            <div
              className="splash-side-text"
            >

              AN IMMERSIVE

              <br />

              DIGITAL EXPERIENCE

            </div>


            <div
              className="splash-center"
            >

              <div
                className="splash-index"
              >
                01 / 04
              </div>


              <button
                type="button"
                className="enter-button"
                onClick={
                  handleEnter
                }
              >

                <span>
                  ENTER EXPERIENCE
                </span>


                <span
                  className="enter-circle"
                >
                  ↓
                </span>

              </button>


              <div
                className="touch-hint"
              >
                CLICK / TOUCH TO BEGIN
              </div>

            </div>

          </div>

        )}


        {/* TRANSITION */}

        {phase ===
          "distorting" && (

          <div
            className="transition-ui"
          >

            <span>
              ENTERING
            </span>


            <div
              className="transition-line"
            >

              <span />

            </div>

          </div>

        )}


        {/* HERO */}

        {phase ===
          "hero" && (

          <div
            className="hero-content"
          >

            <div
              className="hero-eyebrow"
            >

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


            <div
              className="hero-scroll"
            >

              SCROLL TO EXPLORE

              <span>↓</span>

            </div>

          </div>

        )}


        {/* HERO FOOTER */}

        <div
          className="bottom-left"
        >
          © 2026 SWARAJ KHADSE
        </div>


        <div
          className="bottom-right"
        >
          AVAILABLE FOR SELECT PROJECTS
        </div>

      </section>


      {/* =================================
          VIEW 02 — ABOUT
      ================================= */}

      <section
        className={`
          about-view
          ${
            view === "about"
              ? "active"
              : ""
          }
        `}
      >

        <AboutIntro
          active={
            view === "about"
          }
        />

      </section>


      {/* =================================
          VIEW 03 — WORK
      ================================= */}

      <section
        className={`
          work-view
          ${
            view === "work" &&
            !caseStudy
              ? "active"
              : ""
          }
        `}
      >

        <WorkSection
          onOpenCaseStudy={() =>
            setCaseStudy(true)
          }
        />

      </section>


      {/* =================================
          VIEW 04 — EXPERIENCE
      ================================= */}

      <section
        className={`
          experience-view
          ${
            view === "experience"
              ? "active"
              : ""
          }
        `}
      >

        <ExperienceSection />

      </section>


      {/* =================================
          EKAMEVA CASE STUDY
      ================================= */}

      <section
        className={`
          case-study-view
          ${
            caseStudy
              ? "active"
              : ""
          }
        `}
      >

        <EkamevaCaseStudy
          onBack={() =>
            setCaseStudy(false)
          }
        />

      </section>

    </main>
  );
}

export default App;