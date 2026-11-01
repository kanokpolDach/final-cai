import { useMemo, useState } from "react";

const REPAIR_LAYOUTS = {
  mission_01: {
    title: "ติดตั้ง Power Supply",
    description: "ลาก Power Supply ไปวางในช่องติดตั้งชุดจ่ายไฟ",
    parts: [{ id: "power_supply", name: "Power Supply", icon: "🔌" }],
    slots: [{ id: "power_supply", name: "ช่องติดตั้ง Power Supply", icon: "🔌" }]
  },
  mission_02: {
    title: "อัปเกรด RAM และ SSD",
    description: "ลาก RAM และ SSD ไปวางในช่องที่ถูกต้อง",
    parts: [
      { id: "ram", name: "RAM", icon: "💾" },
      { id: "ssd", name: "SSD", icon: "💽" }
    ],
    slots: [
      { id: "ram", name: "สล็อต RAM บนเมนบอร์ด", icon: "💾" },
      { id: "ssd", name: "ช่องติดตั้ง SSD", icon: "💽" }
    ]
  },
  mission_03: {
    title: "แก้ปัญหา CPU ร้อนเกินไป",
    description: "ติดตั้ง CPU ก่อน จากนั้นจึงติดตั้ง Thermal Paste",
    parts: [
      { id: "cpu", name: "CPU", icon: "🔲" },
      { id: "thermal_paste", name: "Thermal Paste", icon: "🧴" }
    ],
    slots: [
      { id: "cpu", name: "Socket สำหรับติดตั้ง CPU", icon: "🔲" },
      { id: "thermal_paste", name: "ตำแหน่งทา Thermal Paste บน CPU", icon: "🧴" }
    ]
  }
};

