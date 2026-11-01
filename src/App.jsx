import { useEffect, useMemo, useState } from "react";
import Game from "./game/Game";
import {
  INITIAL_STATE,
  SHOP_ITEMS,
  MISSIONS,
  LESSONS,
  QUIZ
} from "./systems/gameData";
import RepairDragDrop from "./components/RepairDragDrop";
import { DEVICE_LESSONS } from "./systems/deviceLessons";

const STORAGE_KEY = "computer_repair_adventure";

function bangkokDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

const DAILY_QUEST_TEMPLATES = {
  npc: [
    { id: "npc_diagnose", title: "ตรวจสอบคอมพิวเตอร์ให้ลูกค้า", description: "ทำภารกิจซ่อมคอมพิวเตอร์หลักให้สำเร็จ 1 ครั้ง", event: "repair_complete", target: 1, reward: 80, xp: 25 },
    { id: "npc_ram", title: "ช่วยลูกค้าอัปเกรดเครื่อง", description: "ซื้อ RAM จากร้านค้า 1 ชิ้น", event: "purchase_item", itemId: "ram", target: 1, reward: 120, xp: 35 },
    { id: "npc_thermal", title: "เตรียมงานแก้เครื่องร้อน", description: "ซื้อ Thermal Paste 1 ชิ้น", event: "purchase_item", itemId: "thermal_paste", target: 1, reward: 150, xp: 45 }
  ],
  board: [
    { id: "board_buy", title: "จัดหาอุปกรณ์เข้าศูนย์", description: "ซื้ออุปกรณ์จากร้านค้าให้ครบ 2 ชิ้น", event: "purchase_total", target: 2, reward: 60, xp: 20 },
    { id: "board_quiz", title: "ทบทวนความรู้ช่างคอม", description: "ผ่านแบบทดสอบ Learning Zone", event: "quiz_pass", target: 1, reward: 100, xp: 30 },
    { id: "board_collect", title: "สะสมอุปกรณ์หลากหลาย", description: "ซื้ออุปกรณ์คอมพิวเตอร์ให้ครบ 3 ชนิด", event: "collect_types", target: 3, reward: 120, xp: 35 }
  ]
};

