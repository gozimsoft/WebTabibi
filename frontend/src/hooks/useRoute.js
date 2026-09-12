// src/hooks/useRoute.js
import { useState, useEffect, useCallback } from "react";

export function useRoute() {
  const parse = () => {
    let h = window.location.hash.slice(1);
    if (!h) {
      const p = window.location.pathname;
      if (p && p !== "/" && p !== "/index.html") {
        h = p;
        // مزامنة وتوحيد الرابط في شريط المتصفح تلقائياً
        try {
          window.history.replaceState(null, "", window.location.origin + "/#" + p + window.location.search);
        } catch (_) {}
      }
    }
    h = h || "/";
    let [path, qs] = h.split("?");
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return { path: path || "/", qs: qs || "" };
  };
  
  const [loc, setLoc] = useState(parse);

  useEffect(() => {
    const h = () => setLoc(parse());
    window.addEventListener("hashchange", h);
    window.addEventListener("popstate", h);
    return () => {
      window.removeEventListener("hashchange", h);
      window.removeEventListener("popstate", h);
    };
  }, []);

  const navigate = useCallback((path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route: loc.path, qs: loc.qs, navigate };
}
