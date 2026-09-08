import "./WorkSection.css";

function WorkSection({ onOpenCaseStudy }) {
  return (
    <section className="work-section">

      <div className="work-header">

        <div className="work-label">
          02 / SELECTED WORK
        </div>

        <div className="work-year">
          2023 — 2026
        </div>

      </div>


      <div className="work-intro">

        <h2>
          SELECTED
          <br />
          WORK.
        </h2>

        <p>
          A selection of digital products and experiences
          designed around complex problems, clear systems
          and meaningful interactions.
        </p>

      </div>


      <article className="featured-project">

        <div className="project-top">

          <span>
            01
          </span>

          <span>
            PRODUCT DESIGN / ENTERPRISE
          </span>

        </div>


        <div className="project-layout">


          {/* PROJECT VISUAL */}

          <div className="project-visual">

            <img
              src="/ekameva.png"
              alt="RBI Ekameva"
              className="project-image"
            />

            <div className="project-glow" />

            <div className="project-device">

              <div className="device-bar" />

              <div className="device-content">

                <div className="device-sidebar" />

                <div className="device-main">

                  <div className="device-line large" />

                  <div className="device-line" />

                  <div className="device-line short" />

                  <div className="device-cards">

                    <span />
                    <span />
                    <span />

                  </div>

                </div>

              </div>

            </div>


            <div className="project-orbit orbit-one" />

            <div className="project-orbit orbit-two" />

          </div>


          {/* PROJECT INFO */}

          <div className="project-info">

            <div className="project-category">
              01 / ENTERPRISE PRODUCT
            </div>


            <h3>
              RBI
              <br />
              EKAMEVA
            </h3>


            <p>
              A unified Single Sign-On experience designed
              to simplify secure access across enterprise
              banking applications.
            </p>


            <div className="project-meta">

              <div>
                <span>
                  ROLE
                </span>

                Product Designer
              </div>


              <div>
                <span>
                  TYPE
                </span>

                UX / UI
              </div>


              <div>
                <span>
                  YEAR
                </span>

                2026
              </div>

            </div>


            {/* CASE STUDY BUTTON */}

            <button
              type="button"
              className="project-button"
              onClick={onOpenCaseStudy}
            >

              VIEW CASE STUDY

              <span>
                ↗
              </span>

            </button>

          </div>

        </div>

      </article>

    </section>
  );
}

export default WorkSection;