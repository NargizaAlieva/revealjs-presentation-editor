package com.revealeditor.backend.controller;

import com.revealeditor.backend.model.Slideset;
import com.revealeditor.backend.service.PresentationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/presentations")
@CrossOrigin(origins = "http://localhost:5173")
public class PresentationController {

    private final PresentationService presentationService;

    public PresentationController(PresentationService presentationService) {
        this.presentationService = presentationService;
    }

    @PostMapping
    public Slideset createPresentation() {
        return presentationService.createPresentation();
    }

    @GetMapping("/{id}")
    public Slideset getPresentation(@PathVariable String id) {
        return presentationService.getPresentation(id);
    }

    @GetMapping()
    public Slideset getAllPresentations() {
        return presentationService.getAllPresentations();
    }

    @PutMapping("/{id}")
    public Slideset updatePresentation(@PathVariable String id,
                                       @RequestBody Slideset slideset) {
        return presentationService.updatePresentation(id, slideset);
    }
}
