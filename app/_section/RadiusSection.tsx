"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function RadiusSection({ state, update }: Props) {
  return <SectionCard title="Radius" subtitle="Radius controls for native menu generation."><Slider label="Radius" value={state.radius} min={0} max={56} step={1} onChange={(value) => update("radius", value)} /></SectionCard>;
}
