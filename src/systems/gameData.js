export const INITIAL_STATE = {
  cash: 500,
  xp: 0,
  inventory: {},
  missionStatus: "available",
  activeMissionId: null,
  completedMissions: [],
  learningPassed: false,
  learningBestScore: 0
};

export const SHOP_ITEMS = [
  { id: "screwdriver", name: "Screwdriver", description: "ไขควงสำหรับถอดประกอบคอมพิวเตอร์", price: 50, icon: "🪛" },
  { id: "ram", name: "RAM", description: "หน่วยความจำหลัก ใช้เก็บข้อมูลชั่วคราวขณะทำงาน", price: 150, icon: "💾" },
  { id: "power_supply", name: "Power Supply", description: "จ่ายพลังงานไฟฟ้าให้กับส่วนประกอบภายในเครื่อง", price: 200, icon: "🔌" },
  { id: "ssd", name: "SSD", description: "อุปกรณ์จัดเก็บข้อมูลและระบบปฏิบัติการ", price: 180, icon: "💽" },
  { id: "cpu", name: "CPU", description: "ประมวลผลคำสั่งและควบคุมการทำงานของคอมพิวเตอร์", price: 250, icon: "🔲" },
  { id: "thermal_paste", name: "Thermal Paste", description: "ช่วยถ่ายเทความร้อนระหว่าง CPU กับชุดระบายความร้อน", price: 80, icon: "🧴" }
];

export const LESSONS = [
  { id: "monitor", icon: "🖥️", name: "จอภาพ (Monitor)", category: "อุปกรณ์แสดงผล", description: "ทำหน้าที่แสดงผลข้อมูล ภาพ ตัวอักษร และวิดีโอจากคอมพิวเตอร์", example: "ตัวอย่าง: LED Monitor, LCD Monitor", fact: "จอภาพเป็นอุปกรณ์ส่งออกข้อมูล (Output Device)" },
  { id: "keyboard", icon: "⌨️", name: "แป้นพิมพ์ (Keyboard)", category: "อุปกรณ์รับข้อมูล", description: "ใช้ป้อนตัวอักษร ตัวเลข และคำสั่งเข้าสู่คอมพิวเตอร์", example: "ตัวอย่าง: Mechanical Keyboard, Membrane Keyboard", fact: "แป้นพิมพ์เป็นอุปกรณ์นำเข้าข้อมูล (Input Device)" },
  { id: "mouse", icon: "🖱️", name: "เมาส์ (Mouse)", category: "อุปกรณ์รับข้อมูล", description: "ใช้ควบคุมตัวชี้บนหน้าจอ คลิก เลือก และลากวางวัตถุ", example: "ตัวอย่าง: Optical Mouse, Wireless Mouse", fact: "เมาส์ช่วยควบคุมตำแหน่งและสั่งงานผ่านตัวชี้" },
  { id: "printer", icon: "🖨️", name: "เครื่องพิมพ์ (Printer)", category: "อุปกรณ์แสดงผล", description: "แปลงข้อมูลดิจิทัลให้ออกมาเป็นเอกสารหรือภาพบนกระดาษ", example: "ตัวอย่าง: Inkjet Printer, Laser Printer", fact: "เครื่องพิมพ์เป็นอุปกรณ์ส่งออกข้อมูล (Output Device)" },
  { id: "scanner", icon: "📠", name: "สแกนเนอร์ (Scanner)", category: "อุปกรณ์รับข้อมูล", description: "อ่านภาพหรือเอกสารกระดาษแล้วแปลงเป็นข้อมูลดิจิทัล", example: "ตัวอย่าง: Flatbed Scanner, Document Scanner", fact: "สแกนเนอร์เป็นอุปกรณ์นำเข้าข้อมูล (Input Device)" },
  { id: "speaker", icon: "🔊", name: "ลำโพง (Speaker)", category: "อุปกรณ์แสดงผล", description: "แปลงสัญญาณเสียงจากคอมพิวเตอร์ให้เป็นเสียงที่ผู้ใช้ได้ยิน", example: "ตัวอย่าง: ลำโพงตั้งโต๊ะ, ลำโพง USB", fact: "ลำโพงเป็นอุปกรณ์ส่งออกข้อมูลประเภทเสียง" }
];

