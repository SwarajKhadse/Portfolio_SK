import "./WorkSection.css";

function WorkSection({ onOpenCaseStudy }) {
  return (
    <section className="work-section">
      <div className="work-header">
        <span className="work-label">selected work</span>
        <span className="work-year">product · systems · digital</span>
      </div>

      <div className="work-intro">
        <div>
          <span className="work-eyebrow">a few things i’ve helped shape</span>
          <h2>real work.<br /><span>real impact.</span></h2>
        </div>
        <p>three projects. different problems. one focus: making complex digital experiences easier to use.</p>
      </div>

      <div className="project-grid">
        <article className="project-card project-card--hrms">
          <div className="project-card-topline"><span>01</span><span>enterprise product</span></div>
          <div className="project-art project-art--hrms" aria-hidden="true">
            <span className="project-art-overline">employee lifecycle</span>
            <strong>eHRMS</strong>
            <span className="project-art-route"><i /><i /><i /><i /></span>
          </div>
          <div className="project-card-copy">
            <h3>eHRMS platform</h3>
            <p>enterprise human resource management across employee lifecycle workflows.</p>
            <div className="project-card-tags"><span>product design</span><span>design systems</span><span>enterprise ux</span></div>
          </div>
        </article>

        <article className="project-card project-card--ekameva">
          <div className="project-card-topline"><span>02</span><span>single sign-on</span></div>
          <div className="project-image-wrap">
            <img src="/ekameva.png" alt="ekameva single sign-on application interface" />
          </div>
          <div className="project-card-copy">
            <h3>ekameva sso</h3>
            <p>a unified access experience for multiple enterprise banking applications.</p>
            <div className="project-card-tags"><span>ux / ui</span><span>workflow design</span></div>
            <button type="button" className="project-button" onClick={onOpenCaseStudy}>view case study <span aria-hidden="true">↗</span></button>
          </div>
        </article>

        <article className="project-card project-card--udgam">
          <div className="project-card-topline"><span>03</span><span>digital portal</span></div>
          <div className="project-art project-art--udgam" aria-hidden="true">
            <span className="project-art-overline">learning · discovery · access</span>
            <strong>udgam<span>.</span></strong>
            <span className="project-art-route"><i /><i /><i /><i /></span>
          </div>
          <div className="project-card-copy">
            <h3>udgam portal</h3>
            <p>a clearer portal experience for finding information across a complex service.</p>
            <div className="project-card-tags"><span>information architecture</span><span>accessibility</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default WorkSection;
