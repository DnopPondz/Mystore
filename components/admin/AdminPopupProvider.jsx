"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PopupContext = createContext(null);

export function useAdminPopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("useAdminPopup must be used within an AdminPopupProvider");
  }
  return context;
}

const toneMap = {
  info: {
    icon: "ℹ️",
    accent: "bg-sky-500",
    accentHover: "hover:bg-sky-600",
    accentRing: "focus-visible:ring-sky-300",
    badge: "bg-sky-500/10 text-sky-100 border border-sky-500/20",
    cancel: "border border-sky-500/30 text-sky-100 hover:bg-sky-500/10",
  },
  success: {
    icon: "✨",
    accent: "bg-emerald-500",
    accentHover: "hover:bg-emerald-600",
    accentRing: "focus-visible:ring-emerald-300",
    badge: "bg-emerald-500/10 text-emerald-100 border border-emerald-500/20",
    cancel: "border border-emerald-500/30 text-emerald-100 hover:bg-emerald-500/10",
  },
  warning: {
    icon: "⚠️",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-600",
    accentRing: "focus-visible:ring-amber-300",
    badge: "bg-amber-500/10 text-amber-100 border border-amber-500/20",
    cancel: "border border-amber-500/30 text-amber-100 hover:bg-amber-500/10",
  },
  error: {
    icon: "✖️",
    accent: "bg-rose-500",
    accentHover: "hover:bg-rose-600",
    accentRing: "focus-visible:ring-rose-300",
    badge: "bg-rose-500/10 text-rose-100 border border-rose-500/20",
    cancel: "border border-rose-500/30 text-rose-100 hover:bg-rose-500/10",
  },
};

function getToneConfig(tone) {
  return toneMap[tone] || toneMap.info;
}

export function AdminPopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const close = useCallback(() => {
    setPopup(null);
  }, []);

  const alert = useCallback((message, options = {}) => {
    const { title = "แจ้งเตือน", tone = "info", confirmText = "ตกลง" } = options;
    return new Promise((resolve) => {
      setPopup({
        variant: "alert",
        title,
        message,
        tone,
        confirmText,
        resolve: (value) => {
          resolve(value);
          close();
        },
      });
    });
  }, [close]);

  const confirm = useCallback((message, options = {}) => {
    const {
      title = "ยืนยันการทำรายการ",
      tone = "warning",
      confirmText = "ยืนยัน",
      cancelText = "ยกเลิก",
    } = options;
    return new Promise((resolve) => {
      setPopup({
        variant: "confirm",
        title,
        message,
        tone,
        confirmText,
        cancelText,
        resolve: (value) => {
          resolve(value);
          close();
        },
      });
    });
  }, [close]);

  useEffect(() => {
    if (!popup) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        popup.resolve(popup.variant === "confirm" ? false : true);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [popup]);

  const value = useMemo(
    () => ({
      alert,
      confirm,
    }),
    [alert, confirm]
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      {popup ? <PopupOverlay popup={popup} /> : null}
    </PopupContext.Provider>
  );
}

function PopupOverlay({ popup }) {
  const tone = getToneConfig(popup.tone);

  const handleConfirm = () => {
    popup.resolve(true);
  };

  const handleCancel = () => {
    popup.resolve(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={() => popup.resolve(popup.variant === "confirm" ? false : true)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[var(--color-burgundy-dark,#1d0505)]/95 text-white shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`absolute inset-x-0 top-0 h-1 ${tone.accent}`} />
        <div className="space-y-6 px-7 py-8">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${tone.badge}`}>
              {tone.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">{popup.title}</h3>
              <p className="text-sm leading-relaxed text-white/80">{popup.message}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {popup.variant === "confirm" ? (
              <button
                type="button"
                onClick={handleCancel}
                className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-burgundy-dark,#1d0505)] ${tone.cancel}`}
              >
                {popup.cancelText}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleConfirm}
              className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-burgundy-dark,#1d0505)] ${tone.accent} ${tone.accentHover} ${tone.accentRing}`}
            >
              {popup.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
