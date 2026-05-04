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
- `GET /api/presentations` — list all presentations (summary: id, title)

---

### Important

The frontend must send the full slideset JSON when updating a presentation (PUT).
Partial updates are not supported in Sprint 1.

---

Example Response (GET /api/presentations/{id})
```
{
    "id": "9dfd4527-c349-4eda-a08d-9e3ee572cb09",
    "filename": "presentation",
    "title": "New Presentation",
    "author": "unknown",
    "creation-date": "2026-05-04",
    "master": {
        "aspect-ratio": "16:9",
        "slide-dimensions": {
            "width": 960,
            "height": 540
        },
        "dimension-units": "px",
        "formatting": {
            "font": null,
            "size": null,
            "color": null,
            "weight": null,
            "italics": null,
            "text-decoration": null,
            "line-spacing": null,
            "list-type": null,
            "list-style": null,
            "indent-level": null,
            "margin": null,
            "align": null,
            "vertical-align": null
        },
        "color-theme": []
    },
    "fonts": [],
    "layouts": [
        {
            "layout-id": "title-layout",
            "placeholders": [
                {
                    "placeholder-id": "title",
                    "width": 800.0,
                    "height": 80.0,
                    "padding": "10px",
                    "type": "text",
                    "role": "title",
                    "background": "transparent",
                    "position": {
                        "x": 80.0,
                        "y": 80.0
                    },
                    "formatting": {
                        "font": null,
                        "size": null,
                        "color": null,
                        "weight": null,
                        "italics": null,
                        "text-decoration": null,
                        "line-spacing": null,
                        "list-type": null,
                        "list-style": null,
                        "indent-level": null,
                        "margin": null,
                        "align": null,
                        "vertical-align": null
                    }
                }
            ]
        }
    ],
    "slides": [
        {
            "title": "Title Slide",
            "layout-id": "title-layout",
            "hidden": false,
            "contents": {
                "text": [
                    {
                        "id": "text-1",
                        "placeholder-id": "title",
                        "position": {
                            "x": 80.0,
                            "y": 80.0
                        },
                        "pos-type": "relative",
                        "width": 800.0,
                        "height": 80.0,
                        "rotation": 0.0,
                        "overflow": "none",
                        "background": "transparent",
                        "paragraphs": [
                            {
                                "id": "paragraph-1",
                                "formatting": null,
                                "bullets": null,
                                "runs": [
                                    {
                                        "formatting": null,
                                        "super-sub-script": null,
                                        "text": "Click to add title",
                                        "link": null
                                    }
                                ]
                            }
                        ],
                        "z-index": 1
                    }
                ],
                "media": [],
                "background": null,
                "transition": null,
                "notes": null
            }
        }
    ]
}
```

---

## Project Structure

- `controller` — REST API endpoints
- `service` — application logic
- `model` — slideset data model
- `storage` — file-based persistence
- `validation` — slideset validation
- `exception` — error handling

---

## Data Storage

- No database is used
- Presentation data is stored as JSON files:
`storage/presentations/{id}/slideset.json`
- Image assets are stored separately:
`storage/presentations/{id}/assets/images/`
- JSON contains references to image paths

---

## Error Handling

The API returns standard HTTP status codes:

400 Bad Request — invalid slideset data
404 Not Found — presentation does not exist
500 Internal Server Error — unexpected error

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