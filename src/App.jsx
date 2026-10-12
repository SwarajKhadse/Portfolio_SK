import { useEffect, useRef, useState } from "react";

import Lenis from "lenis";

import WorkSection from "./components/WorkSection.jsx";
import ExperienceSection from "./components/ExperienceSection.jsx";
import EkamevaCaseStudy from "./components/case-study/EkamevaCaseStudy.jsx";
import AirportGateTrial from "./components/AirportGateTrial.jsx";
import AirportJourneyCanvas from "./components/AirportJourneyCanvas.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import AmbientAudio from "./components/AmbientAudio.jsx";

import "./App.css";

function App() {
  const [phase, setPhase] = useState("splash");
  const [caseStudy, setCaseStudy] = useState(false);

  const lenisRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const journeyRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      lerp: 0.075,
    });

    lenisRef.current = lenis;

    const handleScroll = ({ scroll }) => {
      scrollPositionRef.current = scroll;
    };

    lenis.on("scroll", handleScroll);

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);
    lenis.stop();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const locked = phase === "splash" || caseStudy;

    document.body.classList.toggle(
      "site-scroll-locked",
      locked
    );

    if (locked) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }

    return () => {
      document.body.classList.remove(
        "site-scroll-locked"
      );
    };
  }, [phase, caseStudy]);

  const handleSplashComplete = () => {
    setPhase("site");

    requestAnimationFrame(() => {
      lenisRef.current?.scrollTo(0, {
        immediate: true,
      });

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });

      scrollPositionRef.current = 0;
    });
  };

  return (
    <main className="app continuous-app">
      <div
        ref={journeyRef}
        className="journey-flow"
      >
        <div className="journey-canvas-sticky">
          <AirportJourneyCanvas
            scrollPositionRef={scrollPositionRef}
            journeyRef={journeyRef}
          />
        </div>

        <section
          className="hero-view"
          aria-label="Airport gate journey"
        >
          <AirportGateTrial
            scrollPositionRef={scrollPositionRef}
            journeyRef={journeyRef}
          />
        </section>
      </div>

      <section
        className="work-view"
        aria-label="Selected work"
      >
        <WorkSection
          onOpenCaseStudy={() => setCaseStudy(true)}
        />
      </section>

      <section
        className="experience-view"
        aria-label="Experience"
      >
        <ExperienceSection />
      </section>

      <section
        className={`case-study-view ${
          caseStudy ? "active" : ""
        }`}
        aria-hidden={!caseStudy}
      >
        <EkamevaCaseStudy
          onBack={() => setCaseStudy(false)}
        />
      </section>

      {phase === "site" && <CustomCursor />}

      {phase === "site" && (
        <AmbientAudio active={!caseStudy} />
      )}

      {phase === "splash" && (
        <SplashScreen
          onComplete={handleSplashComplete}
        />
      )}
    </main>
  );
}

export default App;
