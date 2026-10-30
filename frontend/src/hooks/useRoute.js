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
    } else if (p === "/install" || p === "/instal" || p === "/knowledge") {
      // 2b. Accès direct via '/install', '/instal', ou '/knowledge'
      rawPath = p === "/instal" ? "/install" : p;
      qs = window.location.search.slice(1) || "";
      if (p === "/instal") {
        try {
          const cleanUrl = "/install" + (qs ? `?${qs}` : "");
          window.history.replaceState(null, "", cleanUrl);
        } catch (_) {}
      }
    } else if (h) {
      // 3. Routage standard par hash (ex: '#/search', '#/login')
      const [pathPart, qsPart] = h.split("?");
      rawPath = pathPart.startsWith("/") ? pathPart : "/" + pathPart;
      if (rawPath === "/instal") rawPath = "/install";
      qs = qsPart || "";
    } else if (p && p !== "/") {
      // 4. Tout autre chemin direct (fallback)
      rawPath = p;
      if (rawPath === "/instal") rawPath = "/install";
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

    // 1b. Navigation vers '/install' ou '/knowledge' sans hash
    if (targetPath === "/install" || targetPath === "/instal" || targetPath === "/knowledge") {
      try {
        window.history.pushState(null, "", targetPath + queryString);
        setLoc(parse());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    // 2. Navigation vers '/' depuis '/app', '/install' ou '/knowledge'
    if (targetPath === "/" && (window.location.pathname === "/app" || window.location.pathname === "/install" || window.location.pathname === "/instal" || window.location.pathname === "/knowledge")) {
      try {
        window.history.pushState(null, "", "/" + queryString);
        setLoc(parse());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    // 3. Si on quitte une route directe vers une autre route, réinitialiser le pathname
    if (window.location.pathname === "/app" || window.location.pathname === "/install" || window.location.pathname === "/instal" || window.location.pathname === "/knowledge") {
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
