// src/hooks/useRoute.js
import { useState, useEffect, useCallback } from "react";

export function useRoute() {
  const parse = () => {
    const h = window.location.hash.slice(1) || "/";
    let [path, qs] = h.split("?");
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return { path: path || "/", qs: qs || "" };
  };
  
  const [loc, setLoc] = useState(parse);

  useEffect(() => {
    const h = () => setLoc(parse());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = useCallback((path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route: loc.path, qs: loc.qs, navigate };
}
