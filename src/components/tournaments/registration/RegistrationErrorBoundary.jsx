import { Component } from "react";
import { Link } from "react-router-dom";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";

/**
 * Error boundary guarding the tournament registration flow.
 *
 * A render crash anywhere in the wrapped subtree (e.g. registration view or
 * success screen) is caught here instead of unmounting the whole React tree,
 * which previously produced a blank page in production.
 */
export default class RegistrationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Registration view crashed:", error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{tournamentRegistrationStyles}</style>
          <div className="tournament-page" data-game-slug="fc-26">
            <div className="page-shell">
              <div className="page-content">
                <div className="register-card">
                  <div className="success-content">
                    <h1 className="success-title">Something went wrong</h1>
                    <p className="success-message">
                      We hit a snag loading this page. Please try again.
                    </p>
                    <div className="success-cta">
                      <button type="button" className="submit-btn" onClick={this.handleReset}>
                        <span className="btn-text">Try Again</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="back-link">
                  <Link to="/tournaments" className="back-btn">
                    ← Back to Tournaments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}
