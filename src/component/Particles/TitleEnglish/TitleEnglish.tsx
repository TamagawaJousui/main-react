import { useRef } from "react";

import { useTitleEnglish } from "./useTitleEnglish";

export default function TitleEnglish() {
  const titleEnglishDivRef = useRef<HTMLDivElement>(null);
  useTitleEnglish(titleEnglishDivRef);

  return <div className="absolute w-full h-full" ref={titleEnglishDivRef}></div>;
};
