# Web-based Editor for Reveal.js Slides – Backend

## Overview
This backend is part of a web-based editor for creating and managing reveal.js presentations.

It is implemented using Spring Boot and provides a lightweight REST API for handling presentation data.  
The system follows a JSON-based slideset model and focuses on simplicity and clarity for the Minimum Viable Product (MVP).

---

## Features
- Create new presentations
- Save and load presentations
- Validate slideset structure (basic validation)
- Store presentation data as JSON files
- Support image references within the slideset model
- Provide backend support for frontend editor integration

---

## Tech Stack
- Java 17
- Spring Boot
- Maven

---

## How to Run

### Option 1 — IntelliJ
Run `BackendApplication.java`

### Option 2 — Command Line
```bash
./mvnw spring-boot:run
```

The backend will start at: `http://localhost:8080`

---

## REST API

The backend provides the following endpoints:

- `POST /api/presentations` — create a new presentation
- `GET /api/presentations/{id}` — load a presentation
- `PUT /api/presentations/{id}` — save/update a presentation
- `GET /api/presentations` — list all presentations

The frontend sends the full presentation JSON, which is validated and stored by the backend.

---

## Project Structure

- `controller` — REST API endpoints
- `service` — application logic
- `model` — slideset data model
- `storage` — file-based persistence
- `validation` — slideset validation

---

## Data Storage

- No database is used
- Presentation data is stored as JSON files:
`storage/presentations/{id}/slideset.json`
- Image assets are stored separately:
`storage/presentations/{id}/assets/images/`
- JSON contains references to image paths

---

## Definition of Done

- API endpoints are implemented and functional
- Presentation data can be created, loaded, and saved
- JSON structure is consistent and valid
- Backend integrates with frontend without errors
- No critical runtime issues occur during normal usage

---

## Notes

- This backend is designed as a lightweight MVP
- No authentication or database is used
- Advanced features (export, full media handling, advanced validation) are implemented in later sprints
- The system focuses on correctness and frontend integration in Sprint 1

---

## Sprint 1 Result

A working backend that allows the frontend to create, edit, and persist a basic presentation using a structured JSON model.