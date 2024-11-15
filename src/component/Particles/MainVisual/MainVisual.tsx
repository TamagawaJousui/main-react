import { useRef } from "react";

import { useParticles } from "./useParticles";

export default function MainVisual() {
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  useParticles(particlesContainerRef, 1024, 0.7);


  return <div ref={particlesContainerRef}></div>;
}
