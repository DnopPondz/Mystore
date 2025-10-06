"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminAccentButton,
  adminInsetCardShell,
  adminSoftBadge,
  adminSurfaceShell,
  adminTableShell,
} from "@/app/admin/theme";
import { useAdminPopup } from "@/components/admin/AdminPopupProvider";

function extractApiError(error) {
  if (!error) return "เกิดข้อผิดพลาด";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) return error[0] || "เกิดข้อผิดพลาด";
  if (error?.message) return error.message;
  const fieldErrors = error?.fieldErrors || {};
  for (const key of Object.keys(fieldErrors)) {
    const list = fieldErrors[key];
    if (Array.isArray(list) && list.length > 0) {
      return list[0];
    }
  }
  const formErrors = error?.formErrors;
  if (Array.isArray(formErrors) && formErrors.length > 0) {
    return formErrors[0];
  }
  return "เกิดข้อผิดพลาด";
}

function RatingPill({ rating }) {
  const value = Number(rating || 0);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#9be6dc] bg-[#eaf8f4] px-3 py-1 text-xs font-semibold text-[#0ea5a0]">
      <span>⭐</span>
      {value.toFixed(1)}
    </span>
  );
}

function PublishedBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#C3E7C4] bg-[#e2faf5] px-3 py-1 text-xs font-semibold text-[#2F7A3D]">
      <span>🟢</span>
      แสดงบนหน้าเว็บ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#DCC7F0] bg-[#F8F2FF] px-3 py-1 text-xs font-semibold text-[#7A4CB7]">
      <span>⚪️</span>
      ซ่อนอยู่
    </span>
  );
}