export default function RepairDragDrop({ mission, onComplete, onCancel }) {
  const layout = REPAIR_LAYOUTS[mission.id];

  const [installed, setInstalled] = useState({});
  const [selectedPart, setSelectedPart] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const installedCount = useMemo(
    () => Object.keys(installed).length,
    [installed]
  );

  const allInstalled = layout
    ? installedCount === layout.slots.length
    : false;

  if (!layout) {
    return (
      <div className="repair-panel">
        <h2>ไม่พบรูปแบบภารกิจนี้</h2>
        <button onClick={onCancel}>กลับไป Mission Center</button>
      </div>
    );
  }

  function showFeedback(message, type = "info") {
    setFeedback(message);
    setFeedbackType(type);
  }

  function placePart(partId, slotId) {
    if (installed[slotId]) {
      showFeedback("ช่องนี้ติดตั้งอุปกรณ์แล้ว", "error");
      return;
    }

    if (partId !== slotId) {
      const part = layout.parts.find((item) => item.id === partId);
      const slot = layout.slots.find((item) => item.id === slotId);

      showFeedback(
        `${part?.name ?? "อุปกรณ์"} ไม่สามารถติดตั้งใน ${slot?.name ?? "ช่องนี้"} ได้`,
        "error"
      );
      return;
    }

    // Mission 03 ต้องติดตั้ง CPU ก่อน Thermal Paste
    if (
      mission.id === "mission_03" &&
      partId === "thermal_paste" &&
      !installed.cpu
    ) {
      showFeedback("กรุณาติดตั้ง CPU ก่อน แล้วจึงทา Thermal Paste", "error");
      return;
    }

    setInstalled((previous) => ({
      ...previous,
      [slotId]: partId
    }));

    setSelectedPart(null);

    const part = layout.parts.find((item) => item.id === partId);
    showFeedback(`✓ ติดตั้ง ${part.name} สำเร็จแล้ว`, "success");
  }

  function handleDrop(event, slotId) {
    event.preventDefault();

    const partId = event.dataTransfer.getData("text/plain");
    if (partId) placePart(partId, slotId);
  }

  function handleSubmit() {
    if (!allInstalled || submitting) return;

    setSubmitting(true);
    onComplete();
  }

  return (
    <div className="repair-panel">
      <div className="panel-heading">
        <div>
          <h2>🔧 Repair Workshop</h2>
          <p>{mission.title}</p>
        </div>

        <span className="status-pill unlocked">
          ติดตั้งแล้ว {installedCount}/{layout.slots.length}
        </span>
      </div>

      <div className="repair-progress">
        <span
          style={{
            width: `${(installedCount / layout.slots.length) * 100}%`
          }}
        />
      </div>

      <div className="drag-repair-instruction">
        <h3>{layout.title}</h3>
        <p>{layout.description}</p>
        <p>
          สามารถลากอุปกรณ์ไปวางในช่องติดตั้ง หรือคลิกเลือกอุปกรณ์
          แล้วคลิกช่องติดตั้งได้
        </p>
      </div>

      <section className="drag-repair-section">
        <h3>🎒 อุปกรณ์สำหรับติดตั้ง</h3>

        <div className="drag-parts">
          {layout.parts.map((part) => {
            const isInstalled = Boolean(installed[part.id]);

            return (
              <button
                type="button"
                key={part.id}
                className={[
                  "drag-part",
                  selectedPart === part.id ? "selected" : "",
                  isInstalled ? "installed" : ""
                ].join(" ")}
                draggable={!isInstalled}
                disabled={isInstalled}
                onClick={() => {
                  if (isInstalled) return;

                  setSelectedPart(part.id);
                  showFeedback(
                    `เลือก ${part.name} แล้ว กรุณาคลิกช่องติดตั้งที่ถูกต้อง`,
                    "info"
                  );
                }}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", part.id);
                  event.dataTransfer.effectAllowed = "move";
                  setSelectedPart(part.id);
                }}
              >
                <span className="drag-part-icon">{part.icon}</span>
                <strong>{part.name}</strong>
                <small>{isInstalled ? "ติดตั้งแล้ว ✓" : "ลากหรือคลิกเพื่อเลือก"}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="drag-repair-section">
        <h3>🖥️ ตำแหน่งติดตั้งอุปกรณ์</h3>

        <div className="repair-slots">
          {layout.slots.map((slot, index) => {
            const isInstalled = Boolean(installed[slot.id]);

            return (
              <div
                key={slot.id}
                className={[
                  "repair-slot",
                  isInstalled ? "installed" : "",
                  selectedPart ? "can-select" : ""
                ].join(" ")}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => handleDrop(event, slot.id)}
                onClick={() => {
                  if (!selectedPart) {
                    showFeedback("กรุณาเลือกอุปกรณ์ก่อน", "info");
                    return;
                  }

                  placePart(selectedPart, slot.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && selectedPart) {
                    placePart(selectedPart, slot.id);
                  }
                }}
              >
                <span className="slot-number">SLOT {index + 1}</span>

                <span className="slot-icon">
                  {isInstalled ? slot.icon : "＋"}
                </span>

                <strong>{slot.name}</strong>

                <span className="slot-status">
                  {isInstalled ? "✓ ติดตั้งแล้ว" : "รอการติดตั้ง"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {feedback && (
        <div className={`drag-feedback ${feedbackType}`}>
          {feedback}
        </div>
      )}

      {allInstalled && (
        <div className="drag-all-complete">
          <h3>🎉 ติดตั้งอุปกรณ์ครบแล้ว!</h3>
          <p>ตรวจสอบอุปกรณ์เรียบร้อยแล้ว สามารถส่งงานเพื่อรับรางวัลได้</p>
        </div>
      )}

      <div className="drag-repair-actions">
        <button
          type="button"
          className="cancel-repair-button"
          onClick={onCancel}
          disabled={submitting}
        >
          กลับ
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allInstalled || submitting}
        >
          {submitting ? "กำลังส่งงาน..." : "ส่งงานและรับรางวัล"}
        </button>
      </div>

      <p className="repair-safety">
        ⚠️ เป็นการจำลองเพื่อการเรียนรู้เท่านั้น
        การซ่อมอุปกรณ์จริงควรปิดเครื่อง ถอดปลั๊ก
        และปฏิบัติตามข้อควรระวังด้านไฟฟ้า
      </p>
    </div>
  );
}