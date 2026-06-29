# RevealJS Presentation Editor

A browser-based presentation editor inspired by Microsoft PowerPoint, built with **React** and **Reveal.js**. The application allows users to create, edit, organize, and present slide-based presentations directly in the browser without requiring a backend server.

<img width="1918" height="1027" alt="image" src="https://github.com/user-attachments/assets/ed67d112-332c-44bc-af30-325ef292c7ad" />

## Features

* Create and manage multiple presentations
* Add, edit, and organize slides
* Rich text editing and formatting
* Image and media support
* Slide layouts and themes
* Master slide formatting
* Animations and transitions
* Local-first persistence using IndexedDB
* Presentation mode powered by Reveal.js
* Undo and redo functionality
* Import and export presentation data

## Technologies

* React
* JavaScript (ES6+)
* Reveal.js
* IndexedDB
* Vite
* CSS

## Architecture

The project follows a modular component-based architecture with a clear separation between:

* UI components
* Editor logic
* State management
* Presentation model
* Persistence layer
* Utility modules

The editor uses an event-driven approach for managing editing operations and presentation state, making it easier to extend and maintain.

## My Contributions

As part of the development team, I was primarily responsible for the **logic layer** of the application, including:

* Application state management
* Editor business logic
* Custom React hooks
* Event-driven editor functionality
* Local-first persistence
* Integration of editor logic with the user interface

## Project Structure

```text
src/
├── components/
├── hooks/
├── model/
├── reducers/
├── store/
├── utils/
└── views/
```

## Getting Started

### Prerequisites

* Node.js 18+
* npm

### Installation

```bash
git clone https://github.com/NargizaAlieva/revealjs-presentation-editor.git
cd revealjs-presentation-editor/frontend
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Team Project

This project was developed as part of a university Software Engineering course. Development was carried out collaboratively using Git and GitLab, with team members contributing to different architectural layers and application features.

## License

This project was developed for educational purposes.
