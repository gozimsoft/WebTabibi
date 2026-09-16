/**
 * Analytics Utility for Tabibi
 * PHASE 02F: Respecte le choix de confidentialitأ© de l'utilisateur (Loi 18-07).
 * - Si tabibi_analytics_disabled === "true" => aucun tracking.
 * - Les donnأ©es trackأ©es sont uniquement des أ©vأ©nements fonctionnels sans donnأ©es de santأ©.
 */

const SESSION_KEY = "tabibi_analytics_session";
const VISITOR_KEY = "tabibi_analytics_visitor";
const DISABLED_KEY = "tabibi_analytics_disabled";

class Analytics {
  constructor() {
    this.sessionId = this._getOrCreateSession();
    this.visitorId = this._getOrCreateVisitor();
    this.userId = null;
  }

  get enabled() {
    // Vأ©rification أ  chaque accأ¨s pour reflأ©ter le choix le plus rأ©cent de l'utilisateur
    return typeof localStorage !== "undefined" &&
      localStorage.getItem(DISABLED_KEY) !== "true";
  }

  _getOrCreateSession() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = (typeof window !== "undefined" && window.crypto?.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  _getOrCreateVisitor() {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = (typeof window !== "undefined" && window.crypto?.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  }

  setUserId(id) {
    this.userId = id;
  }

  /** Active l'analytics (appelأ© par CookiesPrivacyModal sur accept) */
  enable() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(DISABLED_KEY);
    }
  }

  /** Dأ©sactive l'analytics (appelأ© par CookiesPrivacyModal sur opt-out) */
  disable() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISABLED_KEY, "true");
    }
  }

  track(eventName, metadata = {}) {
    // Blocage immأ©diat si l'utilisateur a refusأ© le tracking
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

    // Envoi vers le backend Tabibi uniquement (aucun tiers)
    // fetch('/api/analytics/track', { method: 'POST', body: JSON.stringify(payload) });
    void payload; // prأ©parأ© mais non envoyأ© أ  des tiers
  }
}

const analytics = new Analytics();
export default analytics;

