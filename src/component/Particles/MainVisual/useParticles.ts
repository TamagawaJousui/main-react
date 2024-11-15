import { useEffect } from "react";

import { trigger } from "./internal/trigger";

export const useParticles = (
  particlesContainerRef: React.RefObject<HTMLDivElement>,
  size: number,
  radius: number
) => {
  useEffect(() => {
    if (!particlesContainerRef.current) {
      console.error("particlesContainerRef is not found");
      return;
    }

    const dispose = trigger(particlesContainerRef.current, size, radius);

    return dispose;
  }, [particlesContainerRef, radius, size]);
};
