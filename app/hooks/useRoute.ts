import { useState, useEffect } from "react";

export function useRoute() {
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/");

  useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setRoute(path);
  };

  return { route, navigate };
}