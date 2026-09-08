import "./EkamevaCaseStudy.css";

function EkamevaCaseStudy({ onBack }) {
  return (
    <main className="ekameva-case-study">

      {/* ==================================================
          FIXED CASE STUDY HEADER
      ================================================== */}

      <header className="case-header">

        <button
          className="case-back"
          onClick={onBack}
        >
          <span>←</span>
          BACK TO WORK
        </button>

        <div className="case-header-center">
          EKAMEV / CASE STUDY
        </div>

        <div className="case-header-right">
          RBI / 01
        </div>

      </header>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="case-hero">

        <div className="case-hero-content">

          <div className="case-number">
            01 / ENTERPRISE PRODUCT
          </div>

          <h1>
            EKAMEV
          </h1>

          <p className="case-hero-title">
            Reimagining access to a complex
            enterprise ecosystem.
          </p>

          <p className="case-hero-description">
            A secure, unified Single Sign-On experience
            designed to simplify how internal users
            access applications across the RBI ecosystem.
          </p>

        </div>


        <div className="case-hero-visual">

          <div className="hero-visual-glow" />

          <img
            src="/ekameva.png"
            alt="EKAMEV interface"
          />

        </div>

      </section>


      {/* ==================================================
          PROJECT SNAPSHOT
      ================================================== */}

      <section className="case-snapshot">

        <div className="snapshot-item">
          <span>CLIENT</span>
          Reserve Bank of India
        </div>

        <div className="snapshot-item">
          <span>DOMAIN</span>
          Enterprise / Banking
        </div>

        <div className="snapshot-item">
          <span>ROLE</span>
          Product Designer
        </div>

        <div className="snapshot-item">
          <span>DISCIPLINE</span>
          UX / UI
        </div>

        <div className="snapshot-item">
          <span>YEAR</span>
          2026
        </div>

      </section>


      {/* ==================================================
          CONTEXT
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          01
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">
            <span>CONTEXT</span>

            <h2>
              ONE ORGANISATION.
              <br />
              MANY DIGITAL SYSTEMS.
            </h2>
          </div>

          <div className="case-section-copy">

            <p>
              Large enterprise environments often require
              users to work across multiple applications,
              each serving a different business function.
            </p>

            <p>
              EKAMEV was conceived as a unified identity
              and access-management experience that gives
              internal users a single entry point into the
              organisation's application ecosystem.
            </p>

            <p className="case-source-note">
              RBI's public annual report describes EKAMEV
              as a secure Single Sign-On portal for internal
              users and identifies it as the Phase II
              identity and access-management solution.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          WHY THIS MATTERS
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          02
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>THE UX PROBLEM</span>

            <h2>
              ACCESS SHOULD
              <br />
              FEEL SIMPLE.
            </h2>

          </div>

          <div className="case-section-copy">

            <p>
              The challenge was not simply to create another
              login screen. The experience needed to make a
              security-critical journey feel predictable,
              understandable and efficient.
            </p>

            <p>
              Users needed a clear path from authentication
              to the applications they were authorised to use,
              while the interface had to accommodate multiple
              authentication mechanisms without becoming
              visually or cognitively overwhelming.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          RESEARCH
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          03
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>RESEARCH</span>

            <h2>
              UNDERSTANDING
              <br />
              THE ACCESS JOURNEY.
            </h2>

          </div>

          <div className="case-section-copy">

            <p>
              The research direction focused on the complete
              authentication journey rather than treating the
              login screen as an isolated interface.
            </p>

            <div className="research-list">

              <div className="research-item">
                <span>01</span>
                <div>
                  <strong>ENTRY</strong>
                  <p>
                    How does a user understand where
                    to begin?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>02</span>
                <div>
                  <strong>AUTHENTICATION</strong>
                  <p>
                    How can multiple authentication
                    methods remain clear?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>03</span>
                <div>
                  <strong>RECOVERY</strong>
                  <p>
                    What happens when authentication
                    does not go as expected?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>04</span>
                <div>
                  <strong>DESTINATION</strong>
                  <p>
                    How quickly can a user move from
                    authentication to the right application?
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          DESIGN PRINCIPLES
      ================================================== */}

      <section className="case-principles">

        <div className="case-section-number">
          04
        </div>

        <div className="case-principles-content">

          <span>DESIGN PRINCIPLES</span>

          <h2>
            REMOVE FRICTION.
            <br />
            KEEP TRUST.
          </h2>

          <div className="principles-grid">

            <article>
              <div className="principle-index">
                01
              </div>

              <h3>
                CLARITY
              </h3>

              <p>
                Every step of the authentication journey
                should have a clear purpose and hierarchy.
              </p>
            </article>


            <article>
              <div className="principle-index">
                02
              </div>

              <h3>
                CONSISTENCY
              </h3>

              <p>
                Authentication patterns should remain
                predictable across the experience.
              </p>
            </article>


            <article>
              <div className="principle-index">
                03
              </div>

              <h3>
                SECURITY
              </h3>

              <p>
                Security-critical actions should communicate
                confidence without adding unnecessary friction.
              </p>
            </article>


            <article>
              <div className="principle-index">
                04
              </div>

              <h3>
                SPEED
              </h3>

              <p>
                Once authenticated, users should reach their
                intended destination with minimal effort.
              </p>
            </article>

          </div>

        </div>

      </section>


      {/* ==================================================
          FLOW
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          05
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>USER FLOW</span>

            <h2>
              FROM IDENTITY
              <br />
              TO DESTINATION.
            </h2>

          </div>

          <div className="case-flow">

            <div className="flow-step">
              <div className="flow-number">
                01
              </div>

              <h3>
                ENTRY
              </h3>

              <p>
                User arrives at the unified
                authentication experience.
              </p>
            </div>


            <div className="flow-arrow">
              →
            </div>


            <div className="flow-step">
              <div className="flow-number">
                02
              </div>

              <h3>
                AUTHENTICATE
              </h3>

              <p>
                User selects or completes the
                available authentication method.
              </p>
            </div>


            <div className="flow-arrow">
              →
            </div>


            <div className="flow-step">
              <div className="flow-number">
                03
              </div>

              <h3>
                VERIFY
              </h3>

              <p>
                System confirms identity and access.
              </p>
            </div>


            <div className="flow-arrow">
              →
            </div>


            <div className="flow-step">
              <div className="flow-number">
                04
              </div>

              <h3>
                CONTINUE
              </h3>

              <p>
                User proceeds to the appropriate
                enterprise application.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          LOGIN DESIGN
      ================================================== */}

      <section className="case-showcase">

        <div className="showcase-heading">

          <span>06 / EXPERIENCE</span>

          <h2>
            THE LOGIN
            <br />
            EXPERIENCE.
          </h2>

          <p>
            A focused authentication interface designed
            to keep the entry point simple while supporting
            a broader enterprise identity ecosystem.
          </p>

        </div>


        <div className="showcase-screen">

          <img
            src="/ekameva.png"
            alt="EKAMEV authentication experience"
          />

        </div>

      </section>


      {/* ==================================================
          INFORMATION ARCHITECTURE
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          07
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>INFORMATION ARCHITECTURE</span>

            <h2>
              MAKE THE
              <br />
              COMPLEX INVISIBLE.
            </h2>

          </div>

          <div className="case-section-copy">

            <p>
              The experience was structured around the user's
              primary goal: authenticate once and move forward.
            </p>

            <p>
              Supporting information, recovery actions and
              alternate authentication paths are treated as
              secondary layers rather than competing with
              the primary task.
            </p>

            <div className="ia-diagram">

              <div className="ia-root">
                EKAMEV
              </div>

              <div className="ia-line" />

              <div className="ia-items">

                <span>
                  AUTHENTICATION
                </span>

                <span>
                  IDENTITY
                </span>

                <span>
                  ACCESS
                </span>

                <span>
                  APPLICATIONS
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          UI SYSTEM
      ================================================== */}

      <section className="case-system">

        <div className="case-section-number">
          08
        </div>

        <div className="system-content">

          <span>DESIGN SYSTEM</span>

          <h2>
            A SYSTEM,
            <br />
            NOT A SCREEN.
          </h2>

          <p>
            The interface was treated as part of a larger
            product language rather than as a standalone
            login page. Typography, spacing, hierarchy,
            states and interaction patterns were considered
            as reusable building blocks.
          </p>


          <div className="system-grid">

            <div>
              <span>TYPE</span>

              <strong>
                LARGE / CLEAR
              </strong>
            </div>

            <div>
              <span>LAYOUT</span>

              <strong>
                STRUCTURED
              </strong>
            </div>

            <div>
              <span>STATES</span>

              <strong>
                PREDICTABLE
              </strong>
            </div>

            <div>
              <span>INTERACTION</span>

              <strong>
                MINIMAL
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          MY ROLE
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          09
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>MY CONTRIBUTION</span>

            <h2>
              FROM FLOW
              <br />
              TO INTERFACE.
            </h2>

          </div>

          <div className="case-section-copy">

            <p>
              I worked across the experience from the
              authentication entry point through to the
              application dashboard, translating the
              underlying complexity into a focused,
              structured user journey.
            </p>

            <div className="role-list">

              <div>
                <span>01</span>
                UX FLOWS
              </div>

              <div>
                <span>02</span>
                INFORMATION ARCHITECTURE
              </div>

              <div>
                <span>03</span>
                WIREFRAMING
              </div>

              <div>
                <span>04</span>
                UI DESIGN
              </div>

              <div>
                <span>05</span>
                PROTOTYPING
              </div>

              <div>
                <span>06</span>
                DESIGN SYSTEM
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          OUTCOME
      ================================================== */}

      <section className="case-outcome">

        <div className="case-section-number">
          10
        </div>

        <div className="outcome-content">

          <span>OUTCOME</span>

          <h2>
            COMPLEXITY
            <br />
            BECOMES CLARITY.
          </h2>

          <p>
            The project was an exercise in simplifying a
            security-sensitive enterprise journey without
            hiding the complexity that sits behind it.
          </p>

          <p>
            The resulting experience brings identity,
            authentication and application access into a
            clearer and more cohesive entry point.
          </p>

        </div>

      </section>


      {/* ==================================================
          PUBLIC CONTEXT
      ================================================== */}

      <section className="case-source">

        <span>
          PUBLIC CONTEXT
        </span>

        <p>
          RBI's Annual Report identifies EKAMEV as its
          secure Single Sign-On portal for internal users
          and describes it as the Phase II Identity and
          Access Management solution. The currently
          accessible EKAMEV login also exposes username /
          password, QR and biometric / PIN authentication
          paths.
        </p>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="case-footer">

        <button
          className="case-back"
          onClick={onBack}
        >
          <span>←</span>
          BACK TO SELECTED WORK
        </button>

        <div>
          SWARAJ KHADSE / 2026
        </div>

      </footer>

    </main>
  );
}

export default EkamevaCaseStudy;