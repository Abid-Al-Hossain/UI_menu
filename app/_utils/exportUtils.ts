import type { MenuState } from "../types";

export type ExportPayload = { fileName: string; mimeType: "text/plain;charset=utf-8"; content: string };

export function buildExportPayload(state: MenuState, fileName = "menu"): ExportPayload {
  return { fileName: `${fileName || "menu"}.jsx`, mimeType: "text/plain;charset=utf-8", content: buildReactCode(state) };
}

export function buildReactCode(state: MenuState) {
  return `import * as React from "react";

const state = ${JSON.stringify(state, null, 2)};
function resolveFont(s) { return s.fontBucket === "google" ? '"' + s.googleFontFamily + '", sans-serif' : "inherit"; }
function buildShadow(s) { if (!s.shadowEnabled) return "none"; var hex = Math.round(s.shadowOpacity * 255).toString(16).padStart(2, "0"); return s.shadowX + "px " + s.shadowY + "px " + s.shadowBlur + "px " + s.shadowSpread + "px " + s.shadowColor + hex; }


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

function itemStyle(model, isCursor, isSelected, disabled) {
  const background = disabled ? "transparent" : isSelected ? model.itemActiveBg : isCursor ? model.itemHoverBg : model.itemBg;
  const color = disabled ? model.itemDisabledColor : isSelected || isCursor ? model.itemHoverText : model.itemText;
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: 0,
    minHeight: model.itemHeight,
    borderRadius: model.itemRadius,
    padding: "0 " + model.itemPadding + "px",
    background,
    color,
    cursor: disabled ? model.disabledCursor : "pointer",
    textAlign: "left",
    fontWeight: 700,
    transition: model.transitionDuration > 0 ? "background 150ms ease, color 150ms ease" : "none",
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
        border: state.borderWidth + "px " + state.borderStyle + " " + (state.disabled && state.disabledUseCustomColors ? state.disabledBorder : state.border),
        boxShadow: buildShadow(state),
        background: state.background,
        color: state.foreground,
        fontFamily: resolveFont(state),
        opacity: state.disabled ? (state.disabledOpacity ?? 0.5) : 1,
cursor: state.disabled ? state.disabledCursor : undefined,
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
          borderRadius: state.menuRadius,
          border: "1px solid " + state.menuBorder,
          padding: 8,
          background: state.menuBg,
          boxShadow: state.menuShadow,
          outline: 0,
        }}
      >
        {Array.from({ length: groupCount }, (_, groupIndex) => {
          const groupItems = items.slice(groupIndex * groupSize, (groupIndex + 1) * groupSize);
          if (!groupItems.length) return null;

          return (
            <div key={groupIndex} role="group" aria-label={"Menu group " + (groupIndex + 1)} style={{ display: isVertical ? "grid" : "contents", gap: 4 }}>
              {groupIndex > 0 ? <div role="separator" style={isVertical ? { height: 1, margin: "4px 0", background: state.separatorColor } : { width: 1, margin: "0 4px", background: state.separatorColor }} /> : null}
              {isVertical && groupCount > 1 ? (
                <div style={{ padding: "4px 12px" }}>
                  <p style={{ margin: 0, color: state.groupHeaderColor, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>{"Group " + (groupIndex + 1)}</p>
                  <div style={{ height: 1, marginTop: 4, background: state.groupDividerColor }} />
                </div>
              ) : null}
              {groupItems.map((item, itemIndex) => {
                const absoluteIndex = groupIndex * groupSize + itemIndex;
                const isCursor = absoluteIndex === activeIndex;
                const isSelected = state.previewState === "selected";

                return (
                  <button key={item.id} type="button" role={item.role} aria-checked={item.role === "menuitem" ? undefined : item.checked} aria-disabled={item.disabled || undefined} aria-haspopup={item.hasSubmenu ? "menu" : undefined} aria-expanded={item.hasSubmenu ? submenuOpen && (isCursor || isSelected) : undefined} tabIndex={state.rovingFocus ? (isCursor || isSelected ? 0 : -1) : state.tabIndex} disabled={item.disabled} onMouseEnter={() => { setActiveIndex(absoluteIndex); setSubmenuOpen(item.hasSubmenu); }} onClick={() => selectItem(item)} style={itemStyle(state, isCursor, isSelected, item.disabled)}>
                    {item.role === "menuitemcheckbox" ? (
                      <svg aria-hidden="true" width={state.iconSize} height={state.iconSize} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="1" y="1" width="12" height="12" rx="3" stroke={state.iconColor} strokeWidth="1.5" fill={item.checked ? state.iconColor : "none"} />
                        {item.checked ? <path d="M3.5 7l2.5 2.5 4.5-5" stroke={item.disabled ? state.itemDisabledColor : state.checkmarkColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
                      </svg>
                    ) : item.role === "menuitemradio" ? (
                      <svg aria-hidden="true" width={state.iconSize} height={state.iconSize} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6" stroke={state.iconColor} strokeWidth="1.5" />
                        {item.checked ? <circle cx="7" cy="7" r="3" fill={state.checkmarkColor} /> : null}
                      </svg>
                    ) : null}
                    <span>{item.label}</span>
                    {item.hasSubmenu ? (
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "auto", flexShrink: 0 }}>
                        <path d="M4.5 2.5L8 6l-3.5 3.5" stroke={state.submenuIndicatorColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                    {state.showShortcuts ?? true ? <span style={{ marginLeft: "auto", color: state.shortcutColor, fontSize: 12 }}>{item.hasSubmenu ? null : item.shortcut}</span> : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {activeItem && activeItem.hasSubmenu && submenuOpen ? (
        <div role="menu" aria-label={activeItem.label + " submenu"} style={{ ...submenuStyle, display: "grid", width: "fit-content", gap: 4, borderRadius: state.menuRadius, border: "1px solid " + state.menuBorder, padding: 8, background: state.menuBg, boxShadow: state.menuShadow }}>
          <button type="button" role="menuitem" style={{ border: 0, minHeight: state.itemHeight, borderRadius: state.itemRadius, padding: "0 " + state.itemPadding + "px", background: "transparent", color: state.itemText, textAlign: "left" }}>{activeItem.label} overview</button>
          <button type="button" role="menuitem" aria-disabled="true" disabled style={{ border: 0, minHeight: state.itemHeight, borderRadius: state.itemRadius, padding: "0 " + state.itemPadding + "px", background: "transparent", color: state.itemDisabledColor, textAlign: "left" }}>Disabled nested item</button>
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
