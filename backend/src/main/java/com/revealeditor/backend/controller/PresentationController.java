package com.revealeditor.backend.controller;

import com.revealeditor.backend.dto.PresentationSummary;
import com.revealeditor.backend.model.Slideset;
import com.revealeditor.backend.service.PresentationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presentations")
@CrossOrigin(origins = "http://localhost:5173")
public class PresentationController {

    private final PresentationService presentationService;

    public PresentationController(PresentationService presentationService) {
        this.presentationService = presentationService;
    }

    @GetMapping("/{id}")
    public Slideset getPresentation(@PathVariable String id) {
        return presentationService.getPresentation(id);
    }

    @GetMapping
    public List<PresentationSummary> listPresentations() {
        return presentationService.listPresentations();
    }

    @PostMapping
    public Slideset createPresentation() {
        return presentationService.createPresentation();
    }

    @PutMapping("/{id}")
    public Slideset updatePresentation(@PathVariable String id,
                                       @RequestBody Slideset slideset) {
        return presentationService.updatePresentation(id, slideset);
    }
}
