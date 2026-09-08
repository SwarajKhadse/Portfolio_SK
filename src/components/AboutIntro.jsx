import { useEffect, useRef, useState } from "react";
import "./AboutIntro.css";

function AboutIntro({ active }) {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setRevealed(false);
      return;
    }

    /*
     * Small delay makes the transition feel intentional:
     *
     * black screen
     *      ↓
     * image enters
     *      ↓
     * flash sweep
     */

    timerRef.current = setTimeout(() => {
      setRevealed(true);
    }, 180);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [active]);

  return (
    <section
      className={`about-intro ${
        active ? "about-active" : ""
      } ${
        revealed ? "about-revealed" : ""
      }`}
    >
      <div className="about-inner">

        {/* =================================
            LEFT CONTENT
        ================================= */}

        <div className="about-copy">

          <div className="about-label">
            01 / ABOUT ME
          </div>

          <h2>
            DESIGNING
            <br />
            DIGITAL
            <br />
            EXPERIENCES.
          </h2>

          <p>
            I’m Swaraj Khadse, a Product Designer
            focused on creating meaningful digital
            experiences through thoughtful interaction
            and visual design.
          </p>

          <p>
            I enjoy turning complex problems into
            simple, intuitive and engaging experiences.
          </p>

          <div className="about-role">
            PRODUCT DESIGNER
            <span>×</span>
            UI / UX
          </div>

        </div>


        {/* =================================
            RIGHT IMAGE
        ================================= */}

        <div className="about-visual">

          <div className="about-image-frame">

            {/* Flash sweep */}

            <div className="image-flash" />

            {/* Image */}

            <img
              src="/about34.png"
              alt="Swaraj Khadse"
            />

          </div>

        </div>

      </div>


      {/* =================================
          FOOTER
      ================================= */}

      <div className="about-footer">

        <span>
          BASED IN INDIA
        </span>

        <span>
          CHAPTER II
        </span>

      </div>

    </section>
  );
}

export default AboutIntro;