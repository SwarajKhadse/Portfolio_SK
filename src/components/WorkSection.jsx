import "./WorkSection.css";

function WorkSection({ onOpenCaseStudy }) {
  return (
    <section className="work-section">
      <div className="work-header">
        <span className="work-label">Selected Work</span>
        <span className="work-year">Product · Systems · Digital</span>
      </div>

      <div className="work-intro">
        <div>
          <span className="work-eyebrow">A Few Things I’ve Helped Shape</span>
          <h2>Real Work.<br /><span>Real Impact.</span></h2>
        </div>
        <p>Three projects. Different problems. One focus: making complex digital experiences easier to use.</p>
      </div>

      <div className="project-grid">
        <article className="project-card project-card--hrms">
          <div className="project-card-topline"><span>01</span><span>Enterprise Product</span></div>
          <div className="project-art project-art--hrms" aria-hidden="true">
            <span className="project-art-overline">Enterprise · People Systems</span>
            <strong>eHRMS</strong>
            <span className="project-art-caption">Employee Lifecycle</span>
          </div>
          <div className="project-card-copy">
            <h3>eHRMS Platform</h3>
            <p>Enterprise human resource management across employee lifecycle workflows.</p>
            <div className="project-card-tags"><span>Product Design</span><span>Design Systems</span><span>Enterprise UX</span></div>
          </div>
        </article>

        <article className="project-card project-card--ekameva">
          <div className="project-card-topline"><span>02</span><span>Single Sign-On</span></div>
          <div className="project-image-wrap">
            <img src="/ekameva-portfolio.webp" alt="Ekameva Single Sign-On application interface" />
          </div>
          <div className="project-card-copy">
            <h3>Ekameva SSO</h3>
            <p>A unified access experience for multiple enterprise banking applications.</p>
            <div className="project-card-tags"><span>UX / UI</span><span>Workflow Design</span></div>
            <button type="button" className="project-button" onClick={onOpenCaseStudy}>View Case Study <span aria-hidden="true">↗</span></button>
          </div>
        </article>

        <article className="project-card project-card--udgam">
          <div className="project-card-topline"><span>03</span><span>Digital Portal</span></div>
          <div className="project-art project-art--udgam" aria-hidden="true">
            <span className="project-art-overline">Information · Discovery · Access</span>
            <strong>UDGAM<span>.</span></strong>
            <span className="project-art-caption">Unclaimed Deposits Portal</span>
          </div>
          <div className="project-card-copy">
            <h3>UDGAM Portal</h3>
            <p>A clearer portal experience for finding information across a complex service.</p>
            <div className="project-card-tags"><span>Information Architecture</span><span>Accessibility</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default WorkSection;
