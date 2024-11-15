import { useRef } from "react";

import { useTitle } from "./useTitle";

export default function Title() {
  const titleDivRef = useRef<HTMLDivElement>(null);
  useTitle(titleDivRef);

  return <div className="absolute w-full h-full" ref={titleDivRef}></div>;
};