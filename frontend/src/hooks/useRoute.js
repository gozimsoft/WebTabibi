// src/hooks/useRoute.js
import { useState, useEffect, useCallback } from "react";

export function useRoute() {
  const parse = () => {
    let h = window.location.hash.slice(1);
    let p = window.location.pathname;

    // Normaliser le chemin
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    if (p === "/index.html") p = "/";

    let rawPath = "/";
    let qs = "";

    // 1. Si ouvert avec hash '#/app' ou '#app', convertir automatiquement vers le lien propre '/app'
    if (h === "/app" || h === "app" || h.startsWith("/app?") || h.startsWith("app?")) {
      const parts = h.replace(/^app/, "/app").split("?");
      rawPath = "/app";
      qs = parts[1] || window.location.search.slice(1) || "";
      try {
        const cleanUrl = "/app" + (qs ? `?${qs}` : "");
        window.history.replaceState(null, "", cleanUrl);
      } catch (_) {}
    } else if (p === "/app") {
      // 2. Accès direct via '/app'
      rawPath = "/app";
      qs = window.location.search.slice(1) || "";
    } else if (h) {
      // 3. Routage standard par hash (ex: '#/search', '#/login')
      const [pathPart, qsPart] = h.split("?");
      rawPath = pathPart.startsWith("/") ? pathPart : "/" + pathPart;
      qs = qsPart || "";
    } else if (p && p !== "/") {
      // 4. Tout autre chemin direct (fallback)
      rawPath = p;
      qs = window.location.search.slice(1) || "";
    }

    if (rawPath.length > 1 && rawPath.endsWith("/")) {
      rawPath = rawPath.slice(0, -1);
    }

    return { path: rawPath || "/", qs: qs || "" };
  };

  const [loc, setLoc] = useState(parse);

  useEffect(() => {
    const handleLocationChange = () => setLoc(parse());
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigate = useCallback((target) => {
    if (!target) return;
    let [targetPath, targetQs] = target.split("?");
    const queryString = targetQs ? `?${targetQs}` : "";

    // 1. Navigation vers '/app' sans hash
    if (targetPath === "/app") {
      try {
        window.history.pushState(null, "", "/app" + queryString);
        setLoc(parse());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    // 2. Navigation vers '/' depuis '/app'
    if (targetPath === "/" && window.location.pathname === "/app") {
      try {
        window.history.pushState(null, "", "/" + queryString);
        setLoc(parse());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    // 3. Si on quitte '/app' vers une autre route, réinitialiser le pathname pour éviter '/app#/route'
    if (window.location.pathname === "/app") {
      try {
        const hashTarget = target.startsWith("#") ? target : "#" + (target.startsWith("/") ? target : "/" + target);
        window.history.pushState(null, "", "/" + hashTarget);
        setLoc(parse());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    // 4. Navigation classique
    window.location.hash = target.startsWith("#") ? target.slice(1) : target;
    setLoc(parse());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route: loc.path, qs: loc.qs, navigate };
}
