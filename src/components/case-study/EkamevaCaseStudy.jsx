import "./EkamevaCaseStudy.css";

function EkamevaCaseStudy({ onBack }) {
  return (
    <main className="ekameva-case-study">

      {/* ==================================================
          Fixed Case Study Header
      ================================================== */}

      <header className="case-header">

        <button
          className="case-back"
          onClick={onBack}
        >
          <span>←</span>
          Back To Work
        </button>

        <div className="case-header-center">
          EKAMEV / Case Study
        </div>

        <div className="case-header-right">
          RBI / 01
        </div>

      </header>


      {/* ==================================================
          Hero
      ================================================== */}

      <section className="case-hero">

        <div className="case-hero-content">

          <div className="case-number">
            01 / Enterprise Product
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

          <img
            src="/ekameva-portfolio.webp"
            alt="EKAMEV interface"
          />

        </div>

      </section>


      {/* ==================================================
          Project Snapshot
      ================================================== */}

      <section className="case-snapshot">

        <div className="snapshot-item">
          <span>Client</span>
          Reserve Bank of India
        </div>

        <div className="snapshot-item">
          <span>Domain</span>
          Enterprise / Banking
        </div>

        <div className="snapshot-item">
          <span>Role</span>
          Product Designer
        </div>

        <div className="snapshot-item">
          <span>Discipline</span>
          UX / UI
        </div>

        <div className="snapshot-item">
          <span>Year</span>
          2026
        </div>

      </section>


      {/* ==================================================
          Context
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          01
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">
            <span>Context</span>

            <h2>
              One Organisation.
              <br />
              Many Digital Systems.
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
          Why This Matters
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          02
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>The UX Problem</span>

            <h2>
              Access Should
              <br />
              Feel Simple.
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
          Research
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          03
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>Research</span>

            <h2>
              Understanding
              <br />
              The Access Journey.
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
                  <strong>Entry</strong>
                  <p>
                    How does a user understand where
                    to begin?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>02</span>
                <div>
                  <strong>Authentication</strong>
                  <p>
                    How can multiple authentication
                    methods remain clear?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>03</span>
                <div>
                  <strong>Recovery</strong>
                  <p>
                    What happens when authentication
                    does not go as expected?
                  </p>
                </div>
              </div>

              <div className="research-item">
                <span>04</span>
                <div>
                  <strong>Destination</strong>
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
          Design Principles
      ================================================== */}

      <section className="case-principles">

        <div className="case-section-number">
          04
        </div>

        <div className="case-principles-content">

          <span>Design Principles</span>

          <h2>
            Remove Friction.
            <br />
            Keep Trust.
          </h2>

          <div className="principles-grid">

            <article>
              <div className="principle-index">
                01
              </div>

              <h3>
                Clarity
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
                Consistency
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
                Security
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
                Speed
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
          Flow
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          05
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>User Flow</span>

            <h2>
              From Identity
              <br />
              To Destination.
            </h2>

          </div>

          <div className="case-flow">

            <div className="flow-step">
              <div className="flow-number">
                01
              </div>

              <h3>
                Entry
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
                Authenticate
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
                Verify
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
                Continue
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
          Login Design
      ================================================== */}

      <section className="case-showcase">

        <div className="showcase-heading">

          <span>06 / Experience</span>

          <h2>
            The Login
            <br />
            Experience.
          </h2>

          <p>
            A focused authentication interface designed
            to keep the entry point simple while supporting
            a broader enterprise identity ecosystem.
          </p>

        </div>


        <div className="showcase-screen">

          <img
            src="/ekameva-portfolio.webp"
            alt="EKAMEV authentication experience"
          />

        </div>

      </section>


      {/* ==================================================
          Information Architecture
      ================================================== */}

      <section className="case-section">

        <div className="case-section-number">
          07
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>Information Architecture</span>

            <h2>
              Make The
              <br />
              Complex Invisible.
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
                  Authentication
                </span>

                <span>
                  Identity
                </span>

                <span>
                  Access
                </span>

                <span>
                  Applications
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          UI System
      ================================================== */}

      <section className="case-system">

        <div className="case-section-number">
          08
        </div>

        <div className="system-content">

          <span>Design System</span>

          <h2>
            A System,
            <br />
            Not A Screen.
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
              <span>Type</span>

              <strong>
                Large / Clear
              </strong>
            </div>

            <div>
              <span>Layout</span>

              <strong>
                Structured
              </strong>
            </div>

            <div>
              <span>States</span>

              <strong>
                Predictable
              </strong>
            </div>

            <div>
              <span>Interaction</span>

              <strong>
                Minimal
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          My Role
      ================================================== */}

      <section className="case-section case-dark">

        <div className="case-section-number">
          09
        </div>

        <div className="case-section-main">

          <div className="case-section-heading">

            <span>My Contribution</span>

            <h2>
              From Flow
              <br />
              To Interface.
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
                UX Flows
              </div>

              <div>
                <span>02</span>
                Information Architecture
              </div>

              <div>
                <span>03</span>
                Wireframing
              </div>

              <div>
                <span>04</span>
                UI Design
              </div>

              <div>
                <span>05</span>
                Prototyping
              </div>

              <div>
                <span>06</span>
                Design System
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          Outcome
      ================================================== */}

      <section className="case-outcome">

        <div className="case-section-number">
          10
        </div>

        <div className="outcome-content">

          <span>Outcome</span>

          <h2>
            Complexity
            <br />
            Becomes Clarity.
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
          Public Context
      ================================================== */}

      <section className="case-source">

        <span>
          Public Context
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
          Footer
      ================================================== */}

      <footer className="case-footer">

        <button
          className="case-back"
          onClick={onBack}
        >
          <span>←</span>
          Back To Selected Work
        </button>

        <div>
          Swaraj Khadse / 2026
        </div>

      </footer>

    </main>
  );
}

export default EkamevaCaseStudy;