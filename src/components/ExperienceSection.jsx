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
          <span>03 / experience</span>
          <span>2023 — 2026</span>
        </div>

        <div className="experience-heading">
          <h2 id="experience-title">
            experience
            <br />
            that shaped me.
          </h2>
          <p>
            working across product design, interaction design and technology to
            create meaningful experiences for complex digital ecosystems.
          </p>
        </div>

        <div className="experience-list">
          <article className="experience-item">
            <div className="experience-period">2023 — present</div>
            <div className="experience-line" aria-hidden="true">
              <span />
            </div>
            <div className="experience-details">
              <div className="experience-company">rebit</div>
              <h3>product designer</h3>
              <p>
                designing enterprise digital products and experiences for
                banking and regulatory ecosystems, with a focus on simplifying
                complex workflows.
              </p>
              <div className="experience-tags" aria-label="areas of work">
                <span>product design</span>
                <span>ui / ux</span>
                <span>design system</span>
                <span>enterprise ux</span>
              </div>
            </div>
          </article>

          <article className="experience-item">
            <div className="experience-period">earlier</div>
            <div className="experience-line" aria-hidden="true">
              <span />
            </div>
            <div className="experience-details">
              <div className="experience-company">design + development</div>
              <h3>
                building digital
                <br />
                experiences
              </h3>
              <p>
                exploring the intersection of design and frontend development
                while building a strong foundation in digital products.
              </p>
              <div className="experience-tags" aria-label="areas of work">
                <span>ui design</span>
                <span>frontend</span>
                <span>interaction</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className="experience-footer">
        <span>based in india</span>
        <span>03 / 04</span>
      </div>
    </section>
  );
}

export default ExperienceSection;
