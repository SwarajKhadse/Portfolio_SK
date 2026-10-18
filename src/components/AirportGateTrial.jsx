import { useEffect, useMemo, useRef, useState } from "react";
import "./AirportGateTrial.css";

/* Story beats mirror the supplied wireframe: gate hero → about → route-only
   camera beat → more-about panel → angle 5/runway → takeoff release. */
const CHAPTERS = [
  { id: "gate", number: "01", label: "gate", start: 0, end: 0.18 },
  { id: "about", number: "02", label: "about", start: 0.18, end: 0.34 },
  { id: "route", number: "03", label: "route", start: 0.34, end: 0.48 },
  { id: "details", number: "04", label: "details", start: 0.48, end: 0.67 },
  { id: "runway", number: "05", label: "runway", start: 0.67, end: 0.88 },
  { id: "takeoff", number: "06", label: "takeoff", start: 0.88, end: 1 },
];

function getJourneyProgress(scrollPositionRef, journeyRef) {
  const section = journeyRef?.current;
  if (!section) return 0;
  const scroll = scrollPositionRef?.current ?? window.scrollY ?? 0;
  const sectionTop = section.getBoundingClientRect().top + scroll;
  const travelDistance = Math.max(1, section.offsetHeight - window.innerHeight);
  return Math.min(1, Math.max(0, (scroll - sectionTop) / travelDistance));
}

function getChapterIndex(progress) {
  for (let index = CHAPTERS.length - 1; index >= 0; index -= 1) {
    if (progress >= CHAPTERS[index].start) return index;
  }
  return 0;
}

export default function AirportGateTrial({
  scrollPositionRef,
  journeyRef,
  onNavigateToWork,
  onNavigateToExperience,
  onExploreJourney,
}) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastChapter = useRef(0);

  useEffect(() => {
    let frame;
    const tick = () => {
      const nextProgress = getJourneyProgress(scrollPositionRef, journeyRef);
      const nextChapter = getChapterIndex(nextProgress);
      setProgress((previous) => Math.abs(previous - nextProgress) > 0.003 ? nextProgress : previous);
      if (nextChapter !== lastChapter.current) {
        lastChapter.current = nextChapter;
        setChapterIndex(nextChapter);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scrollPositionRef, journeyRef]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const chapter = useMemo(() => CHAPTERS[chapterIndex], [chapterIndex]);
  const quietChapter = chapter.id === "route" || chapter.id === "takeoff";

  const navigate = (callback) => {
    setMenuOpen(false);
    callback?.();
  };

  return (
    <div className={`airport-gate-trial chapter-${chapter.id}`}>
      <header className="portfolio-header">
        <a className="brand-lockup" href="#top" aria-label="swaraj khadse home" onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          <span className="brand-mark">sk<span>.</span></span>
          <span className="brand-copy">
            <strong>swaraj khadse</strong>
            <small>product design · ui/ux · frontend</small>
          </span>
        </a>

        <nav className={`portfolio-nav ${menuOpen ? "is-open" : ""}`} aria-label="portfolio navigation">
          <button type="button" onClick={() => navigate(onNavigateToExperience)}>experience</button>
          <button type="button" onClick={() => navigate(onNavigateToWork)}>projects</button>
        </nav>

        <button
          type="button"
          className={`header-menu ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "close navigation" : "open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
      </header>

      <div className={`airport-journey-ui ${quietChapter ? "is-quiet" : ""}`}>
        {chapter.id === "gate" && (
          <article key="gate-copy" className="story-card story-card--hero">
            <span className="story-eyebrow"><i /> international airport · gate 01</span>
            <h1>ideas<br />take<br /><span>flight.</span><b aria-hidden="true">↗</b></h1>
            <p>product experiences shaped with clarity, curiosity and care.</p>
            <button className="journey-cta" type="button" onClick={() => onExploreJourney?.()}>
              <span>follow the route</span><b aria-hidden="true">↓</b>
            </button>
          </article>
        )}

        {chapter.id === "about" && (
          <article key="about-copy" className="story-card story-card--about">
            <div className="about-card-portrait"><img src="/about.png" alt="swaraj khadse" /></div>
            <div className="about-card-copy">
              <span className="story-eyebrow"><i /> a little about me</span>
              <h2>designing for <span>people.</span></h2>
              <p>i’m swaraj — a product designer working across ux, interface design and frontend craft.</p>
              <p>i enjoy turning complex workflows into simple, useful digital experiences.</p>
              <button type="button" className="text-link" onClick={() => navigate(onNavigateToExperience)}>how i work <b>↗</b></button>
            </div>
          </article>
        )}

        {chapter.id === "route" && (
          <div className="route-note" aria-hidden="true">
            <span>03</span><i /> <span>follow the route</span>
          </div>
        )}

        {chapter.id === "details" && (
          <article key="details-copy" className="story-card story-card--details">
            <span className="story-eyebrow"><i /> more details about me</span>
            <h2>from complex <span>to clear.</span></h2>
            <p>i connect research, information architecture, design systems and frontend thinking to make every step feel intentional.</p>
            <div className="details-tags">
              <span>research</span><span>product design</span><span>design systems</span><span>frontend</span>
            </div>
          </article>
        )}

        {chapter.id === "runway" && (
          <div key="runway-copy" className="story-card story-card--runway">
            <span className="story-eyebrow"><i /> next stop</span>
            <h2>experience<span>.</span></h2>
            <p>the people, systems and decisions behind the work.</p>
            <button className="text-link" type="button" onClick={() => navigate(onNavigateToExperience)}>explore experience <b>↘</b></button>
          </div>
        )}

        <div className="journey-bottomline">
          <span>swaraj khadse</span>
          <div className="journey-progress" aria-label={`journey progress ${Math.round(progress * 100)} percent`}>
            <span>{chapter.number}</span><div><i style={{ transform: `scaleX(${Math.max(0.025, progress)})` }} /></div><span>06</span>
          </div>
          <span>{quietChapter ? "keep scrolling" : "scroll to explore"} <b aria-hidden="true">↓</b></span>
        </div>
      </div>
    </div>
  );
}
