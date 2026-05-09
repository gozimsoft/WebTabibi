/**
 * Analytics Utility for Tabibi
 * Implements a scalable, clean event tracking system.
 */

const SESSION_KEY = "tabibi_analytics_session";
const VISITOR_KEY = "tabibi_analytics_visitor";

class Analytics {
  constructor() {
    this.sessionId = this._getOrCreateSession();
    this.visitorId = this._getOrCreateVisitor();
    this.userId = null;
    this.enabled = true;
  }

  _getOrCreateSession() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  _getOrCreateVisitor() {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  }

  setUserId(id) {
    this.userId = id;
  }

  track(eventName, metadata = {}) {
    if (!this.enabled) return;

    const payload = {
      event: eventName,
      user_id: this.userId || "guest",
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page: window.location.hash || "/",
      metadata: {
        ...metadata,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        language: document.documentElement.lang || "fr"
      }
    };

    // Here you would normally send to your backend or analytics provider
    // Example: fetch('/api/analytics/track', { method: 'POST', body: JSON.stringify(payload) });
  }
}

const analytics = new Analytics();
export default analytics;
