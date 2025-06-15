# ClassMate AI

**ClassMate AI** is an intelligent web application designed to streamline academic workflows for both students and faculty. It combines artificial intelligence, computer vision, and real-time notifications to simplify tasks like attendance, note-taking, quizzes, and assignment tracking.

> 🚀 Built with **React** (frontend) and **Python** (backend), integrated with **Firebase**, **Google Calendar API**, and advanced AI models.

---

## 🔑 Core Features

- ### 📸 GeoAttendance with Face Verification
  - Automatically mark attendance with **selfie-based verification** and **GPS location**.
  - Added **blink detection** for live-face verification.
  - Supports **Bluetooth-based proximity attendance**.

- ### 📚 Notes Summarization
  - Upload your class PDFs and get **AI-generated concise summaries** in paragraph form.
  - Ideal for quick revisions and study guides.

- ### 🧠 AI-Powered Quiz Generation
  - Generate quizzes from uploaded PDFs or by entering a topic.
  - Select **difficulty level** (Easy, Moderate, Hard) and take timed quizzes.
  - Get instant feedback on correct and incorrect answers.

- ### 📝 Assignment Reminders
  - Add assignments with title, description, and due date.
  - Get **automatic email reminders** via **MailerSend**.
  - Option to **Add to Google Calendar** using **OAuth 2.0** integration.

- ### 👤 User Profile Management
  - Upload and edit profile details like picture, name, ID, contact info, and more.
  - Integrated with Firebase Firestore for secure data storage.

---

## 🧪 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).  
The page auto-reloads on file changes.

### `npm run build`
Builds the app for production to the `build` folder.  
Optimized for best performance and ready for deployment.

### `npm test`
Launches the test runner in interactive watch mode.

---

## 🔐 Security & Setup Notes

- `.env`, Firebase secrets, and backend keys are **excluded from version control** (`.gitignore`).
- Sample environment variables can be found in `.env.example`.

---

## 🌐 Integrations

- **Firebase Auth & Firestore**: Authentication, storage, and real-time updates.
- **Google Calendar API**: One-click assignment calendar sync.
- **MailerSend API**: Email reminders and notifications.
- **OpenCV + Dlib**: Facial and blink detection.

---

## 📁 Project Structure Highlights

```plaintext
src/
├── App.js
├── functions/
│   ├── Attendance/
│   ├── AssignmentReminder/
│   ├── Authentication/
│   ├── Notes/
│   ├── Quiz/
│   ├── Home/
│   └── User Profile/
├── utils/
│   └── faceComparison.js
├── shared/
│   └── Layout, Header, Footer, etc.
