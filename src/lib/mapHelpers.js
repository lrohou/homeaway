// Shared map utilities for consistent popup styling across all maps

export const MAPTILER_STYLE = "https://api.maptiler.com/maps/019d9665-0270-7b06-bf41-907c11a5295a/style.json?key=FZ6exJZ6JibveJODuzvj";

export const CATEGORIES = {
  hotel: { color: "#10b981", emoji: "🏠", key: "cat.hotel", gradient: "from-emerald-400 to-teal-500" },
  activity: { color: "#f59e0b", emoji: "🎯", key: "cat.activity", gradient: "from-amber-400 to-orange-500" },
  flight: { color: "#3b82f6", emoji: "✈️", key: "cat.flight", gradient: "from-blue-400 to-indigo-500" },
  train: { color: "#6366f1", emoji: "🚆", key: "cat.train", gradient: "from-indigo-400 to-violet-500" },
  bus: { color: "#8b5cf6", emoji: "🚌", key: "cat.bus", gradient: "from-violet-400 to-purple-500" },
  car: { color: "#ec4899", emoji: "🚗", key: "cat.car", gradient: "from-pink-400 to-rose-500" },
  transport: { color: "#6366f1", emoji: "🚀", key: "cat.transport", gradient: "from-indigo-400 to-violet-500" },
  step: { color: "#a855f7", emoji: "📍", key: "cat.step", gradient: "from-purple-400 to-fuchsia-500" },
  other: { color: "#64748b", emoji: "📌", key: "cat.other", gradient: "from-slate-400 to-gray-500" },
};

export function createMarkerElement(type) {
  const cat = CATEGORIES[type] || CATEGORIES.other;
  const el = document.createElement("div");
  el.className = "trip-map-marker group";
  el.innerHTML = `
    <div style="
      width: 44px; height: 44px; border-radius: 16px;
      background: linear-gradient(135deg, ${cat.color}, ${cat.color}ED);
      border: 3px solid white;
      box-shadow: 0 8px 16px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    ">${cat.emoji}</div>
  `;
  el.addEventListener("mouseenter", () => {
    el.firstElementChild.style.transform = "translateY(-4px) scale(1.05)";
    el.firstElementChild.style.boxShadow = `0 12px 24px ${cat.color}60, inset 0 2px 4px rgba(255,255,255,0.6)`;
  });
  el.addEventListener("mouseleave", () => {
    el.firstElementChild.style.transform = "translateY(0) scale(1)";
    el.firstElementChild.style.boxShadow = `0 8px 16px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.4)`;
  });
  return el;
}

export function createPopupHTML(item, t) {
  const cat = CATEGORIES[item.type] || CATEGORIES.other;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

  return `
    <div style="font-family: 'DM Sans', sans-serif; min-width: 260px; max-width: 320px; padding: 20px; color: #1e293b;">
      <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px;">
        <div style="
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, ${cat.color}20, ${cat.color}40);
          font-size: 24px; border: 1px solid ${cat.color}30;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.4); flex-shrink: 0;
        ">${cat.emoji}</div>
        <div style="flex: 1; min-width: 0; padding-top: 2px;">
          <h4 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${item.label}
          </h4>
          <span style="
            display: inline-flex; align-items: center; padding: 4px 12px;
            font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;
            border-radius: 20px; background: linear-gradient(135deg, ${cat.color}, ${cat.color}DA);
            color: white; box-shadow: 0 4px 12px ${cat.color}40;
          ">${item.customBadge ? item.customBadge : (t ? t(cat.key) : cat.key)}</span>
        </div>
      </div>

      ${item.location ? `
        <div style="
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px;
          padding: 12px; background: rgba(0,0,0,0.03); border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.05);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${cat.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style="font-size: 13px; color: #475569; font-weight: 600; line-height: 1.4; word-break: break-word;">${item.location}</span>
        </div>
      ` : ''}

      ${item.date ? `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-size: 14px; font-weight: 700; color: #64748b; padding-left: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${item.date}
        </div>
      ` : ''}

      <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
        display: flex; align-items: center; justify-content: center; gap: 10px;
        width: 100%; padding: 14px 0;
        background: linear-gradient(135deg, ${cat.color}, ${cat.color}DA);
        color: white; border: none;
        box-shadow: 0 8px 20px ${cat.color}40, inset 0 2px 4px rgba(255,255,255,0.3);
        border-radius: 14px; font-size: 14px; font-weight: 800; text-transform: uppercase;
        letter-spacing: 1px; text-decoration: none; cursor: pointer;
        transition: all 0.3s ease;
      "
        onmouseover="this.style.transform='translateY(-3px) scale(1.02)'"
        onmouseout="this.style.transform='translateY(0) scale(1)'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        ${t ? t('map.goThere') : 'Y aller'}
      </a>
    </div>
  `;
}

export const MAP_POPUP_CSS = `
  .maplibregl-popup-content {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-radius: 20px !important;
    padding: 0 !important;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
  }
  .maplibregl-popup-close-button {
    color: #64748b !important; font-size: 20px !important; padding: 8px !important;
    border-radius: 50% !important; right: 4px !important; top: 4px !important;
    transition: background 0.2s !important; z-index: 10 !important;
  }
  .maplibregl-popup-close-button:hover { background: rgba(0,0,0,0.05) !important; }
  .maplibregl-popup-tip { border-top-color: rgba(255, 255, 255, 0.7) !important; }
`;
