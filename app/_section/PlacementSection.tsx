"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import Slider from "@/components/shared/input/Slider";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function PlacementSection({ state, update }: Props) {
  return <SectionCard title="Placement" subtitle="Submenu placement controls for native menu generation."><Select label="Submenu side" value={state.side ?? "bottom"} options={[
  "top",
  "right",
  "bottom",
  "left"
]} onChange={(value) => update("side", value)} />
<Select label="Submenu align" value={state.align ?? "start"} options={[
  "start",
  "center",
  "end"
]} onChange={(value) => update("align", value)} />
<Slider label="Submenu offset" value={state.offset ?? 8} min={0} max={48} step={1} onChange={(value) => update("offset", value)} /></SectionCard>;
}
