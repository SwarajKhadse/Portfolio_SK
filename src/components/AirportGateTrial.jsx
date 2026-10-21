import { useEffect, useMemo, useRef, useState } from "react";
import "./AirportGateTrial.css";

/* Story beats mirror the supplied wireframe: gate hero → about → route-only
   camera beat → more-about panel → angle 5/runway → takeoff release. */
const CHAPTERS = [
  // Hold the gate hero long enough for its headline to fade as scroll begins.
  { id: "gate", number: "01", label: "gate", start: 0, end: 0.30 },
  // Reveal the profile card when the aircraft reaches the broad gate-end U-turn.
  { id: "about", number: "02", label: "about", start: 0.30, end: 0.42 },
  { id: "route", number: "03", label: "route", start: 0.42, end: 0.50 },
  { id: "details", number: "04", label: "details", start: 0.50, end: 0.67 },
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
  onNavigateToAbout,
  onNavigateToChapter,
}) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastChapter = useRef(0);

  useEffect(() => {
    let frame;
    const tick = () => {
      const nextProgress = getJourneyProgress(scrollPositionRef, journeyRef);
      const nextChapter = getChapterIndex(nextProgress);
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

  const navigate = (callback) => {
    setMenuOpen(false);
    callback?.();
  };

  return (
    <div className={`airport-gate-trial chapter-${chapter.id}`}>
      <header className="portfolio-header">
        <a className="brand-lockup" href="#top" aria-label="Swaraj Khadse Home" onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          <strong>Swaraj Khadse</strong>
        </a>

        <nav className={`portfolio-nav ${menuOpen ? "is-open" : ""}`} aria-label="Portfolio Navigation">
          <button type="button" onClick={() => navigate(onNavigateToWork)}>Work</button>
          <button type="button" onClick={() => navigate(onNavigateToExperience)}>Experience</button>
          <button type="button" onClick={() => navigate(onNavigateToAbout)}>About</button>
        </nav>

        <div className="header-actions">
          <a className="header-contact" href="mailto:?subject=Portfolio%20Enquiry">Contact Me</a>
          <a className="header-resume" href="/Swaraj-Khadse-Resume.pdf" download="Swaraj-Khadse-Resume.pdf">
            Download Resume <span aria-hidden="true">↗</span>
          </a>
        </div>

        <button
          type="button"
          className={`header-menu ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close Navigation" : "Open Navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>
      </header>

      <div className="airport-journey-ui">
        {chapter.id === "gate" && (
          <h1 className="visually-hidden">Ideas Take Flight.</h1>
        )}

        {chapter.id === "about" && (
          <article key="about-copy" className="story-card story-card--about">
            <div className="about-card-portrait"><img src="/about.png" alt="Swaraj Khadse" /></div>
            <div className="about-card-copy">
              <span className="story-eyebrow"><i /> A Little About Me</span>
              <h2>Designing For <span>People.</span></h2>
              <p>I’m Swaraj — a product designer working across UX, interface design and frontend craft.</p>
              <p>I enjoy turning complex workflows into simple, useful digital experiences.</p>
              <button type="button" className="text-link" onClick={() => navigate(onNavigateToExperience)} >How I Work <b>↗</b></button>
            </div>
          </article>
        )}

        {chapter.id === "route" && (
          <div className="route-note" aria-hidden="true">
            <span>03</span><i /> <span>Follow The Route</span>
          </div>
        )}

        {chapter.id === "details" && (
          <article key="details-copy" className="story-card story-card--details">
            <span className="story-eyebrow"><i /> More Details About Me</span>
            <h2>From Complex <span>To Clear.</span></h2>
            <p>I connect research, information architecture, design systems and frontend thinking to make every step feel intentional.</p>
            <div className="details-tags">
              <span>Research</span><span>Product Design</span><span>Design Systems</span><span>Frontend</span>
            </div>
          </article>
        )}

        {chapter.id === "runway" && (
          <div key="runway-copy" className="story-card story-card--runway">
            <span className="story-eyebrow"><i /> Next Stop</span>
            <h2>Experience<span>.</span></h2>
            <p>The people, systems and decisions behind the work.</p>
            <button className="text-link" type="button" onClick={() => navigate(onNavigateToExperience)} >Explore Experience <b>↘</b></button>
          </div>
        )}


        <aside className="journey-stepper" aria-label="Journey Progress">
          <ol>
            {CHAPTERS.map((step, index) => (
              <li key={step.id}>
                <button
                  type="button"
                  aria-label={`Go to ${step.label} chapter`}
                  aria-current={chapterIndex === index ? "step" : undefined}
                  title={step.label}
                  onClick={() => {
                    const progress = index === 0 ? 0 : Math.min(0.995, step.start + 0.008);
                    navigate(() => onNavigateToChapter?.(progress));
                  }}
                />
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
