# Computer Repair Adventure

เกม 2D Top-down Pixel Adventure พัฒนาด้วย React, Vite และ Phaser 3

## ติดตั้งและเปิดเกม

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน Terminal (ปกติคือ http://localhost:5173/)

## การควบคุม

- WASD หรือปุ่มลูกศร: เดิน
- E: โต้ตอบกับอาคารหรือ NPC เมื่ออยู่ใกล้

## ระบบในเวอร์ชันนี้

- แผนที่สวนและลานศูนย์ซ่อมแบบ pixel-style สร้างด้วย Phaser Graphics
- ตัวละครช่างคอมพิวเตอร์และ NPC 3 จุด
- อาคาร Classroom, Computer Shop และ Repair Center
- ระบบเดินชนอาคารและขอบเขตแผนที่
- Learning Zone, แบบทดสอบผ่าน 80%, Shop, Inventory และ Mission
- บันทึกความคืบหน้าด้วย LocalStorage

หมายเหตุ: ภาพตัวละครและฉากในเวอร์ชันนี้เป็นกราฟิก pixel-style ที่วาดขึ้นด้วยโค้ด ยังไม่ได้ใช้ sprite sheet ภายนอกหรือ animation แบบหลายเฟรม

## Pixel Animation & Interior Update
- เพิ่ม walk-cycle แบบ 2 เฟรมสำหรับตัวละครผู้เล่น แยกทิศทางขึ้น/ลง/ซ้าย/ขวา
- เพิ่มบทสนทนา NPC ครูคอมพิวเตอร์ พ่อค้าช่าง และหัวหน้าช่าง (กด E เพื่อปิด)
- กด E ที่อาคารเพื่อเปิดแผงระบบเดิมและเข้าสู่ฉากภายในอาคาร
- เดินไปบริเวณประตูด้านล่างแล้วกด E เพื่อกลับสู่แผนที่ภายนอก
- ห้องภายในมีองค์ประกอบแตกต่างกันตามประเภทอาคาร


## Daily Side Quests

- Talk to the **ลูกค้าประจำ** NPC near the quest board to open NPC daily jobs.
- Interact with the **QUEST BOARD** in the map to open separate board jobs.
- NPC jobs and board jobs are selected independently and deterministically for each date in Asia/Bangkok.
- Multiple jobs from both sources can be accepted at the same time.
- Progress is recorded from in-game events (purchases, unique purchased item types, quiz pass, and main repair completion).
- Completed jobs must be claimed manually. Rewards are granted once per quest.
- Daily quest state and progress are saved in LocalStorage and reset when the Bangkok date changes.

Run locally:
1. Install Node.js (LTS).
2. Open this project folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev`.
