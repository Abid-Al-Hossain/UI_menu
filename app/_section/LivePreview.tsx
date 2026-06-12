"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import type { MenuState } from "../types";

type MenuItemRole = "menuitem" | "menuitemcheckbox" | "menuitemradio";

type MenuItem = {
  id: string;
  label: string;
  shortcut: string;
  role: MenuItemRole;
  checked: boolean;
  disabled: boolean;
  hasSubmenu: boolean;
};

function shell(state: MenuState): CSSProperties {
  return {
    width: state.width,
    minHeight: state.height,
    padding: state.padding,
    gap: state.gap,
    borderRadius: state.radius,
    border: `${state.borderWidth}px solid ${state.border}`,
    boxShadow: `0 ${Math.round(state.shadow / 3)}px ${state.shadow}px rgba(0,0,0,.28)`,
    background: state.background,
    color: state.foreground,
    fontFamily: state.fontFamily,
    opacity: state.disabled ? 0.55 : 1,
  };
}

function buildItems(state: MenuState): MenuItem[] {
  return Array.from({ length: state.itemCount }, (_, index) => {
    const role: MenuItemRole =
      state.checkableItems && index === 2 ? "menuitemcheckbox" : state.checkableItems && index === 4 ? "menuitemradio" : "menuitem";

    return {
      id: `${state.id}-item-${index + 1}`,
      label: `${state.label} ${index + 1}`,
      shortcut: index % 2 === 0 ? "Alt+" + (index + 1) : "Ctrl+" + (index + 1),
      role,
      checked: role !== "menuitem" && index % 2 === 0,
      disabled: state.disabled || (state.itemCount > 5 && index === state.itemCount - 1),
      hasSubmenu: index < state.submenuCount,
    };
  });
}

function submenuStyle(state: MenuState): CSSProperties {
  const side = state.side ?? "bottom";
  const align = state.align ?? "start";
  const offset = state.offset ?? 8;

  return {
    marginTop: side === "bottom" ? offset : 0,
    marginRight: side === "left" ? offset : 0,
    marginBottom: side === "top" ? offset : 0,
    marginLeft: side === "right" ? offset : 0,
    alignSelf: align === "center" ? "center" : align === "end" ? "flex-end" : "flex-start",
  };
}

export default function LivePreview({ state }: { state: MenuState }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submenuOpen, setSubmenuOpen] = useState(state.previewState !== "closed" && state.submenuCount > 0);
  const items = buildItems(state);
  const activeItem = items[activeIndex];
  const isVertical = state.orientation === "vertical";
  const groupCount = Math.max(1, Math.min(state.groupCount, items.length));
  const groupSize = Math.ceil(items.length / groupCount);

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
    setSubmenuOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forwardKey = isVertical ? "ArrowDown" : "ArrowRight";
    const backKey = isVertical ? "ArrowUp" : "ArrowLeft";

    if (event.key === forwardKey || event.key === backKey) {
      event.preventDefault();
      move(event.key === forwardKey ? 1 : -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(items.length - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSubmenuOpen(false);
    }
  };

  const selectItem = (item: MenuItem) => {
    if (item.disabled) return;
    if (state.dismissOnSelect ?? true) setSubmenuOpen(false);
  };

  return (
    <section id={state.id} aria-label={state.ariaLabel} style={shell(state)} className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: state.muted }}>
        {state.title}
      </p>
      <h3 className="mt-2" style={{ fontSize: state.titleSize, fontWeight: state.fontWeight }}>
        {state.description}
      </h3>

      <div
        role={state.role}
        aria-label={state.ariaLabel}
        aria-orientation={state.orientation}
        tabIndex={state.disabled ? -1 : state.tabIndex}
        onKeyDown={handleKeyDown}
        className={`mt-5 ${isVertical ? "grid max-w-xs" : "flex flex-wrap"} gap-2 rounded-2xl border p-2 outline-none`}
        style={{ borderColor: state.border, background: "rgba(255,255,255,.055)" }}
      >
        {Array.from({ length: groupCount }, (_, groupIndex) => {
          const groupItems = items.slice(groupIndex * groupSize, (groupIndex + 1) * groupSize);
          if (!groupItems.length) return null;

          return (
            <div key={groupIndex} role="group" aria-label={`Menu group ${groupIndex + 1}`} className={`${isVertical ? "grid" : "contents"} gap-1`}>
              {groupIndex > 0 ? <div role="separator" className={isVertical ? "my-1 h-px" : "mx-1 w-px"} style={{ background: state.border }} /> : null}
              {groupItems.map((item, itemIndex) => {
                const absoluteIndex = groupIndex * groupSize + itemIndex;
                const isActive = absoluteIndex === activeIndex || state.previewState === "selected";

                return (
                  <button
                    key={item.id}
                    type="button"
                    role={item.role}
                    aria-checked={item.role === "menuitem" ? undefined : item.checked}
                    aria-disabled={item.disabled || undefined}
                    aria-haspopup={item.hasSubmenu ? "menu" : undefined}
                    aria-expanded={item.hasSubmenu ? submenuOpen && isActive : undefined}
                    tabIndex={state.rovingFocus ? (isActive ? 0 : -1) : state.tabIndex}
                    disabled={item.disabled}
                    onMouseEnter={() => {
                      setActiveIndex(absoluteIndex);
                      setSubmenuOpen(item.hasSubmenu);
                    }}
                    onClick={() => selectItem(item)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold"
                    style={{
                      background: isActive ? "color-mix(in oklab, " + state.accent + " 24%, transparent)" : "transparent",
                      color: item.disabled ? state.muted : state.foreground,
                      transition: state.motion ? "background 150ms ease, color 150ms ease" : "none",
                    }}
                  >
                    {item.role === "menuitemcheckbox" ? (
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill={item.checked ? "currentColor" : "none"} />
                        {item.checked && <path d="M3.5 7l2.5 2.5 4.5-5" stroke={item.disabled ? state.muted : state.background} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
                      </svg>
                    ) : item.role === "menuitemradio" ? (
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                        {item.checked && <circle cx="7" cy="7" r="3" fill="currentColor" />}
                      </svg>
                    ) : null}
                    <span>{item.label}</span>
                    {item.hasSubmenu ? (
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "auto", flexShrink: 0 }}>
                        <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                    {state.showShortcuts ?? true ? <span className="ml-auto text-xs" style={{ color: state.muted }}>{item.hasSubmenu ? null : item.shortcut}</span> : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {activeItem?.hasSubmenu && submenuOpen ? (
        <div
          role="menu"
          aria-label={`${activeItem.label} submenu`}
          className="mt-3 grid w-fit gap-1 rounded-2xl border p-2"
          style={{ ...submenuStyle(state), borderColor: state.border, background: "rgba(2,6,23,.74)" }}
        >
          <button type="button" role="menuitem" className="rounded-xl px-3 py-2 text-left text-sm" style={{ color: state.foreground }}>
            {activeItem.label} overview
          </button>
          <button type="button" role="menuitem" aria-disabled="true" disabled className="rounded-xl px-3 py-2 text-left text-sm" style={{ color: state.muted }}>
            Disabled nested item
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-xs" style={{ color: state.muted }}>
        {state.helper} Keyboard: {isVertical ? "ArrowUp/ArrowDown" : "ArrowLeft/ArrowRight"} moves focus, Home/End jump, Escape closes submenus. Submenu offset {state.offset ?? 8}px.
      </p>
    </section>
  );
}
