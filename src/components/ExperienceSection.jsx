import { useEffect, useRef } from "react";
import "./ExperienceSection.css";

function ExperienceSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("experience-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="experience-section" aria-labelledby="experience-title">
      <div className="experience-content">
        <div className="experience-topline">
          <span>03 / Experience</span>
          <span>2023 — 2026</span>
        </div>

        <div className="experience-heading">
          <h2 id="experience-title">
            Experience
            <br />
            That Shaped Me.
          </h2>
          <p>
            Working across product design, interaction design and technology to
            create meaningful experiences for complex digital ecosystems.
          </p>
        </div>

        <div className="experience-list">
          <article className="experience-item">
            <div className="experience-period">2023 — Present</div>
            <div className="experience-line" aria-hidden="true">
              <span />
            </div>
            <div className="experience-details">
              <div className="experience-company">ReBIT</div>
              <h3>Product Designer</h3>
              <p>
                Designing enterprise digital products and experiences for
                banking and regulatory ecosystems, with a focus on simplifying
                complex workflows.
              </p>
              <div className="experience-tags" aria-label="Areas Of Work">
                <span>Product Design</span>
                <span>UI / UX</span>
                <span>Design System</span>
                <span>Enterprise UX</span>
              </div>
            </div>
          </article>

          <article className="experience-item">
            <div className="experience-period">Earlier</div>
            <div className="experience-line" aria-hidden="true">
              <span />
            </div>
            <div className="experience-details">
              <div className="experience-company">Design + Development</div>
              <h3>
                Building Digital
                <br />
                Experiences
              </h3>
              <p>
                Exploring the intersection of design and frontend development
                while building a strong foundation in digital products.
              </p>
              <div className="experience-tags" aria-label="Areas Of Work">
                <span>UI Design</span>
                <span>Frontend</span>
                <span>Interaction</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="experience-footer">
        <span>Based In India</span>
        <span>03 / 04</span>
      </div>
    </section>
  );
}

export default ExperienceSection;
