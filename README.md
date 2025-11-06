 
# 🕒 TimetableHub – Smart Timetable Generator  

<p align="center">
  <img src="https://img.shields.io/github/license/girishmore2004/TimetableHub?style=for-the-badge&color=blue" />
  <img src="https://img.shields.io/github/last-commit/girishmore2004/TimetableHub?style=for-the-badge&color=green" />
  <img src="https://img.shields.io/github/languages/top/girishmore2004/TimetableHub?style=for-the-badge&color=yellow" />
  <img src="https://img.shields.io/github/repo-size/girishmore2004/TimetableHub?style=for-the-badge&color=orange" />
  <img src="https://img.shields.io/badge/Stack-MERN-blueviolet?style=for-the-badge" />
</p>

---

## 🚀 Live Demo  

| Platform | URL |
|-----------|-----|
| 🌐 **Frontend (Vercel)** | [https://timetable-hub.vercel.app](https://timetable-hub.vercel.app) |
| ⚙️ **Backend (Railway)** | [https://timetablehub-backend-production.up.railway.app](https://timetablehub-backend-production.up.railway.app) |

---

## 🏗️ Project Overview  

**TimetableHub** is a powerful **MERN Stack-based web application** that automatically generates optimized school or college timetables.  
Users can input **teachers**, **classes**, **subjects**, and **school timings** — and the system intelligently creates a balanced timetable with no overlaps, including **PDF exports** for printing or sharing.  

---


Perfect 👌 Girish!
I can see from your screenshot that your **project architecture** is now fully structured and deployed-ready.

Here’s the **updated README section** for the **“🧩 Project Architecture”** that exactly matches your folder structure in the screenshot — including all important backend folders (`config`, `models`, `routes`, `utils`) and frontend (`src`, `public`, `build`) parts.

You can **replace the old "Project Architecture" block** in your README with this one 👇

---

## 🧩 Project Architecture  

```

TimetableHub/
│
├── /backend                              # Backend (Express + Node.js + MongoDB)
│   ├── /config
│   │   └── db.js                         # MongoDB connection setup
│   │
│   ├── /models                           # Mongoose schema definitions
│   │   ├── Class.js                      # Class data model
│   │   ├── Teacher.js                    # Teacher data model
│   │   └── Timetable.js                  # Timetable structure for generation
│   │
│   ├── /routes
│   │   └── timetable.js                  # All API endpoints for timetable generation
│   │
│   ├── /utils                            # Utility functions (helper scripts)
│   │   └── (Reserved for timetable logic / helper functions)
│   │
│   ├── .env                              # Environment variables (Mongo URI, PORT)
│   ├── package.json                      # Backend dependencies and scripts
│   ├── package-lock.json
│   ├── server.js                         # Express server entry file
│   └── node_modules/
│
├── /build                                # Frontend build output (for deployment)
│
├── /public                               # Static frontend assets
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   ├── timetable.jpg
│   ├── timetable192.jpeg
│   └── timetable512.jpeg
│
├── /src                                  # Frontend source code
│   ├── components/
│   │   └── Timetable.js                  # Main timetable generator UI & logic
│   ├── App.js
│   └── index.js
│
├── .gitignore                            # Ignored files for Git
├── README.md                             # Full project documentation
├── package.json                          # Root-level package.json (if using combined repo)
├── package-lock.json
└── render.yaml                           # Render/Railway deployment configuration


 
```


---

## ⚙️ Tech Stack  

| Layer | Technology |
|:------|:------------|
| 🎨 **Frontend** | React.js + Bootstrap |
| ⚙️ **Backend** | Node.js + Express |
| 🗄️ **Database** | MongoDB Atlas |
| ☁️ **Deployment** | Vercel (Frontend) + Railway (Backend) |
| 📄 **PDF Export** | jsPDF + jspdf-autotable |
| 🧭 **Styling** | Bootstrap 5 |

---

## ✨ Features  

- 🧑‍🏫 Add and manage **Teachers** with multiple subjects  
- 🏫 Define **Classes** and subjects they learn  
- ⏰ Configure **Opening, Closing, Recess Timings, and Class Duration**  
- 🧮 Automatic timetable generation  
- 📅 Create separate **teacher-wise** and **class-wise** schedules  
- 📥 **Export to PDF** directly from browser  
- 🌐 Full **CORS-enabled API** integration  
- 🕕 Handles **+5:30 hr IST offset** automatically for local times  
- 📱 100% **Responsive** Bootstrap UI  

---

## 🧠 Algorithm Overview  

1. Teachers and their subjects are defined.  
2. Classes and their subjects are input.  
3. School timings (opening, closing, recess, duration) are configured.  
4. Backend algorithm schedules subjects into available time slots.  
5. No overlap between teacher and class sessions.  
6. Recess time is skipped automatically.  
7. Both **class-wise** and **teacher-wise** schedules are generated and exported as PDF.  

---

## 🧾 API Documentation  

### `POST /api/timetable/generate`

#### Request Example:
```json
{
  "teacherData": [
    { "name": "A", "subjects": ["Math", "Science"] }
  ],
  "classData": [
    { "name": "1", "subjects": ["Math", "Science"] }
  ],
  "timings": {
    "opening": "01:00",
    "closing": "04:00",
    "recessStart": "02:30",
    "recessEnd": "03:00",
    "classDuration": 30
  }
}
````

#### Response Example:

```json
[
  { "class": "1", "subject": "Math", "teacher": "A", "time": "01:00" },
  { "class": "1", "subject": "Science", "teacher": "A", "time": "01:30" }
]
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
npm start
```

➡️ Runs on
`http://localhost:8080`

### `.env` File Example

```
MONGO_URI=mongodb://mongo:HDfQvonhifzPwyzfFIwVHWOAholjrRWQ@centerbeam.proxy.rlwy.net:42114
PORT=8080
```

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

➡️ Runs on
`http://localhost:3000`

Update your backend URL inside **Timetable.js**:

```js
fetch('https://timetablehub-backend-production.up.railway.app/api/timetable/generate')
```

---

## ☁️ Deployment Guide

### 🚉 Railway (Backend)

1. Connect your GitHub repo on Railway.
2. Add environment variables:

   ```
   MONGO_URI=your_connection_url
   PORT=8080
   ```
3. Deploy 🚀

### ⚛️ Vercel (Frontend)

1. Import frontend folder to Vercel.
2. Build Command → `npm run build`
3. Output Directory → `build`
4. Deploy ✅

---

## 🔐 CORS Configuration

Add this in `server.js`:

```js
const cors = require("cors");

app.use(cors({
  origin: "https://timetable-hub.vercel.app",
  credentials: true,
}));
```

---

## 📄 Example Output

**Timings Input:**

```
Opening: 01:00
Closing: 04:00
Recess: 02:30 - 03:00
Class Duration: 30 minutes
```

**Generated Output:**

| Time          | Subject | Teacher |
| ------------- | ------- | ------- |
| 01:00 - 01:30 | AA      | A       |
| 01:30 - 02:00 | BB      | A       |
| 02:30 - 03:00 | Recess  | -       |
| 03:00 - 03:30 | CC      | A       |

---

## 🧾 PDF Export Example

```js
import jsPDF from "jspdf";
import "jspdf-autotable";

const doc = new jsPDF();
doc.autoTable(["Time", "End Time", "Subject", "Teacher"], timetableData);
doc.save("Timetable.pdf");
```

---

## 📦 Dependencies

### Frontend

```bash
npm install react bootstrap jspdf jspdf-autotable
```

### Backend

```bash
npm install express mongoose cors dotenv
```

---

## 🧩 Folder Tips

* All API logic is in `routes/timetableRoutes.js`
* MongoDB connection configured in `config/db.js`
* Environment variables stored in `.env`
* `server.js` starts the Express app with proper CORS setup

---

## 🧭 Future Enhancements

* [ ] Multi-day or weekly timetable generation
* [ ] Teacher workload optimization
* [ ] Drag-and-drop timetable editing
* [ ] Admin dashboard with analytics
* [ ] AI-assisted subject allocation

---

## 👨‍💻 Developer

**👤 Girish More**
📧 [girishmore097@gmail.com](mailto:girishmore097@gmail.com)
📱 +91-9890564620
💼 MERN Stack Developer | Data Analytics | AI Enthusiast

<p align="center">
  <a href="https://github.com/girishmore2004">
    <img src="https://img.shields.io/badge/GitHub-Girish%20More-black?style=for-the-badge&logo=github" />
  </a>
  <a href="mailto:girishmore097@gmail.com">
    <img src="https://img.shields.io/badge/Email-Contact%20Me-blue?style=for-the-badge&logo=gmail" />
  </a>
</p>

---

## 📜 License

This project is licensed under the **MIT License**.
You are free to modify and distribute with proper credit.

---

<p align="center">
  ⭐ <b>Designed and Developed by Girish More</b>  
  <br>© 2025 All Rights Reserved.
</p>
```

---
