"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Switch from "@/components/shared/input/Switch";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function BehaviorSection({ state, update }: Props) {
  return <SectionCard title="Behavior" subtitle="Behavior controls for native menu generation."><Switch label="Disabled" checked={state.disabled} onChange={(value) => update("disabled", value)} />
<Switch label="Roving focus" checked={state.rovingFocus} onChange={(value) => update("rovingFocus", value)} />
<Switch label="Dismiss on select" checked={state.dismissOnSelect ?? true} onChange={(value) => update("dismissOnSelect", value)} /></SectionCard>;
}
