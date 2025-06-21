import React from "react";
import Hero from "@/components/Hero";

const page = () => {
  return (
    <>
      <main className="flex flex-col items-center justify-center m-auto gap-5 md:gap-10 p-5 md:p-20 pt-20 md:pt-28 min-h-screen w-full">
        <Hero />
      </main>
    </>
  );
};

export default page;
