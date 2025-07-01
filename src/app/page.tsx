"use client";
import React from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import HeroLayout from "@/components/HeroLayout";

export default function Page() {
  return (
    <ParallaxProvider>
      <HeroLayout />
    </ParallaxProvider>
  );
}
