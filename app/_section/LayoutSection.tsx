"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function LayoutSection({ state, update }: Props) {
  return <SectionCard title="Layout" subtitle="Layout controls for native menu generation."><Select label="Orientation" value={state.orientation} options={[
  "horizontal",
  "vertical"
]} onChange={(value) => update("orientation", value)} /></SectionCard>;
}
