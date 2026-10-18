export default function TaxiSection() {
    return (
      <div className="taxi-section" aria-label="Taxi journey">
        <div className="taxi-overlay">
          <div className="taxi-copy">
            <div className="taxi-kicker">02 / Taxi</div>
            <div className="taxi-rule" />
  
            <div className="taxi-label">
              The Journey
              <br />
              Begins.
            </div>
  
            <p>
              Every journey starts
              <br />
              before the runway.
            </p>
          </div>
  
          <div className="taxi-route" aria-hidden="true">
            <span>Gate</span>
            <div className="taxi-route-line" />
            <span>Taxi</span>
            <div className="taxi-route-arrow">↓</div>
          </div>
  
          <div className="taxi-side-note" aria-hidden="true">
            <span>02</span>
            <strong>Taxiway</strong>
            <small>Follow The Line</small>
          </div>
  
          <div className="taxi-footer">
            <span>© 2026 Swaraj Khadse</span>
            <span>Continuous Flight / 02</span>
            <span>
              Scroll
              <b>↓</b>
            </span>
          </div>
        </div>
      </div>
    );
  }
  