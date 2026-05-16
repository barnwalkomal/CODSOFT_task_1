# TaskFlow — To-Do List App

A simple, beautiful Android-style To-Do List app built for internship Task 1.

## Features
- ✅ Add tasks with title, description, due date & priority
- ✏️ Edit any task anytime
- ☑️ Mark tasks as completed / active
- 🗑️ Delete individual tasks or clear all completed
- 🔍 Search tasks in real time
- 🏷️ Filter by status (All / Active / Completed) and priority (High / Medium / Low)
- 💾 Auto-saves to device local storage — data persists after closing
- 📊 Live stats (Total, Pending, Completed count)
- ⚠️ Overdue task warning shown automatically

## How to Run on Android

### Option A — Open directly in browser
1. Copy `index.html` to your Android device
2. Open with Chrome or any browser
3. Tap "Add to Home Screen" for an app-like experience

### Option B — Use with Android Studio (WebView)
1. Open Android Studio → New Project → Empty Activity
2. In `activity_main.xml` add a `WebView` filling the screen
3. In `MainActivity.java` load the file:
   ```java
   WebView webView = findViewById(R.id.webView);
   webView.getSettings().setJavaScriptEnabled(true);
   webView.loadUrl("file:///android_asset/index.html");
   ```
4. Copy `index.html` to `app/src/main/assets/`
5. Build & run

### Option C — Demo in browser on PC
Just open `index.html` in any browser. Use DevTools → Toggle device toolbar (Ctrl+Shift+M) to simulate mobile view.

## File Structure
```
todo-app/
└── index.html   (entire app — HTML + CSS + JS in one file)
```

## Tech Used
- HTML5 / CSS3 / Vanilla JavaScript
- LocalStorage for data persistence
- Google Fonts (Nunito)
- No frameworks, no dependencies to install

---
Built for internship Task 1 — To-Do List App
