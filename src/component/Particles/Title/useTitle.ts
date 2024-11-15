import { useEffect } from "react";
import * as THREE from "three";
import { SVGLoader, SVGResult } from "three/addons/loaders/SVGLoader.js";
import { match } from "ts-pattern";

import { ParticleData } from "@/component/Particles/types";

import { Environment } from "./internal/titleEnvironment";

export const useTitle = (titleDivRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    let environment: Environment | null = null;

    // フォントとテクスチャのプリロード
    const preload = (particleOptions: ParticleData) => {
      const manager = new THREE.LoadingManager();

      let svg: SVGResult | null = null;
      let particle: THREE.Texture | null = null;
      manager.onLoad = () => {
        if (svg && particle) {
          console.log("environment");
          console.log(svg);
          console.log(particle);
          environment = new Environment(
            svg,
            particle,
            titleDivRef,
            particleOptions
          );
        }
      };

      const svgUrl = "/heroarea/particle_Title.svg";
      new SVGLoader(manager).load(svgUrl, (data) => {
        svg = data;
      });

      const particleImgUrl = "/heroarea/particle_Texture.png";
      new THREE.TextureLoader(manager).load(particleImgUrl, (texture) => {
        particle = texture;
      });
    };

    const getTextSize = () => {
      if (window.innerWidth > 1024) {
        return 12;
      } else if (window.innerWidth > 768) {
        return 6;
      } else if (window.innerWidth > 500) {
        return 4;
      } else {
        return 4;
      }
    };

    const particleOptions: ParticleData = {
      text: "付いて離れて",
      planeParticleAmount: 300,
      outlineParticleAmount: 20,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: getTextSize(),
      area: 100,
      ease: 0.05,
    };

    (() => {
      const state = document.readyState;
      match(state)
        .with("complete", () => {
          preload(particleOptions);
        })
        .with("loading", () => {
          match(document.documentElement.scrollTop === 0)
            .with(false, () => {
              preload(particleOptions);
            })
            .otherwise(() => {
              document.addEventListener("DOMContentLoaded", () =>
                preload(particleOptions)
              );
            });
        })
        .otherwise(() => {
          preload(particleOptions);
        });
    })();

    // クリーンアップ
    return () => {
      if (environment) {
        environment = null;
      }
      document.removeEventListener("DOMContentLoaded", () =>
        preload(particleOptions)
      );
    };
  }, [titleDivRef]);
};