export const QUIZ = [
  { question: "อุปกรณ์ใดทำหน้าที่แสดงภาพจากคอมพิวเตอร์?", options: ["Keyboard", "Monitor", "Mouse", "Scanner"], answer: 1, explanation: "Monitor เป็นอุปกรณ์แสดงผลภาพจากคอมพิวเตอร์" },
  { question: "อุปกรณ์ใดใช้ป้อนตัวอักษรและตัวเลขเข้าสู่คอมพิวเตอร์?", options: ["Speaker", "Printer", "Keyboard", "Monitor"], answer: 2, explanation: "Keyboard ใช้ป้อนตัวอักษร ตัวเลข และคำสั่ง" },
  { question: "ข้อใดจัดเป็นอุปกรณ์นำเข้าข้อมูล (Input Device)?", options: ["Printer", "Speaker", "Monitor", "Scanner"], answer: 3, explanation: "Scanner อ่านเอกสารและแปลงเป็นข้อมูลดิจิทัล" },
  { question: "อุปกรณ์ใดเปลี่ยนข้อมูลดิจิทัลให้เป็นเอกสารบนกระดาษ?", options: ["Printer", "Mouse", "Keyboard", "Microphone"], answer: 0, explanation: "Printer พิมพ์ข้อมูลหรือภาพลงบนกระดาษ" },
  { question: "ลำโพง (Speaker) จัดเป็นอุปกรณ์ประเภทใด?", options: ["อุปกรณ์นำเข้าข้อมูล", "อุปกรณ์แสดงผล", "อุปกรณ์จัดเก็บข้อมูล", "อุปกรณ์ประมวลผล"], answer: 1, explanation: "Speaker ส่งออกข้อมูลในรูปแบบเสียง" }
];

