"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import Switch from "@/components/shared/input/Switch";
import type { MenuState } from "../types";

type Props = { state: MenuState; update: <K extends keyof MenuState>(key: K, value: MenuState[K]) => void };

export default function ItemsSection({ state, update }: Props) {
  return <SectionCard title="Items" subtitle="Items controls for native menu generation."><Slider label="Item count" value={state.itemCount} min={1} max={14} step={1} onChange={(value) => update("itemCount", value)} />
<Slider label="Groups" value={state.groupCount} min={1} max={8} step={1} onChange={(value) => update("groupCount", value)} />
<Slider label="Submenus" value={state.submenuCount} min={0} max={5} step={1} onChange={(value) => update("submenuCount", value)} />
<Switch label="Checkbox/radio items" checked={state.checkableItems} onChange={(value) => update("checkableItems", value)} />
<Switch label="Show shortcuts" checked={state.showShortcuts ?? true} onChange={(value) => update("showShortcuts", value)} /></SectionCard>;
}
