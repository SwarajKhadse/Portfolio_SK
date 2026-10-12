export default function TaxiSection() {
    return (
      <div className="taxi-section" aria-label="Taxi journey">
        <div className="taxi-overlay">
          <div className="taxi-copy">
            <div className="taxi-kicker">02 / TAXI</div>
            <div className="taxi-rule" />
  
            <div className="taxi-label">
              THE JOURNEY
              <br />
              BEGINS.
            </div>
  
            <p>
              Every journey starts
              <br />
              before the runway.
            </p>
          </div>
  
          <div className="taxi-route" aria-hidden="true">
            <span>GATE</span>
            <div className="taxi-route-line" />
            <span>TAXI</span>
            <div className="taxi-route-arrow">↓</div>
          </div>
  
          <div className="taxi-side-note" aria-hidden="true">
            <span>02</span>
            <strong>TAXIWAY</strong>
            <small>FOLLOW THE LINE</small>
          </div>
  
          <div className="taxi-footer">
            <span>© 2026 SWARAJ KHADSE</span>
            <span>CONTINUOUS FLIGHT / 02</span>
            <span>
              SCROLL
              <b>↓</b>
            </span>
          </div>
        </div>
      </div>
    );
  }
  