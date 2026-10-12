import { useEffect, useMemo, useRef, useState } from "react";

import "./AirportGateTrial.css";

const STAGES = [
  {
    number: "01",
    label: "GATE",
    kicker: "PRODUCT DESIGN · UI / UX · FRONTEND",
    title: <>IDEAS<br />TAKE<br /><span>FLIGHT.</span></>,
    body: "Designing clear digital experiences where complex requirements become calm, usable interfaces.",
  },
  {
    number: "02",
    label: "PUSHBACK",
    kicker: "FROM REQUIREMENTS TO DIRECTION",
    title: <>FROM<br />COMPLEXITY<br /><span>TO CLARITY.</span></>,
    body: "Turning workflows, edge cases and stakeholder needs into focused product experiences.",
  },
  {
    number: "03",
    label: "TAXI",
    kicker: "DESIGN IN MOTION",
    title: <>DESIGN<br /><span>IN MOTION.</span></>,
    body: "Systems, screens and interactions built around real users, real constraints and real work.",
  },
  {
    number: "04",
    label: "RUNWAY",
    kicker: "BUILT FOR THE REAL WORLD",
    title: <>READY<br />FOR THE<br /><span>RUNWAY.</span></>,
    body: "Enterprise products, banking platforms and public-facing digital experiences designed with precision.",
  },
  {
    number: "05",
    label: "TAKEOFF",
    kicker: "DESIGN × FRONTEND",
    title: <>BUILD.<br />TEST.<br /><span>REFINE.</span></>,
    body: "Bringing Figma decisions closer to the final product through prototyping, frontend craft and iteration.",
  },
  {
    number: "06",
    label: "IN FLIGHT",
    kicker: "SELECTED WORK FOLLOWS",
    title: <>WORK<br />WORTH<br /><span>SEEING.</span></>,
    body: "Selected work across eHRMS, EKAMEVA, UDGAM and other digital experiences.",
  },
];

const getProgress = (scrollPositionRef, journeyRef) => {
  const section = journeyRef?.current;
  if (!section) return 0;

  const scroll = scrollPositionRef?.current ?? window.scrollY ?? 0;
  const top = section.getBoundingClientRect().top + scroll;
  const distance = Math.max(
    1,
    section.offsetHeight - window.innerHeight
  );

  return Math.min(
    1,
    Math.max(0, (scroll - top) / distance)
  );
};

const getStageIndex = (progress) => {
  if (progress < 0.12) return 0;
  if (progress < 0.30) return 1;
  if (progress < 0.55) return 2;
  if (progress < 0.75) return 3;
  if (progress < 0.90) return 4;
  return 5;
};

export default function AirportGateTrial({
  scrollPositionRef,
  journeyRef,
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const lastStage = useRef(0);

  useEffect(() => {
    let frame;

    const tick = () => {
      const progress = getProgress(
        scrollPositionRef,
        journeyRef
      );

      const nextStage = getStageIndex(progress);

      if (nextStage !== lastStage.current) {
        lastStage.current = nextStage;
        setStageIndex(nextStage);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [scrollPositionRef, journeyRef]);

  const activeStage = useMemo(
    () => STAGES[stageIndex],
    [stageIndex]
  );

  return (
    <div className="airport-gate-trial">
      <header className="portfolio-header">
        <div className="header-brand-card">
          <div className="brand-lockup">
            <div className="brand-mark">
              SK<span>.</span>
            </div>

            <div className="brand-copy">
              <strong>SWARAJ</strong>
              <small>PRODUCT DESIGNER</small>
            </div>
          </div>

          <div className="header-divider" />

          <button
            type="button"
            className="header-menu"
            aria-label="Menu"
            data-cursor="interactive"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="airport-journey-ui">
        <div
          key={activeStage.number}
          className="journey-content"
        >
          <div className="journey-section">
            {activeStage.number} / {activeStage.label}
          </div>

          <div className="journey-kicker">
            {activeStage.kicker}
          </div>

          <h1 className="journey-title">
            {activeStage.title}
          </h1>

          <div className="journey-role">
            <span className="role-line" />
            <div>{activeStage.body}</div>
          </div>
        </div>

        <div className="journey-track" aria-hidden="true">
          <div className="track-line" />

          {STAGES.map((stage, index) => (
            <div
              key={stage.number}
              className={`track-item ${
                index === stageIndex ? "active" : ""
              }`}
            >
              <span className="track-dot" />
              <div>
                <strong>{stage.number}</strong>
                <small>{stage.label}</small>
              </div>
            </div>
          ))}
        </div>

        <footer className="journey-footer">
          <span>© 2026 SWARAJ KHADSE</span>

          <div className="journey-scroll" aria-hidden="true">
            <span>{stageIndex === 5 ? "CONTINUE" : "SCROLL"}</span>
            <b>↓</b>
          </div>

          <span>DESIGN · SYSTEMS · DIGITAL EXPERIENCES</span>
        </footer>
      </div>
    </div>
  );
}
