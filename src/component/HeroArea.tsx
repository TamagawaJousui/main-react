import StaticTitle from "@/assets/heroarea/Title.svg?react";
import StaticTitleEnglish from "@/assets/heroarea/TitleEnglish.svg?react";
import StaticDateAndVenue from "@/assets/heroarea/DateAndVenue.svg?react";

import background_mobile from "@/assets/heroarea/background_mobile.png";
import background_desktop from "@/assets/heroarea/background_desktop.png";

import MainVisual from "./Particles/MainVisual/MainVisual";

// import { isWebGlCapable } from "@/utils/CheckUserEnv";
import { breakpoint } from "@/utils/BreakPoint";
import { useEffect, useState } from "react";

import Title from "./Particles/Title/Title";
import TitleEnglish from "./Particles/TitleEnglish/TitleEnglish";
import DateAndVenue from "./Particles/DateAndVenue/DateAndVenue";

export default function HeroArea() {
  const mediaQuery = window.matchMedia(`(min-width: ${breakpoint.md}px)`);
  const [showParticles, setshowParticles] = useState(
    // mediaQuery.matches && isWebGlCapable()
    false
  );

  useEffect(() => {
    const handleMediaChange = () => {
      // setshowParticles(mediaQuery.matches && isWebGlCapable());
      setshowParticles(false)
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  });

  return (
    <section className="section-container">
      {showParticles ? (
        <DynamicContent />
      ) : (
        <StaticContent />
      )}
    </section>
  );
}

const DynamicContent = () => {
  return (
    <>
    <Title /> 
          <TitleEnglish />
          <DateAndVenue />
          <MainVisual />
    </>
  )
}

const StaticContent = () => {
  return (
    <>
    <StaticTitle className="z-10 absolute top-[10%] left-[5px] h-[60%] md:top-[15%] md:left-[10px] lg:h-[70%] xl:left-[30px]" />
          <StaticTitleEnglish className="z-10 absolute top-12 right-[5px] w-[65%] md:right-[10px] lg:w-[666px] xl:right-[30px]" />
          <StaticDateAndVenue className="z-10 absolute bottom-5 right-[5px] h-[45%] md:bottom-[50px] md:right-[10px] md:h-[50%] xl:right-[30px]" />
          <img
            className="hero-bg-mobile"
            src={background_mobile}
            alt="particle"
          />
          <img
            className="hero-bg-desktop"
            src={background_desktop}
            alt="particle"
          />
    </>
  )
}