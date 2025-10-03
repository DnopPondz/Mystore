"use client";

import { useEffect, useMemo, useState } from "react";
import {
  summarizePromotion,
  formatPromotionSchedule,
  describePromotionUsage,
} from "@/lib/promotionUtils";
import { getActiveSamplePromotions } from "@/lib/sampleData";

export default function PromotionsTicker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchPromotions() {
      try {
        const res = await fetch("/api/promotions/active", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "โหลดโปรโมชันไม่สำเร็จ");
        if (active) {
          setItems(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(String(err.message || err));
          setItems((prev) => (prev.length ? prev : getActiveSamplePromotions()));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPromotions();
    const interval = setInterval(fetchPromotions, 5 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const visiblePromotions = useMemo(
    () => items.filter((item) => item && item.title && item.active !== false),
    [items]
  );

  if (loading && !visiblePromotions.length) {
    return (
      <div className="bg-[#5b3dfc] py-2 text-xs text-white/80">
        <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-2 px-4">
          <span className="h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent" />
          <span>กำลังเตรียมโปรโมชันสำหรับคุณ...</span>
        </div>
      </div>
    );
  }

  if (error && !visiblePromotions.length) {
    return null;
  }

  if (!visiblePromotions.length) {
    return null;
  }

  return (
    <div className="bg-[#5b3dfc]">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-3 px-4 py-2 text-xs text-white/85 sm:text-sm">
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white font-semibold">
          🎁 โปรโมชันพิเศษ
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {visiblePromotions.map((promotion) => {
            const usage = describePromotionUsage(promotion);
            return (
              <span
                key={promotion._id}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[#3c1a09] shadow-[0_6px_12px_-6px_rgba(0,0,0,0.2)]"
              >
                <span className="font-semibold text-[#5b3dfc]">
                  {promotion.title}
                </span>
                <span className="text-[#f7931e]">
                  {summarizePromotion(promotion)}
                </span>
                {usage ? (
                  <span className="text-[#3c1a09]/70">{usage}</span>
                ) : null}
                <span className="text-[#3c1a09]/60">
                  {formatPromotionSchedule(promotion)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
