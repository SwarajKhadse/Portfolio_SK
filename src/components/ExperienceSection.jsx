import { useEffect, useRef } from "react";
import "./ExperienceSection.css";

function ExperienceParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationFrame;

    const particles = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();

    const count =
      window.innerWidth < 800
        ? 90
        : 160;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size:
          Math.random() * 1.6 + 0.4,
        speedX:
          (Math.random() - 0.5) * 0.12,
        speedY:
          (Math.random() - 0.5) * 0.12,
        opacity:
          Math.random() * 0.25 + 0.08,
      });
    }

    const animate = () => {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10)
          particle.x = width + 10;

        if (particle.x > width + 10)
          particle.x = -10;

        if (particle.y < -10)
          particle.y = height + 10;

        if (particle.y > height + 10)
          particle.y = -10;

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(
          255,
          255,
          255,
          ${particle.opacity}
        )`;

        ctx.fill();
      }

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    animate();

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="experience-particles"
    />
  );
}

function ExperienceSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section =
      sectionRef.current;

    if (!section) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            section.classList.add(
              "experience-visible"
            );
          }
        },
        {
          threshold: 0.2,
        }
      );

    observer.observe(section);

    return () =>
      observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="experience-section"
    >
      <ExperienceParticles />

      <div className="experience-content">

        <div className="experience-topline">
          <span>
            03 / EXPERIENCE
          </span>

          <span>
            2023 — 2026
          </span>
        </div>

        <div className="experience-heading">

          <h2>
            EXPERIENCE
            <br />
            THAT SHAPED ME.
          </h2>

          <p>
            Working across product design,
            interaction design and technology
            to create meaningful experiences
            for complex digital ecosystems.
          </p>

        </div>


        <div className="experience-list">

          <article className="experience-item">

            <div className="experience-period">
              2023 — PRESENT
            </div>

            <div className="experience-line">
              <span />
            </div>

            <div className="experience-details">

              <div className="experience-company">
                REBIT
              </div>

              <h3>
                PRODUCT DESIGNER
              </h3>

              <p>
                Designing enterprise digital products
                and experiences for banking and regulatory
                ecosystems, with a focus on simplifying
                complex workflows.
              </p>

              <div className="experience-tags">
                <span>PRODUCT DESIGN</span>
                <span>UI / UX</span>
                <span>DESIGN SYSTEM</span>
                <span>ENTERPRISE UX</span>
              </div>

            </div>

          </article>


          <article className="experience-item">

            <div className="experience-period">
              EARLIER
            </div>

            <div className="experience-line">
              <span />
            </div>

            <div className="experience-details">

              <div className="experience-company">
                DESIGN + DEVELOPMENT
              </div>

              <h3>
                BUILDING
                <br />
                DIGITAL EXPERIENCES
              </h3>

              <p>
                Exploring the intersection of design
                and frontend development while building
                a strong foundation in digital products.
              </p>

              <div className="experience-tags">
                <span>UI DESIGN</span>
                <span>FRONTEND</span>
                <span>INTERACTION</span>
              </div>

            </div>

          </article>

        </div>

      </div>

      <div className="experience-footer">
        <span>BASED IN INDIA</span>
        <span>03 / 04</span>
      </div>

    </section>
  );
}

export default ExperienceSection;