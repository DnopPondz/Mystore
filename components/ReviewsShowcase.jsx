"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

/* ---------- Static display stars (อ่านอย่างเดียว) ---------- */
function StarRating({ value }) {
  const stars = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index) => {
      const fill = Math.max(0, Math.min(1, value - index));
      return (
        <span
          key={index}
          className="relative inline-block h-5 w-5 text-lg leading-none text-[var(--color-rose)]"
          aria-hidden
        >
          <span className="absolute inset-0 text-[var(--color-rose)]/20">★</span>
          <span
            className="absolute inset-0 overflow-hidden text-[var(--color-rose)]"
            style={{ width: `${fill * 100}%` }}
          >
            ★
          </span>
          <span className="sr-only">{Math.round(fill * 100)}%</span>
        </span>
      );
    });
  }, [value]);

  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="ml-2 text-sm font-semibold text-[var(--color-gold)]/80">
        {Number(value || 0).toFixed(1)}
      </span>
    </div>
  );
}

/* ---------- Interactive star picker (คลิก/โฮเวอร์/คีย์บอร์ด) ---------- */
function StarPicker({
  value = 0,
  onChange,
  size = 24,
  readOnly = false,
  id,
  "aria-label": ariaLabel = "ให้คะแนนเป็นดาว",
}) {
  const [hoverVal, setHoverVal] = useState(null);

  const clamp = (v) => Math.min(5, Math.max(1, v));

  const handleFromEvent = useCallback((e, starIndex1Based) => {
    // หา offset ที่คลิกภายในสัญลักษณ์ดาว เพื่อแยกครึ่งซ้าย/ขวา
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (e.nativeEvent.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const isRightHalf = x > rect.width / 2;
    const base = starIndex1Based - 1; // 0..4
    const next = base + (isRightHalf ? 1 : 0.5);
    return clamp(next);
  }, []);

  const setByMouse = useCallback(
    (e, idx) => {
      if (readOnly) return;
      setHoverVal(handleFromEvent(e, idx));
    },
    [handleFromEvent, readOnly]
  );

  const clearHover = useCallback(() => {
    if (readOnly) return;
    setHoverVal(null);
  }, [readOnly]);

  const commitByClick = useCallback(
    (e, idx) => {
      if (readOnly) return;
      const v = handleFromEvent(e, idx);
      onChange?.(v);
      setHoverVal(null);
    },
    [handleFromEvent, onChange, readOnly]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      let next = value;
      if (e.key === "ArrowRight") {
        next = clamp(value + 0.5);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        next = clamp(value - 0.5);
        e.preventDefault();
      } else if (e.key === "Home") {
        next = 1;
        e.preventDefault();
      } else if (e.key === "End") {
        next = 5;
        e.preventDefault();
      }
      if (next !== value) onChange?.(next);
    },
    [value, onChange, readOnly]
  );

  const displayVal = hoverVal ?? value;

  return (
    <div className="flex flex-col gap-2">
      <div
        id={id}
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={Number(displayVal).toFixed(1)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`inline-flex select-none items-center gap-1 ${
          readOnly ? "opacity-70" : "cursor-pointer"
        }`}
        onMouseLeave={clearHover}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const index1 = i + 1;
          // คำนวณการเติมสีต่อดาว (0, 50, 100%)
          const diff = displayVal - i;
          const fill =
            diff >= 1 ? 100 : diff >= 0.5 ? 50 : diff > 0 ? 0 : 0; // แสดงเป็นครึ่ง/เต็มเท่านั้น
          return (
            <button
              key={i}
              type="button"
              className="relative inline-block outline-none"
              style={{ width: size, height: size }}
              onMouseMove={(e) => setByMouse(e, index1)}
              onTouchStart={(e) => setByMouse(e, index1)}
              onTouchMove={(e) => setByMouse(e, index1)}
              onClick={(e) => commitByClick(e, index1)}
              aria-label={`${index1} ดาว`}
            >
              {/* ดาวพื้น */}
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0"
                style={{ width: size, height: size }}
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--color-rose)]/25"
                />
              </svg>
              {/* ชั้นเติมสีตามเปอร์เซ็นต์ */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill}%` }}
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0"
                  style={{ width: size, height: size }}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                    className="text-[var(--color-rose)]"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-[var(--color-gold)]/70">
        {Number(displayVal).toFixed(1)} ดาว
      </div>
    </div>
  );
}

/* ========================== Main Component ========================== */

function extractErrorMessage(error) {
  if (!error) return "ส่งรีวิวไม่สำเร็จ";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error[0] || "ส่งรีวิวไม่สำเร็จ";
  }
  const { formErrors, fieldErrors } = error;
  if (Array.isArray(formErrors) && formErrors.length > 0) {
    return formErrors[0];
  }
  if (fieldErrors) {
    for (const key of Object.keys(fieldErrors)) {
      const list = fieldErrors[key];
      if (Array.isArray(list) && list.length > 0) {
        return list[0];
      }
    }
  }
  return "ส่งรีวิวไม่สำเร็จ";
}

export default function ReviewsShowcase({ reviews: initialReviews = [] }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [currentStart, setCurrentStart] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadFeatured = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?featured=true", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.reviews)) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("โหลดรีวิวไม่สำเร็จ", error);
    }
  }, []);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (status !== "authenticated") {
        setMyReview(null);
        return;
      }
      try {
        const res = await fetch("/api/reviews/me", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          throw new Error(data?.error || "โหลดรีวิวของฉันไม่สำเร็จ");
        }
        if (data?.review) {
          setMyReview(data.review);
          setFormRating(data.review.rating || 5);
          setFormComment(data.review.comment || "");
        } else {
          setMyReview(null);
          setFormRating(5);
          setFormComment("");
        }
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadFeatured();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFeatured]);

  useEffect(() => {
    setCurrentStart(0);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 3) return undefined;
    const interval = setInterval(() => {
      setCurrentStart((prev) => {
        const next = (prev + 3) % reviews.length;
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return [];
    if (reviews.length <= 3) return reviews;
    const list = [];
    for (let i = 0; i < Math.min(3, reviews.length); i += 1) {
      const index = (currentStart + i) % reviews.length;
      list.push(reviews[index]);
    }
    return list;
  }, [reviews, currentStart]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (status !== "authenticated") {
        setMessage({ type: "error", text: "กรุณาเข้าสู่ระบบก่อนรีวิว" });
        return;
      }
      if (formComment.trim().length < 5) {
        setMessage({ type: "error", text: "กรุณาเขียนรีวิวอย่างน้อย 5 ตัวอักษร" });
        return;
      }

      setSubmitting(true);
      setMessage(null);
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: formRating, comment: formComment }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(extractErrorMessage(data?.error));
        }
        setMessage({ type: "success", text: "ขอบคุณสำหรับรีวิว!" });
        setMyReview(data.review);
        setFormRating(Number(data.review?.rating ?? formRating));
        setFormComment(data.review?.comment ?? "");
        await loadFeatured();
      } catch (error) {
        setMessage({ type: "error", text: String(error.message || error) });
      } finally {
        setSubmitting(false);
      }
    },
    [status, formRating, formComment, loadFeatured]
  );

  const avgRating = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, item) => acc + Number(item.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(58,16,16,0.7),transparent_60%),linear-gradient(140deg,rgba(20,2,2,0.95),rgba(76,25,18,0.85))]" />
      <div className="relative mx-auto max-w-screen-xl px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-[var(--color-rose)]/15 bg-[var(--color-burgundy)]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-rose)]/90">
                    Our Happy Customers
                  </p>
                  <h2 className="mt-1 text-3xl font-bold text-[var(--color-rose)]">เสียงตอบรับจากลูกค้า</h2>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/70 px-4 py-2 shadow-inner">
                  <StarRating value={reviews.length > 0 ? Math.max(3.5, Math.min(5, avgRating)) : 5} />
                  <span className="text-xs text-[var(--color-gold)]/80">จากลูกค้าที่รักในรสชาติ</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleReviews.length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-8 text-center text-[var(--color-gold)]/70 shadow-lg">
                    ยังไม่มีรีวิวตอนนี้ มาร่วมเป็นคนแรกที่รีวิวความอร่อยกันนะคะ!
                  </div>
                )}
                {visibleReviews.map((review) => (
                  <article
                    key={review.id}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-6 shadow-lg shadow-black/30"
                  >
                    <StarRating value={Number(review.rating || 0)} />
                    <p className="flex-1 text-sm leading-relaxed text-[var(--color-gold)]/90">“{review.comment}”</p>
                    <div className="flex items-center justify-between text-sm text-[var(--color-rose)]/80">
                      <span className="font-semibold">{review.name}</span>
                      {review.createdAt && (
                        <time dateTime={review.createdAt} className="text-xs text-[var(--color-gold)]/60">
                          {new Date(review.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                          })}
                        </time>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--color-rose)]/20 bg-[var(--color-burgundy-dark)]/60 p-6 shadow-inner shadow-black/30">
              <h3 className="text-xl font-semibold text-[var(--color-rose)]">แชร์ประสบการณ์ของคุณ</h3>
              <p className="mt-2 text-sm text-[var(--color-gold)]/75">
                รีวิวของคุณช่วยให้เราพัฒนาสูตรให้ดียิ่งขึ้น และเป็นกำลังใจให้ทีมครัวทุกวัน
              </p>

              {status === "loading" && (
                <p className="mt-4 text-xs text-[var(--color-gold)]/70">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
              )}

              {status === "unauthenticated" && (
                <div className="mt-6 space-y-4 rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 p-5 text-sm text-[var(--color-gold)]/80">
                  <p>ต้องเข้าสู่ระบบก่อนจึงจะสามารถให้คะแนนได้</p>
                  <Link
                    href="/login?redirect=/"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-rose)] px-4 py-2 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/30 transition hover:bg-[var(--color-rose-dark)]"
                  >
                    เข้าสู่ระบบเพื่อรีวิว
                  </Link>
                </div>
              )}

              {status === "authenticated" && (
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--color-gold)]/90">
                      ให้คะแนน (1 - 5 ดาว)
                    </label>
                    <div className="rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 p-4 shadow-inner">
                      <div className="flex items-center justify-between gap-3">
                        {/* ใช้ StarRating เพื่อโชว์ค่าปัจจุบัน */}
                        <StarRating value={Number(formRating)} />
                        <span className="text-xs text-[var(--color-gold)]/70">
                          {Number(formRating).toFixed(1)} ดาว
                        </span>
                      </div>

                      {/* ตัวเลือกแบบกดดาวแทนสไลด์ */}
                      <div className="mt-3">
                        <StarPicker
                          value={Number(formRating)}
                          onChange={(v) => setFormRating(Number(v))}
                          size={26}
                          aria-label="เลือกคะแนนรีวิว"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="review-comment" className="text-sm font-semibold text-[var(--color-gold)]/90">
                      รีวิวของคุณ
                    </label>
                    <textarea
                      id="review-comment"
                      value={formComment}
                      onChange={(event) => setFormComment(event.target.value)}
                      minLength={5}
                      maxLength={600}
                      rows={5}
                      className="w-full rounded-2xl border border-[var(--color-rose)]/20 bg-[var(--color-burgundy)]/60 p-4 text-sm text-[var(--color-gold)]/90 shadow-inner outline-none focus:ring-2 focus:ring-[var(--color-rose)]/40"
                      placeholder="บอกเล่าความประทับใจของคุณ เช่น รสชาติ ความสดใหม่ หรือการบริการ"
                    />
                    <p className="text-right text-xs text-[var(--color-gold)]/60">
                      {formComment.length}/600 ตัวอักษร
                    </p>
                  </div>

                  {message && (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        message.type === "success"
                          ? "border-emerald-200/40 bg-emerald-50/20 text-emerald-200"
                          : "border-rose-200/40 bg-rose-50/10 text-rose-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-[var(--color-rose)] px-6 py-3 text-sm font-semibold text-[var(--color-burgundy-dark)] shadow-lg shadow-black/40 transition hover:bg-[var(--color-rose-dark)] disabled:cursor-not-allowed disabled:bg-[var(--color-rose)]/60"
                  >
                    {submitting ? "กำลังบันทึกรีวิว..." : myReview ? "อัปเดตรีวิว" : "ส่งรีวิว"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