export default function AdminReviewsPage() {
  const popup = useAdminPopup();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [removingId, setRemovingId] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "โหลดรีวิวไม่สำเร็จ");
      }
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const totalPublished = useMemo(
    () => reviews.filter((review) => review.published).length,
    [reviews]
  );

  const featuredCount = useMemo(
    () => reviews.filter((review) => review.published && Number(review.rating || 0) >= 3.5).length,
    [reviews]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + Number(review.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const handleTogglePublished = useCallback(
    async (review) => {
      if (!review?.id) return;
      setUpdatingId(review.id);
      try {
        const res = await fetch(`/api/admin/reviews/${review.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: !review.published }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(extractApiError(data?.error));
        }
        setReviews((prev) => prev.map((item) => (item.id === review.id ? data.review : item)));
      } catch (err) {
        await popup.alert(err.message || "อัปเดตสถานะไม่สำเร็จ", {
          tone: "error",
          title: "ไม่สามารถอัปเดตรีวิวได้",
        });
      } finally {
        setUpdatingId("");
      }
    },
    [popup]
  );

  const handleDelete = useCallback(
    async (review) => {
      if (!review?.id) return;
      const confirmed = await popup.confirm(
        `ต้องการลบรีวิวของ ${review.userName || "ลูกค้า"} หรือไม่?`,
        {
          tone: "warning",
          title: "ลบรีวิว",
          confirmText: "ลบรีวิว",
        }
      );
      if (!confirmed) return;

      setRemovingId(review.id);
      try {
        const res = await fetch(`/api/admin/reviews/${review.id}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(extractApiError(data?.error));
        }
        setReviews((prev) => prev.filter((item) => item.id !== review.id));
        await popup.alert("ลบรีวิวเรียบร้อยแล้ว", {
          tone: "success",
          title: "ดำเนินการสำเร็จ",
        });
      } catch (err) {
        await popup.alert(err.message || "ลบรีวิวไม่สำเร็จ", {
          tone: "error",
          title: "เกิดข้อผิดพลาด",
        });
      } finally {
        setRemovingId("");
      }
    },
    [popup]
  );

  return (
    <div className="space-y-8 text-[#0b3b31]">
      <section className={`${adminSurfaceShell} p-6`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0b3b31]">รีวิวจากลูกค้า</h2>
            <p className="mt-1 text-sm text-[#145f4b]">ตรวจสอบเสียงตอบรับและจัดการการแสดงผลรีวิวบนหน้าเว็บไซต์</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`${adminInsetCardShell} px-4 py-3 text-sm text-[#0f5349]`}>รวมทั้งหมด {reviews.length} รีวิว</div>
            <div className={`${adminInsetCardShell} border-[#C3E7C4] bg-[#e2faf5] px-4 py-3 text-sm font-semibold text-[#2F7A3D]`}>เผยแพร่ {totalPublished} รีวิว</div>
            <div className={`${adminInsetCardShell} border-[#9be6dc] bg-[#eaf8f4] px-4 py-3 text-sm font-semibold text-[#0ea5a0]`}>รีวิวเด่น {featuredCount}</div>
            <div className={`${adminInsetCardShell} border-[#DCC7F0] bg-[#F8F2FF] px-4 py-3 text-sm font-semibold text-[#7A4CB7]`}>ค่าเฉลี่ย {averageRating.toFixed(2)} ⭐</div>
          </div>
        </div>
      </section>

      <section className={`${adminSurfaceShell} p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0b3b31]">รายการรีวิวทั้งหมด</h3>
            <p className="text-sm text-[#145f4b]">คลิกเพื่อซ่อน/แสดงบนหน้าเว็บหรือจัดการรีวิวที่ไม่เหมาะสม</p>
          </div>
          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className={`${adminAccentButton} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            🔄 รีเฟรช
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 shadow-[0_14px_28px_-24px_rgba(244,63,94,0.35)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] border border-[#c9f6ef] bg-white/70 px-6 py-5 text-sm text-[#145f4b] shadow-[0_14px_28px_-24px_rgba(10,83,73,0.45)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0ea5a0] border-t-transparent" />
            กำลังโหลดข้อมูลรีวิว...
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-[#c9f6ef] bg-white/70 px-6 py-8 text-center text-sm text-[#145f4b] shadow-[0_14px_28px_-24px_rgba(10,83,73,0.4)]">
            ยังไม่มีรีวิวจากลูกค้า
          </div>
        ) : (
          <div className={`${adminTableShell} mt-6`}>
            <table className="w-full text-sm text-[#0f5349]">
              <thead className="bg-[#eaf8f4] text-[#0ea5a0]">
                <tr>
                  <th className="px-5 py-4 text-left">ลูกค้า</th>
                  <th className="px-5 py-4 text-left">คอมเมนต์</th>
                  <th className="px-5 py-4 text-left">ให้คะแนน</th>
                  <th className="px-5 py-4 text-left">สถานะ</th>
                  <th className="px-5 py-4 text-left">อัปเดตล่าสุด</th>
                  <th className="px-5 py-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9f6ef]">
                {reviews.map((review, index) => (
                  <tr key={review.id} className={`${index % 2 === 0 ? "bg-white" : "bg-[#FFF7EA]"} transition-colors hover:bg-[#FFEFD8]`}>
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-[#0b3b31]">{review.userName || "ลูกค้า"}</div>
                      {review.userEmail && <div className="text-xs text-[#0ea5a0]/70">{review.userEmail}</div>}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-md text-sm leading-relaxed text-[#0f5349] line-clamp-4">{review.comment || "-"}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <RatingPill rating={review.rating} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <PublishedBadge published={review.published} />
                    </td>
                    <td className="px-5 py-4 align-top text-xs text-[#0ea5a0]/70">
                      {review.updatedAt
                        ? new Date(review.updatedAt).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(review)}
                          disabled={updatingId === review.id || removingId === review.id}
                          className={`${adminSoftBadge} px-4 py-2 text-xs shadow-[0_12px_24px_-20px_rgba(10,83,73,0.45)] transition hover:bg-[#e5f8f3] disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {review.published ? "ซ่อนรีวิว" : "แสดงบนหน้าเว็บ"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review)}
                          disabled={removingId === review.id || updatingId === review.id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {removingId === review.id ? "กำลังลบ..." : "ลบ"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
