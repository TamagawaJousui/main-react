import { useRef } from "react";

import { useDateAndVenue } from "./useDateAndVenue";


export default function DateAndVenue() {
  const dateAndVenueDivRef = useRef<HTMLDivElement>(null);
  useDateAndVenue(dateAndVenueDivRef);

  return <div className="absolute w-full h-full" ref={dateAndVenueDivRef}></div>;
};