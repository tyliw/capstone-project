import React, { useState } from "react";
import type { CalendarProps } from "antd";
import { Calendar, Tooltip } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");
import type { DiaryInterface } from "../../interfaces/IDiary";
import { useNavigate, useLocation } from "react-router";
import "./DiaryCalendar.css";
import EditDiaryModal from "../edit-diary-modal/EditDiaryModal";
import { useDiary } from "../../contexts/DiaryContext";

interface DiaryCalendarProps {
  diaries: DiaryInterface[];
  dateField?: "UpdatedAt" | "CreatedAt";
}

const DiaryCalendar: React.FC<DiaryCalendarProps> = ({
  diaries,
  dateField = "UpdatedAt",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteDiary } = useDiary();
  const [editingDiary, setEditingDiary] = useState<DiaryInterface | null>(null);
  const [deletingDiary, setDeletingDiary] = useState<DiaryInterface | null>(
    null
  );

  // สร้าง map วันที่ -> diary[]
  const diaryMap = React.useMemo(() => {
    const map: Record<string, DiaryInterface[]> = {};
    diaries.forEach((diary) => {
      const dateStr = diary[dateField] || diary.CreatedAt;
      if (dateStr) {
        const date = dayjs(dateStr).format("YYYY-MM-DD");
        if (!map[date]) map[date] = [];
        map[date].push(diary);
      }
    });
    return map;
  }, [diaries, dateField]);

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const listData = diaryMap[dateKey] || [];
    if (listData.length === 0) return null;

    return (
      <div>
        {listData.map((diary) => {
          const tagColors =
            diary.TagColors?.split(",")
              .map((c) => c.trim().replace(/^"|"$/g, ""))
              .slice(0, 3) || []; // ✅ เอาแค่ 3 สีแรก

          return (
            <Tooltip
              key={diary.ID}
              title={
                <section className="diary-tooltip">
                  <div className="diary-tooltip-info">
                    <strong>{diary.Title || "No Title"}</strong>
                    <br />
                    <span>
                      {dayjs(diary[dateField] || diary.CreatedAt).format(
                        "DD MMM YYYY HH:mm"
                      )}
                    </span>
                    <br />
                    <span>{stripHtml(diary.Content || "")}</span>
                  </div>
                  <div className="diary-tooltip-actions">
                    <button
                      className="diary-tooltip-btn-edit"
                      onClick={() => setEditingDiary(diary)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="diary-tooltip-btn-delete"
                      onClick={() => setDeletingDiary(diary)}
                    >
                      ลบ
                    </button>
                  </div>
                </section>
              }
              placement="topLeft"
              arrow={true}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate(`${location.pathname}/detail/${diary.ID}`)
                }
              >
                {/* ✅ แถบสีสั้น ๆ ด้านหน้าชื่อ */}
                <div className="tag-color-strip">
                  {tagColors.map((color, i) => (
                    <div
                      key={i}
                      className="tag-color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* ชื่อไดอารี่ */}
                <span>{diary.Title || "No Title"}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  return (
    <>
      <Calendar cellRender={cellRender} />
      {editingDiary && (
        <EditDiaryModal
          diary={editingDiary}
          onCancel={() => setEditingDiary(null)}
          onSave={() => setEditingDiary(null)}
        />
      )}
{deletingDiary && (
  <div
    className="calendar-confirm-overlay"
    onClick={() => setDeletingDiary(null)} // ✅ ปิด modal ถ้าคลิก overlay
  >
    <div
      className="confirm-modal"
      onClick={(e) => e.stopPropagation()} // ✅ ไม่ให้ modal ปิดถ้าคลิกในกล่อง
    >
      <h3>ยืนยันการลบ</h3>
      <p>คุณแน่ใจหรือไม่ว่าต้องการลบไดอารี่นี้?</p>
      <div className="confirm-buttons">
        <button
          className="btn cancel"
          onClick={() => setDeletingDiary(null)}
        >
          ยกเลิก
        </button>
        <button
          className="btn delete"
          onClick={(e) => {
            e.stopPropagation();
            deleteDiary(deletingDiary.ID || 0);
            setDeletingDiary(null);
          }}
        >
          ลบ
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default DiaryCalendar;