export const MISSIONS = [
  {
    id: "mission_01",
    title: "Computer Won't Turn On",
    description: "ลูกค้าแจ้งว่าคอมพิวเตอร์เปิดไม่ติด ตรวจสอบและเปลี่ยนชุดจ่ายไฟ",
    requirements: [
      { itemId: "screwdriver", quantity: 1 },
      { itemId: "power_supply", quantity: 1 }
    ],
    reward: 300,
    xp: 100,
    steps: [
      {
        title: "ตรวจสอบอาการ",
        prompt: "คอมพิวเตอร์เปิดไม่ติด ควรเริ่มจากอะไร?",
        options: ["เปลี่ยนจอภาพทันที", "ตรวจสอบสายไฟและแหล่งจ่ายไฟ", "ลบไฟล์ใน SSD"],
        answer: 1,
        hint: "เริ่มจากตรวจสอบไฟฟ้าที่เข้าสู่เครื่องก่อน"
      },
      {
        title: "ความปลอดภัย",
        prompt: "ก่อนเปิดฝาเคสและถอดอุปกรณ์ ควรทำอย่างไร?",
        options: ["ปิดเครื่องและถอดปลั๊ก", "จับอุปกรณ์ขณะเสียบปลั๊ก", "ใช้น้ำทำความสะอาด"],
        answer: 0,
        hint: "ต้องตัดแหล่งจ่ายไฟก่อนทำงาน"
      },
      {
        title: "ถอดชุดจ่ายไฟ",
        prompt: "เครื่องมือใดเหมาะสำหรับถอดน็อตยึด Power Supply?",
        options: ["ช้อน", "ไขควง", "กรรไกร"],
        answer: 1,
        hint: "ใช้ Screwdriver ให้ตรงกับหัวสกรู"
      },
      {
        title: "ติดตั้ง Power Supply",
        prompt: "หลังติดตั้ง Power Supply ใหม่ ควรทำสิ่งใด?",
        options: ["ต่อสายไฟให้แน่น", "ตัดสายไฟ", "ถอด RAM ออกทั้งหมด"],
        answer: 0,
        hint: "ตรวจสอบขั้วต่อไฟหลักและสายไฟอุปกรณ์ให้ครบ"
      },
      {
        title: "ทดสอบระบบ",
        prompt: "เมื่อตรวจสอบการเชื่อมต่อเรียบร้อยแล้ว ควรทำอย่างไร?",
        options: ["ปิดเคสโดยไม่ทดสอบ", "เปิดเครื่องทดสอบการทำงาน", "ถอดสายไฟออก"],
        answer: 1,
        hint: "ทดสอบว่าเครื่องเปิดติดและทำงานได้ตามปกติ"
      }
    ]
  },
  {
    id: "mission_02",
    title: "Slow Computer Upgrade",
    description: "ลูกค้าพบว่าคอมพิวเตอร์ทำงานช้า ให้ตรวจสอบและอัปเกรด RAM พร้อม SSD",
    requirements: [
      { itemId: "screwdriver", quantity: 1 },
      { itemId: "ram", quantity: 1 },
      { itemId: "ssd", quantity: 1 }
    ],
    reward: 350,
    xp: 120,
    steps: [
      {
        title: "วิเคราะห์ปัญหา",
        prompt: "คอมพิวเตอร์เปิดหลายโปรแกรมแล้วช้า ควรตรวจสอบอุปกรณ์ใดก่อน?",
        options: ["RAM", "ลำโพง", "เมาส์"],
        answer: 0,
        hint: "RAM มีผลต่อการทำงานหลายโปรแกรมพร้อมกัน"
      },
      {
        title: "เตรียมความปลอดภัย",
        prompt: "ก่อนติดตั้ง RAM และ SSD ควรทำอย่างไร?",
        options: ["ถอดปลั๊กและป้องกันไฟฟ้าสถิต", "ติดตั้งขณะเปิดเครื่อง", "ฉีดน้ำเข้าเมนบอร์ด"],
        answer: 0,
        hint: "ปิดเครื่อง ถอดปลั๊ก และระวังไฟฟ้าสถิต"
      },
      {
        title: "ติดตั้ง RAM",
        prompt: "RAM ควรติดตั้งลงในส่วนใด?",
        options: ["ช่อง RAM บนเมนบอร์ด", "ช่อง USB", "ช่องพัดลม"],
        answer: 0,
        hint: "ติดตั้ง RAM ในสล็อตหน่วยความจำบนเมนบอร์ด"
      },
      {
        title: "ติดตั้ง SSD",
        prompt: "SSD ทำหน้าที่หลักอะไร?",
        options: ["ประมวลผลคำสั่ง", "จัดเก็บข้อมูล", "จ่ายไฟให้เครื่อง"],
        answer: 1,
        hint: "SSD เป็นอุปกรณ์จัดเก็บข้อมูล"
      },
      {
        title: "ทดสอบหลังอัปเกรด",
        prompt: "หลังติดตั้ง RAM และ SSD ควรทำอย่างไร?",
        options: ["ตรวจสอบว่าอุปกรณ์ถูกตรวจพบ", "ถอด RAM ออก", "ปิดเครื่องถาวร"],
        answer: 0,
        hint: "ตรวจสอบการรู้จำอุปกรณ์และทดสอบการทำงาน"
      }
    ]
  },
  {
    id: "mission_03",
    title: "CPU Overheating",
    description: "ลูกค้าแจ้งว่าเครื่องร้อนและทำงานผิดปกติ ให้ตรวจสอบ CPU และระบบระบายความร้อน",
    requirements: [
      { itemId: "screwdriver", quantity: 1 },
      { itemId: "cpu", quantity: 1 },
      { itemId: "thermal_paste", quantity: 1 }
    ],
    reward: 450,
    xp: 150,
    steps: [
      {
        title: "ตรวจสอบอุณหภูมิ",
        prompt: "อุปกรณ์ใดเป็นส่วนที่ต้องตรวจสอบเมื่อ CPU มีอุณหภูมิสูง?",
        options: ["ระบบระบายความร้อน", "เครื่องพิมพ์", "คีย์บอร์ด"],
        answer: 0,
        hint: "ตรวจสอบฮีตซิงก์ พัดลม และการระบายความร้อน"
      },
      {
        title: "เตรียมความปลอดภัย",
        prompt: "ก่อนถอดชุดระบายความร้อนควรทำอย่างไร?",
        options: ["ปิดเครื่องและถอดปลั๊ก", "ถอดขณะเครื่องทำงาน", "เทน้ำลงบน CPU"],
        answer: 0,
        hint: "ต้องตัดไฟก่อนเริ่มทำงาน"
      },
      {
        title: "ตรวจสอบ Thermal Paste",
        prompt: "Thermal Paste มีหน้าที่อะไร?",
        options: ["เพิ่มความเร็วอินเทอร์เน็ต", "ช่วยถ่ายเทความร้อนระหว่าง CPU กับฮีตซิงก์", "เก็บข้อมูล"],
        answer: 1,
        hint: "ช่วยให้การถ่ายเทความร้อนมีประสิทธิภาพ"
      },
      {
        title: "ติดตั้งอุปกรณ์",
        prompt: "หลังทำความสะอาดพื้นผิวแล้ว ควรทำอย่างไร?",
        options: ["ทา Thermal Paste ในปริมาณเหมาะสมและติดตั้งชุดระบายความร้อน", "ทากาวทั่วไป", "ปล่อย CPU โดยไม่มีชุดระบายความร้อน"],
        answer: 0,
        hint: "ใช้ Thermal Paste สำหรับ CPU และติดตั้งฮีตซิงก์ให้แน่น"
      },
      {
        title: "ทดสอบอุณหภูมิ",
        prompt: "หลังติดตั้งเสร็จควรตรวจสอบอะไร?",
        options: ["อุณหภูมิและการทำงานของพัดลม", "สีของเคส", "เสียงจากลำโพงเท่านั้น"],
        answer: 0,
        hint: "ตรวจสอบอุณหภูมิ CPU และการหมุนของพัดลม"
      }
    ]
  }
];
