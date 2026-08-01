# 💪 PushUp Fighter

> **Your body is your weapon.** A real-time dungeon RPG where push-ups deal damage and defeat monsters.

---
## 🧠 How It Works

PushUp Fighter uses your webcam and **TensorFlow MoveNet** — a real-time AI pose detection model — to track your elbow angles as you do push-ups. Every full rep (down → up) is counted and converted into an attack against the enemy.

- **Elbow angle < 100°** = DOWN position detected
- **Elbow angle > 155°** = UP position detected → **Rep counted → Damage dealt!**
---
## ⚔️ Features

- 🎯 **Real push-up detection** via AI pose estimation (no buttons, no cheating)
- 👹 **8 unique enemies** — Goblin, Dark Bat, Skeleton, Orc Brute, Stone Golem, Shadow Mage, Dragon Whelp, and the Lich King
- 🔥 **Combo system** — do reps quickly to stack up to ×5 damage multiplier
- ✨ **3 Special Moves:**
  - 🔥 Fireball Strike (30 power)
  - 💚 Battle Heal (50 power)
  - ⚡ Rage Mode — 1.8× damage for 5 attacks (80 power)
- 💀 **Enemy AI** — each enemy attacks on a timer that gets faster on higher difficulties
- 🎨 **Hand-drawn pixel art sprites** for every character, animated in-game
- 🏰 **Dungeon arena** with torches, pillars, and chains
- 📊 **Live stats** — damage done, combo multiplier, total reps, enemies slain
- 🎚️ **3 difficulty levels** — Easy, Normal, Hard
- ⌨️ **Keyboard fallback** — press `P` to simulate a rep if no camera available

---

## 🚀 Getting Started

### Play in browser (recommended)
Just visit the live link above — allow camera access when prompted and get into push-up position!

### Run locally
```bash
git clone https://github.com/SIKALORM/pushup-fighter.git
cd pushup-fighter
# Open pushup-fighter.html in your browser
```

> **Note:** Camera/pose detection requires a browser that supports `getUserMedia` (Chrome, Firefox, Edge all work great).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| TensorFlow.js | AI model runtime |
| MoveNet (SinglePose Lightning) | Real-time pose detection |
| HTML5 Canvas | Sprite rendering & animation |
| Vanilla JavaScript | Game engine & logic |

Zero frameworks. Zero dependencies beyond TensorFlow. Runs entirely in the browser.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Fork the repo
- Add new enemies, abilities, or game modes
- Improve pose detection accuracy
- Submit a Pull Request

Please open an issue first if you're planning a big change.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
Free to use, modify, and distribute with credit.

---

Built by [SIKALORM](https://github.com/SIKALORM)
*Made with 💪 and sweat by SIKALORM*
