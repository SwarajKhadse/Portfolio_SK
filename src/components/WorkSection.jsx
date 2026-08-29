function WorkSection() {
    const projects = [
      {
        number: "01",
        title: "eHRMS",
        category: "ENTERPRISE PRODUCT · UX / UI",
        description:
          "Designing complex employee lifecycle experiences for an enterprise HR platform.",
      },
      {
        number: "02",
        title: "UDGAM",
        category: "PUBLIC PLATFORM · UX",
        description:
          "Redesigning the search experience to make information easier to discover and understand.",
      },
      {
        number: "03",
        title: "RBI TRAVEL",
        category: "SERVICE EXPERIENCE · UI",
        description:
          "Creating a simpler and more structured travel experience.",
      },
      {
        number: "04",
        title: "ACCOUNT AGGREGATOR",
        category: "FINTECH · PRODUCT DESIGN",
        description:
          "Exploring clearer financial journeys and interaction patterns.",
      },
    ];
  
    return (
      <section
        id="work"
        className="work-section"
      >
        <div className="work-topline">
          <span>01 — SELECTED WORK</span>
          <span>2023 — 2026</span>
        </div>
  
        <div className="work-intro">
          <div className="work-eyebrow">
            SELECTED PROJECTS
          </div>
  
          <h2>
            WORK
            <br />
            THAT MATTERS.
          </h2>
  
          <p className="work-description">
            A selection of product, UX and
            interface work focused on solving
            complex problems through simple
            experiences.
          </p>
        </div>
  
        <div className="projects-list">
          {projects.map((project) => (
            <article
              className="work-project"
              key={project.number}
            >
              <div className="project-meta">
                <span>{project.number}</span>
                <span>{project.category}</span>
              </div>
  
              <div className="project-main">
                <div className="project-visual">
                  <span>{project.title}</span>
                </div>
  
                <div className="project-content">
                  <h3>{project.title}</h3>
  
                  <p>
                    {project.description}
                  </p>
  
                  <button
                    type="button"
                    className="project-link"
                  >
                    VIEW CASE STUDY
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }
  
  export default WorkSection;