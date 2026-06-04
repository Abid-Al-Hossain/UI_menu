"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Switch from "@/components/shared/input/Switch";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function MotionSection({ state, update }: Props) {
  return <SectionCard title="Motion" subtitle="Motion controls for native menu generation."><Switch label="Motion safe" checked={state.motion} onChange={(value) => update("motion", value)} /></SectionCard>;
}