function hashText(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dailyQuestSet(date) {
  const choose = (source) => {
    const list = [...DAILY_QUEST_TEMPLATES[source]];
    let seed = hashText(`${date}:${source}`);
    for (let i = list.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 2).map((quest) => ({
      ...quest, status: "available", progress: 0, uniqueItems: []
    }));
  };
  return { date, npc: choose("npc"), board: choose("board") };
}

function ensureDailyQuests(saved) {
  const today = bangkokDateKey();
  if (saved.dailyQuests?.date === today) return saved.dailyQuests;
  return dailyQuestSet(today);
}


function loadGame() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return { ...INITIAL_STATE, dailyQuests: dailyQuestSet(bangkokDateKey()) };

    const parsed = JSON.parse(saved);

    return {
      ...INITIAL_STATE,
      ...parsed,
      inventory: {
        ...INITIAL_STATE.inventory,
        ...(parsed.inventory || {})
      },
      completedMissions: Array.isArray(parsed.completedMissions)
        ? parsed.completedMissions
        : [],
      dailyQuests: ensureDailyQuests(parsed)
    };
  } catch {
    return { ...INITIAL_STATE, dailyQuests: dailyQuestSet(bangkokDateKey()) };
  }
}

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [panel, setPanel] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [dailySource, setDailySource] = useState("npc");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceAnswers, setDeviceAnswers] = useState({});
  const [deviceResult, setDeviceResult] = useState(null);

  useEffect(() => {
    const today = bangkokDateKey();
    setGame((prev) => prev.dailyQuests?.date === today
      ? prev
      : { ...prev, dailyQuests: dailyQuestSet(today) });
  }, []);

  function recordDailyEvent(event, payload = {}) {
    setGame((prev) => {
      const daily = prev.dailyQuests?.date === bangkokDateKey()
        ? prev.dailyQuests
        : dailyQuestSet(bangkokDateKey());
      const updateList = (list) => list.map((quest) => {
        if (quest.status !== "accepted" || quest.event !== event) return quest;
        let progress = quest.progress || 0;
        let uniqueItems = quest.uniqueItems || [];
        if (event === "purchase_item") {
          if (quest.itemId !== payload.itemId) return quest;
          progress += payload.quantity || 1;
        } else if (event === "collect_types") {
          uniqueItems = [...new Set([...uniqueItems, payload.itemId])];
          progress = uniqueItems.length;
        } else {
          progress += payload.amount || 1;
        }
        const status = progress >= quest.target ? "completed" : "accepted";
        return { ...quest, progress: Math.min(progress, quest.target), uniqueItems, status };
      });
      return {
        ...prev,
        dailyQuests: { ...daily, npc: updateList(daily.npc), board: updateList(daily.board) }
      };
    });
  }

  function acceptDailyQuest(source, questId) {
    setGame((prev) => {
      const daily = prev.dailyQuests || dailyQuestSet(bangkokDateKey());
      return {
        ...prev,
        dailyQuests: {
          ...daily,
          [source]: daily[source].map((q) => q.id === questId && q.status === "available"
            ? { ...q, status: "accepted" } : q)
        }
      };
    });
    setMessage("รับภารกิจรายวันแล้ว!");
  }

  function claimDailyQuest(source, questId) {
    setGame((prev) => {
      const daily = prev.dailyQuests;
      const quest = daily?.[source]?.find((q) => q.id === questId);
      if (!quest || quest.status !== "completed") return prev;
      return {
        ...prev,
        cash: prev.cash + quest.reward,
        xp: prev.xp + quest.xp,
        dailyQuests: {
          ...daily,
          [source]: daily[source].map((q) => q.id === questId
            ? { ...q, status: "claimed" } : q)
        }
      };
    });
    setMessage("รับรางวัลภารกิจรายวันแล้ว!");
  }


  const activeMission = MISSIONS.find(
    (item) => item.id === game.activeMissionId
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }, [game]);

  function openPanel(type) {
    setMessage("");
    if (typeof type === "string" && type.startsWith("lesson-device:")) {
      setSelectedDevice(type.split(":")[1]);
      setDeviceAnswers({});
      setDeviceResult(null);
      setPanel("device-lesson");
      return;
    }

    if (type === "npc-quests" || type === "board-quests") {
      setDailySource(type === "npc-quests" ? "npc" : "board");
    }

    if (type === "learning") {
      setAnswers({});
      setQuizResult(null);
    }

    setPanel(type);
  }

  function buyItem(item) {
    if (game.cash < item.price) {
      setMessage("เงินไม่เพียงพอ");
      return;
    }

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - item.price,
      inventory: {
        ...prev.inventory,
        [item.id]: (prev.inventory[item.id] || 0) + 1
      }
    }));

    recordDailyEvent("purchase_item", { itemId: item.id, quantity: 1 });
    recordDailyEvent("purchase_total", { amount: 1 });
    recordDailyEvent("collect_types", { itemId: item.id });
    setMessage(`ซื้อ ${item.name} สำเร็จ`);
  }

  function acceptMission(missionId) {
    if (!game.learningPassed) {
      setMessage("กรุณาผ่านแบบทดสอบ Learning Zone ก่อน");
      return;
    }

    if (game.activeMissionId) {
      setMessage("กรุณาทำภารกิจที่รับไว้ให้เสร็จก่อน");
      return;
    }

    const missionIndex = MISSIONS.findIndex(
      (item) => item.id === missionId
    );

    if (missionIndex < 0) return;

    if (missionIndex > 0) {
      const previousMission = MISSIONS[missionIndex - 1];

      if (!game.completedMissions.includes(previousMission.id)) {
        setMessage("กรุณาทำภารกิจก่อนหน้าให้สำเร็จก่อน");
        return;
      }
    }

    if (game.completedMissions.includes(missionId)) {
      setMessage("คุณทำภารกิจนี้สำเร็จแล้ว");
      return;
    }

    setGame((prev) => ({
      ...prev,
      missionStatus: "accepted",
      activeMissionId: missionId
    }));

    setMessage("รับภารกิจแล้ว! ลองตรวจสอบและแก้ไขปัญหาตามสถานการณ์");
  }

  function beginRepair() {
    if (!activeMission) {
      setMessage("กรุณาเลือกภารกิจก่อน");
      return;
    }

    const hasItems = activeMission.requirements.every(
      (req) =>
        (game.inventory[req.itemId] || 0) >= req.quantity
    );

    if (!hasItems) {
      setMessage("ยังไม่พร้อมเริ่มภารกิจ ลองเตรียมความพร้อมแล้วกลับมาอีกครั้ง");
      return;
    }

    setMessage("");
    setPanel("repair");
  }

  function completeRepair() {
    if (!activeMission) return;

    const mission = activeMission;

    setGame((prev) => {
      // ป้องกันการรับรางวัลซ้ำ
      if (
        prev.completedMissions.includes(mission.id) ||
        prev.activeMissionId !== mission.id
      ) {
        return prev;
      }

      // ตรวจสอบอุปกรณ์อีกครั้ง
      const hasItems = mission.requirements.every(
        (req) =>
          (prev.inventory[req.itemId] || 0) >= req.quantity
      );

      if (!hasItems) return prev;

      const inventory = { ...prev.inventory };

      // หักอุปกรณ์ที่ใช้ในภารกิจ
      for (const req of mission.requirements) {
        const remaining =
          (inventory[req.itemId] || 0) - req.quantity;

        if (remaining > 0) {
          inventory[req.itemId] = remaining;
        } else {
          delete inventory[req.itemId];
        }
      }

      return {
        ...prev,
        cash: prev.cash + mission.reward,
        xp: prev.xp + mission.xp,
        inventory,
        missionStatus: "completed",
        activeMissionId: null,
        completedMissions: [
          ...prev.completedMissions,
          mission.id
        ]
      };
    });

    recordDailyEvent("repair_complete");
    setMessage("");
    setPanel("repair-complete");
  }

  const quizScore = useMemo(
    () =>
      QUIZ.reduce(
        (score, question, index) =>
          score +
          (answers[index] === question.answer ? 1 : 0),
        0
      ),
    [answers]
  );

  const allAnswered = Object.keys(answers).length === QUIZ.length;

  function submitQuiz() {
    if (!allAnswered) {
      setMessage("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }

    const score = Math.round(
      (quizScore / QUIZ.length) * 100
    );

    setQuizResult({
      score,
      correct: quizScore
    });

    if (score >= 80) recordDailyEvent("quiz_pass");
    if (score >= 80 && !game.learningPassed) {
      setGame((prev) => ({
        ...prev,
        learningPassed: true,
        learningBestScore: Math.max(
          prev.learningBestScore || 0,
          score
        ),
        xp: prev.xp + 50
      }));

      setMessage(
        "ยินดีด้วย! ผ่านบทเรียนและปลดล็อก Mission Zone ได้รับ 50 XP"
      );
    } else {
      setGame((prev) => ({
        ...prev,
        learningBestScore: Math.max(
          prev.learningBestScore || 0,
          score
        )
      }));

      setMessage(
        score >= 80
          ? "ผ่านแบบทดสอบแล้ว! Mission Zone ปลดล็อกอยู่แล้ว"
          : "ยังไม่ผ่าน ลองทบทวนบทเรียนแล้วทำแบบทดสอบอีกครั้ง"
      );
    }
  }

  return (
    <main className="app">
      <header className="hud">
        <div>
          <h1>🖥 Computer Repair Adventure</h1>
          <p>Pixel Repair World · เรียนรู้ก่อนลงมือซ่อม</p>
        </div>

        <div className="player-stats">
          <span>💵 {game.cash} Cash</span>
          <span>⭐ {game.xp} XP</span>
          <span>
            📚 {game.learningPassed ? "Learning Passed" : "Learning Locked"}
          </span>
        </div>
      </header>

      <section className="game-area">
        <Game onInteract={openPanel} />
        <p className="game-help">
          WASD / Arrow Keys: เดิน · E: คุยกับ NPC หรือเข้าใช้งานอาคาร
        </p>
      </section>

      <nav className="quick-menu">
        <button onClick={() => openPanel("learning")}>
          📚 Learning Zone {game.learningPassed ? "✓" : "🔒"}
        </button>

        <button onClick={() => openPanel("inventory")}>
          🎒 Inventory
        </button>

        <button onClick={() => openPanel("mission")}>
          📋 Missions {game.learningPassed ? "" : "🔒"}
        </button>

        <button onClick={() => openPanel("shop")}>
          🛒 Shop
        </button>
        <button onClick={() => openPanel("npc-quests")}>🧑‍🔧 NPC Jobs</button>
        <button onClick={() => openPanel("board-quests")}>📌 Quest Board</button>
      </nav>

      {panel && (
        <div
          className="modal-backdrop"
          onClick={() => setPanel("")}
        >
          <section
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setPanel("")}
            >
              ✕
            </button>

            {(panel === "npc-quests" || panel === "board-quests") && (
              <>
                <h2>{dailySource === "npc" ? "🧑‍🔧 ภารกิจจาก NPC" : "📌 กระดานประกาศภารกิจ"}</h2>
                <p>ภารกิจชุดนี้ประจำวันที่ {game.dailyQuests?.date} (เวลาไทย) · รีเซ็ตอัตโนมัติเมื่อขึ้นวันใหม่</p>
                <div className="mission-list">
                  {(game.dailyQuests?.[dailySource] || []).map((quest) => (
                    <article className="mission-card" key={quest.id}>
                      <span className={`status-pill ${quest.status === "completed" || quest.status === "claimed" ? "unlocked" : "locked"}`}>
                        {quest.status === "available" ? "ยังไม่รับ" : quest.status === "accepted" ? "กำลังทำ" : quest.status === "completed" ? "สำเร็จ · รอรับรางวัล" : "รับรางวัลแล้ว"}
                      </span>
                      <h3>{quest.title}</h3>
                      <p>{quest.description}</p>
                      <p>ความคืบหน้า: {quest.progress}/{quest.target}</p>
                      <p><strong>รางวัล:</strong> {quest.reward} Cash · {quest.xp} XP</p>
                      {quest.status === "available" && <button onClick={() => acceptDailyQuest(dailySource, quest.id)}>รับภารกิจ</button>}
                      {quest.status === "accepted" && <p className="mission-locked-text">ทำกิจกรรมตามเงื่อนไขเพื่อเพิ่มความคืบหน้า</p>}
                      {quest.status === "completed" && <button onClick={() => claimDailyQuest(dailySource, quest.id)}>รับรางวัล</button>}
                    </article>
                  ))}
                </div>
              </>
            )}

            {panel === "device-lesson" && DEVICE_LESSONS[selectedDevice] && (() => {
              const lesson = DEVICE_LESSONS[selectedDevice];
              const allAnswered = lesson.quiz.every((_, i) => deviceAnswers[i] !== undefined);
              const score = lesson.quiz.reduce((n, q, i) => n + (deviceAnswers[i] === q.a ? 1 : 0), 0);
              return <>
                <div className="panel-heading"><div><span className="lesson-category">บทเรียนประจำสถานี</span><h2>{lesson.icon} {lesson.title}</h2><p>{lesson.summary}</p></div><span className="status-pill unlocked">ห้องเรียนภาคปฏิบัติ</span></div>
                <div className="device-lesson-sections">{lesson.sections.map(([heading, body], i) => <article className="device-lesson-section" key={heading}><h3>{i + 1}. {heading}</h3><p>{body}</p></article>)}</div>
                <div className="quiz-box"><h3>📝 แบบทดสอบ: {lesson.title}</h3><p>ตอบคำถามให้ครบทั้ง {lesson.quiz.length} ข้อ แล้วกดตรวจคำตอบ</p>
                  {lesson.quiz.map((q, i) => <div className="question" key={i}><p><strong>{i + 1}. {q.q}</strong></p><div className="answer-grid">{q.o.map((option, j) => <label className={`answer-option ${deviceAnswers[i] === j ? "selected" : ""}`} key={j}><input type="radio" name={`device-${selectedDevice}-${i}`} checked={deviceAnswers[i] === j} onChange={() => {setDeviceAnswers(prev => ({...prev,[i]:j}));setDeviceResult(null);}} />{option}</label>)}</div>{deviceResult && <p className={`explanation ${deviceAnswers[i] === q.a ? "correct" : "incorrect"}`}>{deviceAnswers[i] === q.a ? "✓ ถูกต้อง" : `✗ คำตอบที่ถูก: ${q.o[q.a]}`} — {q.e}</p>}</div>)}
                  <div className="quiz-actions"><span>ตอบแล้ว {Object.keys(deviceAnswers).length}/{lesson.quiz.length} ข้อ</span><button disabled={!allAnswered} onClick={() => setDeviceResult({score,percent:Math.round(score/lesson.quiz.length*100)})}>ตรวจแบบทดสอบ</button></div>
                  {deviceResult && <div className={`quiz-result ${deviceResult.percent >= 80 ? "passed" : "failed"}`}><strong>คะแนน {deviceResult.score}/{lesson.quiz.length} ({deviceResult.percent}%)</strong><p>{deviceResult.percent >= 80 ? "ยอดเยี่ยม! ผ่านแบบทดสอบอุปกรณ์ชิ้นนี้แล้ว" : "ยังไม่ผ่าน ลองอ่านบทเรียนอีกครั้งแล้วทำใหม่ได้"}</p></div>}
                </div>
                <button onClick={() => {setPanel("");setDeviceAnswers({});setDeviceResult(null);}}>กลับไปเดินสำรวจห้องเรียน</button>
              </>;
            })()}

            {/* LEARNING ZONE */}
            {panel === "learning" && (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>📚 Learning Zone</h2>
                    <p>
                      บทเรียน: อุปกรณ์ต่อพ่วงคอมพิวเตอร์
                      (Computer Peripherals)
                    </p>
                  </div>

                  <span
                    className={`status-pill ${
                      game.learningPassed ? "unlocked" : "locked"
                    }`}
                  >
                    {game.learningPassed ? "ผ่านแล้ว" : "ยังไม่ผ่าน"}
                  </span>
                </div>

                <div className="lesson-grid">
                  {LESSONS.map((lesson) => (
                    <article className="lesson-card" key={lesson.id}>
                      <div className="lesson-icon">{lesson.icon}</div>
                      <span className="lesson-category">
                        {lesson.category}
                      </span>
                      <h3>{lesson.name}</h3>
                      <p>{lesson.description}</p>
                      <p className="lesson-example">
                        {lesson.example}
                      </p>
                      <strong>{lesson.fact}</strong>
                    </article>
                  ))}
                </div>

                <div className="quiz-box">
                  <div className="quiz-title">
                    <div>
                      <h3>📝 แบบทดสอบท้ายบท</h3>
                      <p>
                        จำนวน {QUIZ.length} ข้อ · ต้องได้อย่างน้อย 80%
                      </p>
                    </div>

                    {game.learningPassed && (
                      <span className="success">
                        ✓ ปลดล็อก Mission Zone
                      </span>
                    )}
                  </div>

                  {QUIZ.map((question, index) => (
                    <div className="question" key={index}>
                      <p>
                        <strong>
                          {index + 1}. {question.question}
                        </strong>
                      </p>

                      <div className="answer-grid">
                        {question.options.map((option, optionIndex) => (
                          <label
                            className={`answer-option ${
                              answers[index] === optionIndex
                                ? "selected"
                                : ""
                            }`}
                            key={optionIndex}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={answers[index] === optionIndex}
                              onChange={() => {
                                setAnswers((prev) => ({
                                  ...prev,
                                  [index]: optionIndex
                                }));
                                setQuizResult(null);
                              }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>

                      {quizResult && (
                        <p
                          className={`explanation ${
                            answers[index] === question.answer
                              ? "correct"
                              : "incorrect"
                          }`}
                        >
                          {answers[index] === question.answer
                            ? "✓ ตอบถูก"
                            : `✗ คำตอบที่ถูก: ${question.options[question.answer]}`}
                          {" — "}
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="quiz-actions">
                    <span>
                      ตอบแล้ว {Object.keys(answers).length}/{QUIZ.length} ข้อ
                    </span>

                    <button
                      onClick={submitQuiz}
                      disabled={!allAnswered}
                    >
                      ส่งคำตอบและตรวจคะแนน
                    </button>
                  </div>

                  {quizResult && (
                    <div
                      className={`quiz-result ${
                        quizResult.score >= 80 ? "passed" : "failed"
                      }`}
                    >
                      <strong>
                        คะแนน {quizResult.correct}/{QUIZ.length}
                        {" "}({quizResult.score}%)
                      </strong>
                      <p>
                        {quizResult.score >= 80
                          ? "ยอดเยี่ยม! คุณผ่านบทเรียนแล้ว"
                          : "ยังไม่ผ่าน กรุณาทบทวนและลองอีกครั้ง"}
                      </p>
                    </div>
                  )}

                  {game.learningBestScore > 0 && (
                    <p className="best-score">
                      คะแนนสูงสุดที่เคยได้: {game.learningBestScore}%
                    </p>
                  )}
                </div>
              </>
            )}

            {/* SHOP */}
            {panel === "shop" && (
              <>
                <h2>🛒 Computer Shop</h2>
                <p className="cash-display">
                  เงินคงเหลือ: {game.cash} Cash
                </p>

                <div className="item-grid">
                  {SHOP_ITEMS.map((item) => (
                    <article className="item-card" key={item.id}>
                      <div className="item-icon">{item.icon}</div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <strong>{item.price} Cash</strong>
                      <button
                        disabled={game.cash < item.price}
                        onClick={() => buyItem(item)}
                      >
                        Buy
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* INVENTORY */}
            {panel === "inventory" && (
              <>
                <h2>🎒 Inventory</h2>

                <div className="item-grid">
                  {SHOP_ITEMS
                    .filter(
                      (item) => (game.inventory[item.id] || 0) > 0
                    )
                    .map((item) => (
                      <article className="item-card" key={item.id}>
                        <div className="item-icon">{item.icon}</div>
                        <h3>{item.name}</h3>
                        <p>จำนวน: {game.inventory[item.id]}</p>
                      </article>
                    ))}
                </div>

                {Object.values(game.inventory).every(
                  (count) => count <= 0
                ) && <p>ยังไม่มีอุปกรณ์ในกระเป๋า</p>}
              </>
            )}

            {/* MISSION CENTER */}
            {panel === "mission" && (
              <>
                <h2>📋 Mission Center</h2>

                {!game.learningPassed ? (
                  <div className="locked-panel">
                    <div className="lock-icon">🔒</div>
                    <h3>Mission Zone ยังไม่ปลดล็อก</h3>
                    <p>
                      กรุณาผ่านแบบทดสอบ Learning Zone
                      ให้ได้อย่างน้อย 80%
                    </p>
                    <button onClick={() => openPanel("learning")}>
                      ไปที่ Learning Zone
                    </button>
                  </div>
                ) : (
                  <div className="mission-list">
                    {MISSIONS.map((item, index) => {
                      const completed =
                        game.completedMissions.includes(item.id);

                      const previousCompleted =
                        index === 0 ||
                        game.completedMissions.includes(
                          MISSIONS[index - 1].id
                        );

                      const locked = !previousCompleted;
                      const isActive =
                        game.activeMissionId === item.id;

                      return (
                        <article
                          className="mission-card"
                          key={item.id}
                        >
                          <span
                            className={`status-pill ${
                              completed || !locked
                                ? "unlocked"
                                : "locked"
                            }`}
                          >
                            {completed
                              ? "✓ COMPLETED"
                              : locked
                              ? "🔒 LOCKED"
                              : `MISSION 0${index + 1}`}
                          </span>

                          <h3>{item.title}</h3>
                          <p>{item.description}</p>

                          <p>
                            <strong>รางวัล:</strong>{" "}
                            {item.reward} Cash · {item.xp} XP
                          </p>

                          {completed ? (
                            <strong className="success">
                              ✓ Mission Completed
                            </strong>
                          ) : locked ? (
                            <p className="mission-locked-text">
                              ทำภารกิจก่อนหน้าให้สำเร็จก่อน
                            </p>
                          ) : isActive ? (
                            <button onClick={beginRepair}>
                              🔧 เริ่มทำภารกิจ
                            </button>
                          ) : game.activeMissionId ? (
                            <p className="mission-locked-text">
                              กรุณาทำภารกิจที่รับไว้ให้เสร็จก่อน
                            </p>
                          ) : (
                            <button
                              onClick={() => acceptMission(item.id)}
                            >
                              Accept Mission
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* DRAG & DROP REPAIR */}
            {panel === "repair" && activeMission && (
              <RepairDragDrop
                key={activeMission.id}
                mission={activeMission}
                onComplete={completeRepair}
                onCancel={() => {
                  setMessage("");
                  setPanel("mission");
                }}
              />
            )}

            {/* REPAIR COMPLETE */}
            {panel === "repair-complete" && (
              <div className="repair-complete">
                <div className="lock-icon">🏆</div>
                <h2>ทำภารกิจสำเร็จ!</h2>
                <p>คุณติดตั้งอุปกรณ์ครบทุกชิ้นแล้ว</p>

                <div className="reward-row">
                  <strong>รับรางวัล Cash และ XP แล้ว</strong>
                </div>

                <button
                  onClick={() => {
                    setMessage("");
                    setPanel("mission");
                  }}
                >
                  กลับไป Mission Center
                </button>
              </div>
            )}

            {message && <p className="notice">{message}</p>}
          </section>
        </div>
      )}
    </main>
  );
}