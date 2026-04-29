# Frontend — Web-Based Presentation Editor

## 📌 Overview
This module implements the frontend of the web-based presentation editor.

It provides a graphical user interface that allows users to create, edit, and manage presentation slides interactively. The frontend is responsible for rendering the editor interface, handling user interactions, and updating the UI in real time.

---

## 🎯 Responsibilities

The frontend (Presentation Layer) is responsible for:

- Rendering the editor interface
- Handling user interactions (click, input, drag & drop)
- Managing UI state (selected slide, content updates)
- Communicating with the backend via REST APIs
- Displaying the presentation preview using reveal.js

---

## ⚙️ Technologies

- React (UI framework)
- Vite (development and build tool)
- JavaScript (ES6+)
- HTML5 / CSS3

---

## 🧩 Main Components

### EditorPage
Main container of the editor interface.  
Combines all UI elements such as slide list, toolbar, and editing canvas.

### SlideList
Displays all slides of the presentation and allows slide selection.

### EditorCanvas
Represents the editable workspace where slide content is displayed and modified.

### Toolbar
Provides editing tools such as formatting, adding elements, and actions.

---

## 🏗️ Architecture

The frontend follows a component-based architecture using React.

- Components are modular and reusable
- State is managed locally (and can be extended with global state if needed)
- UI updates are performed immediately after user interaction

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Open in browser
http://localhost:5173

---

## 📁 Project Structure

```
src/
├── components/
│   ├── SlideList.jsx
│   ├── EditorCanvas.jsx
│   └── Toolbar.jsx
├── pages/
│   └── EditorPage.jsx
├── App.jsx
└── main.jsx
```

---

## 🔄 Data Flow

1. User interacts with the UI (e.g., edits text, selects slide)
2. State is updated in React components
3. UI re-renders immediately
4. (Future) Changes are sent to backend via API

---

## 📌 Current Status (Sprint 1)

- Editor layout implemented
- Basic slide navigation
- Text editing functionality
- Initial UI structure

---

## 🔜 Next Steps

- Implement drag & drop functionality
- Integrate backend API
- Add reveal.js preview
- Improve UI/UX

---

## 📄 Notes

- The focus of Sprint 1 is functionality, not final design
- Mock data can be used before backend integration
- Code should remain modular and maintainable