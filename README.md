# Web-Based Presentation Editor (reveal.js)

## 📌 Overview
This project implements a web-based editor for creating and managing presentation slides based on the reveal.js framework.

The system provides a graphical user interface that allows users to create, edit, and organize slides without requiring knowledge of HTML, CSS, or JavaScript.

The editor follows a structured data model consisting of presentations, slides, layouts, and placeholders. It supports exporting presentations into a reveal.js-compatible format.

---

## 🎯 Objectives
The main objectives of this project are:

- Provide an intuitive slide editing interface
- Enable structured presentation creation using layouts and placeholders
- Support real-time editing and preview updates (within 1 second)
- Ensure compatibility with the reveal.js presentation framework
- Deliver a scalable and maintainable system architecture

---

## ⚙️ Features

### Core Features (MVP)
- Create a new presentation
- Open and save presentations
- Export presentations as a reveal.js-compatible ZIP archive
- Add, delete, duplicate, and reorder slides
- Display the selected slide in an editable workspace
- Edit text content within placeholders
- Insert images into slides
- Drag & drop positioning and resizing of elements
- Apply layouts to slides
- Live preview of slides using reveal.js

### Planned Features
- Master slide layouts with inheritance
- Theme and color palette customization
- Font family configuration
- Animation and transition configuration (e.g., fade, slide, zoom)
- Video embedding support
- Offline support via Electron

---

## 🏗️ System Architecture

The system follows a layered architecture:

### Presentation Layer
Implemented using React.  
Responsible for rendering the user interface and handling user interactions such as editing slides, positioning elements, and triggering actions.

### Application Logic Layer
Implemented using Spring Boot.  
Receives user requests via REST APIs, processes editing operations (e.g., slide creation, content modification, layout assignment), validates input data, and manages the presentation data model.  
Ensures consistency of slides, layouts, and placeholders.

### Data Layer
Responsible for storing and loading presentation data in a structured format.  
Handles serialization and deserialization of presentation data.

---

## 🧱 Data Model

The system is based on the following core entities:

### Presentation (Slideset)
- Contains metadata (title, author, creation date)
- Contains a collection of slides
- Stores global configuration (e.g., theme, aspect ratio)

### Slide
- Represents a single presentation page
- References a layout
- Contains placeholder instances with content

### Layout
- Defines the structure of a slide
- Contains multiple placeholders with predefined position and size
- Can be reused across multiple slides

### Placeholder
- Represents an editable region within a slide
- Types include:
  - text
  - image
- Has position (x, y), size (width, height), and content

---

## 🚀 Technologies

- Frontend: React
- Backend: Spring Boot (Java)
- Presentation Framework: reveal.js
- Build Tools: Maven
- Version Control: GitLab

---

## 📦 Project Structure

```
/frontend        → React application
/backend         → Spring Boot application
/docs            → Documentation (requirements, specification, diagrams)
```

---

## ▶️ Getting Started

### Prerequisites
- Node.js
- Java 17+
- Maven

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run Backend
```bash
cd backend
mvn spring-boot:run
```

---

## 📤 Export Format

Presentations are exported as a ZIP archive containing:

- `index.html` — main reveal.js file
- `/assets` — images, styles, scripts

---

## 👥 Team

- Person A — Editor & Interaction
- Person B — Data Model & Architecture
- Person C — Rendering & Deployment

---

## 📅 Project Status

This project is developed as part of a Software Engineering course.

Current focus:
- Implementation of the Minimum Viable Product (MVP)
- Core editing functionality
- Basic reveal.js integration

---

## 📄 License
This project is developed for academic purposes only.
