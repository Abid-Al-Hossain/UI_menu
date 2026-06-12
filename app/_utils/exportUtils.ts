import type { MenuState } from "../types";

export type ExportPayload = { fileName: string; mimeType: "text/plain;charset=utf-8"; content: string };

export function buildExportPayload(state: MenuState, fileName = "menu"): ExportPayload {
  return { fileName: `${fileName || "menu"}.jsx`, mimeType: "text/plain;charset=utf-8", content: buildReactCode(state) };
}

export function buildReactCode(state: MenuState) {
  return `import * as React from "react";

const state = ${JSON.stringify(state, null, 2)};

function buildItems(model) {
  return Array.from({ length: model.itemCount }, (_, index) => {
    const role = model.checkableItems && index === 2 ? "menuitemcheckbox" : model.checkableItems && index === 4 ? "menuitemradio" : "menuitem";

    return {
      id: model.id + "-item-" + (index + 1),
      label: model.label + " " + (index + 1),
      shortcut: index % 2 === 0 ? "Alt+" + (index + 1) : "Ctrl+" + (index + 1),
      role,
      checked: role !== "menuitem" && index % 2 === 0,
      disabled: model.disabled || (model.itemCount > 5 && index === model.itemCount - 1),
      hasSubmenu: index < model.submenuCount,
    };
  });
}

function itemStyle(model, active, disabled) {
  return {
    border: 0,
    borderRadius: 12,
    padding: "10px 12px",
    background: active ? model.accent : "transparent",
    color: disabled ? model.muted : active ? "#020617" : model.foreground,
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left",
    fontWeight: 700,
    transition: model.motion ? "background 150ms ease, color 150ms ease" : "none",
  };
}

export default function MenuComponent() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [submenuOpen, setSubmenuOpen] = React.useState(state.previewState !== "closed" && state.submenuCount > 0);
  const items = buildItems(state);
  const activeItem = items[activeIndex];
  const isVertical = state.orientation === "vertical";
  const groupCount = Math.max(1, Math.min(state.groupCount, items.length));
  const groupSize = Math.ceil(items.length / groupCount);
  const side = state.side ?? "bottom";
  const align = state.align ?? "start";
  const offset = state.offset ?? 8;
  const submenuStyle = {
    marginTop: side === "bottom" ? offset : 0,
    marginRight: side === "left" ? offset : 0,
    marginBottom: side === "top" ? offset : 0,
    marginLeft: side === "right" ? offset : 0,
    alignSelf: align === "center" ? "center" : align === "end" ? "flex-end" : "flex-start",
  };

  const move = (direction) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
    setSubmenuOpen(true);
  };

  const handleKeyDown = (event) => {
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

  const selectItem = (item) => {
    if (item.disabled) return;
    if (state.dismissOnSelect ?? true) setSubmenuOpen(false);
  };

  return (
    <section
      id={state.id}
      aria-label={state.ariaLabel}
      style={{
        width: state.width,
        minHeight: state.height,
        padding: state.padding,
        borderRadius: state.radius,
        border: state.borderWidth + "px solid " + state.border,
        boxShadow: "0 " + Math.round(state.shadow / 3) + "px " + state.shadow + "px rgba(0,0,0,.28)",
        background: state.background,
        color: state.foreground,
        fontFamily: state.fontFamily,
        opacity: state.disabled ? 0.55 : 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: state.gap,
      }}
    >
      <div>
        <p style={{ margin: 0, color: state.muted, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>{state.title}</p>
        <h3 style={{ margin: "8px 0 0", fontSize: state.titleSize, fontWeight: state.fontWeight }}>{state.description}</h3>
      </div>

      <div
        role={state.role}
        aria-label={state.ariaLabel}
        aria-orientation={state.orientation}
        tabIndex={state.disabled ? -1 : state.tabIndex}
        onKeyDown={handleKeyDown}
        style={{
          display: isVertical ? "grid" : "flex",
          flexWrap: "wrap",
          maxWidth: isVertical ? 320 : "none",
          gap: 8,
          borderRadius: 18,
          border: "1px solid " + state.border,
          padding: 8,
          background: "rgba(255,255,255,.055)",
          outline: 0,
        }}
      >
        {Array.from({ length: groupCount }, (_, groupIndex) => {
          const groupItems = items.slice(groupIndex * groupSize, (groupIndex + 1) * groupSize);
          if (!groupItems.length) return null;

          return (
            <div key={groupIndex} role="group" aria-label={"Menu group " + (groupIndex + 1)} style={{ display: isVertical ? "grid" : "contents", gap: 4 }}>
              {groupIndex > 0 ? <div role="separator" style={isVertical ? { height: 1, margin: "4px 0", background: state.border } : { width: 1, margin: "0 4px", background: state.border }} /> : null}
              {groupItems.map((item, itemIndex) => {
                const absoluteIndex = groupIndex * groupSize + itemIndex;
                const active = absoluteIndex === activeIndex || state.previewState === "selected";
                const label = (item.role === "menuitemcheckbox" ? (item.checked ? "[x] " : "[ ] ") : item.role === "menuitemradio" ? (item.checked ? "(o) " : "( ) ") : "") + item.label;

                if (item.role === "menuitemcheckbox") {
                  return <button key={item.id} type="button" role="menuitemcheckbox" aria-checked={item.checked} aria-disabled={item.disabled || undefined} aria-haspopup={item.hasSubmenu ? "menu" : undefined} aria-expanded={item.hasSubmenu ? submenuOpen && active : undefined} tabIndex={state.rovingFocus ? (active ? 0 : -1) : state.tabIndex} disabled={item.disabled} onMouseEnter={() => { setActiveIndex(absoluteIndex); setSubmenuOpen(item.hasSubmenu); }} onClick={() => selectItem(item)} style={itemStyle(state, active, item.disabled)}>{label}{state.showShortcuts ?? true ? <span style={{ marginLeft: 10, color: active ? "#020617" : state.muted, fontSize: 12 }}>{item.shortcut}</span> : null}</button>;
                }

                if (item.role === "menuitemradio") {
                  return <button key={item.id} type="button" role="menuitemradio" aria-checked={item.checked} aria-disabled={item.disabled || undefined} aria-haspopup={item.hasSubmenu ? "menu" : undefined} aria-expanded={item.hasSubmenu ? submenuOpen && active : undefined} tabIndex={state.rovingFocus ? (active ? 0 : -1) : state.tabIndex} disabled={item.disabled} onMouseEnter={() => { setActiveIndex(absoluteIndex); setSubmenuOpen(item.hasSubmenu); }} onClick={() => selectItem(item)} style={itemStyle(state, active, item.disabled)}>{label}{state.showShortcuts ?? true ? <span style={{ marginLeft: 10, color: active ? "#020617" : state.muted, fontSize: 12 }}>{item.shortcut}</span> : null}</button>;
                }

                return <button key={item.id} type="button" role="menuitem" aria-disabled={item.disabled || undefined} aria-haspopup={item.hasSubmenu ? "menu" : undefined} aria-expanded={item.hasSubmenu ? submenuOpen && active : undefined} tabIndex={state.rovingFocus ? (active ? 0 : -1) : state.tabIndex} disabled={item.disabled} onMouseEnter={() => { setActiveIndex(absoluteIndex); setSubmenuOpen(item.hasSubmenu); }} onClick={() => selectItem(item)} style={itemStyle(state, active, item.disabled)}>{label}{state.showShortcuts ?? true ? <span style={{ marginLeft: 10, color: active ? "#020617" : state.muted, fontSize: 12 }}>{item.shortcut}</span> : null}</button>;
              })}
            </div>
          );
        })}
      </div>

      {activeItem && activeItem.hasSubmenu && submenuOpen ? (
        <div role="menu" aria-label={activeItem.label + " submenu"} style={{ ...submenuStyle, display: "grid", width: "fit-content", gap: 4, borderRadius: 18, border: "1px solid " + state.border, padding: 8, background: "rgba(2,6,23,.74)" }}>
          <button type="button" role="menuitem" style={{ border: 0, borderRadius: 12, padding: "10px 12px", background: "transparent", color: state.foreground, textAlign: "left" }}>{activeItem.label} overview</button>
          <button type="button" role="menuitem" aria-disabled="true" disabled style={{ border: 0, borderRadius: 12, padding: "10px 12px", background: "transparent", color: state.muted, textAlign: "left" }}>Disabled nested item</button>
        </div>
      ) : null}

      <p style={{ margin: 0, color: state.muted, fontSize: state.bodySize }}>
        {state.helper} Keyboard: {isVertical ? "ArrowUp/ArrowDown" : "ArrowLeft/ArrowRight"} moves focus, Home/End jump, Escape closes submenus. Submenu offset {offset}px.
      </p>
    </section>
  );
}
`;
}
