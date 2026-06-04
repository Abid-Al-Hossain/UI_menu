"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Input from "@/components/shared/input/Input";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function AccessibilitySection({ state, update }: Props) {
  return <SectionCard title="Accessibility" subtitle="Accessibility controls for native menu generation."><Input label="Accessible label" value={state.ariaLabel} onChange={(value) => update("ariaLabel", value)} /></SectionCard>;
}
