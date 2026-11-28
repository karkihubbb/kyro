import React from "react";
import { createRoot } from "react-dom/client";
import HelixRibbonHero from "./HelixRibbonHero";

const mount = document.getElementById("kyro-hero");

if (mount) {
  createRoot(mount).render(
    <React.StrictMode>
      <HelixRibbonHero
        height="100svh"
        screens={3}
        greeting="WE ARE"
        name="KYRO"
        brand="KYRO®"
        background="#090a0a"
        foreground="#e9e7e1"
        autoPlay={false}
      />
    </React.StrictMode>
  );
}
