"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function StatesSection({ state, update }: Props) {
  return <SectionCard title="State Preview" subtitle="State Preview controls for native menu generation."><Select label="Preview state" value={state.previewState} options={[
  "default",
  "hover",
  "focus",
  "active",
  "open",
  "closed",
  "selected",
  "loading",
  "empty",
  "error",
  "success"
]} onChange={(value) => update("previewState", value)} /></SectionCard>;
}
