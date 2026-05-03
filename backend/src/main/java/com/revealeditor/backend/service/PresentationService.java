package com.revealeditor.backend.service;

import com.revealeditor.backend.model.Slideset;
import com.revealeditor.backend.storage.PresentationStorageService;
import com.revealeditor.backend.validation.SlidesetValidator;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PresentationService {

    private final DefaultPresentationFactory defaultPresentationFactory;
    private final PresentationStorageService storageService;
    private final SlidesetValidator  slidesetValidator;

    public PresentationService(DefaultPresentationFactory defaultPresentationFactory,
                               PresentationStorageService storageService,
                               SlidesetValidator slidesetValidator) {
        this.defaultPresentationFactory = defaultPresentationFactory;
        this.storageService = storageService;
        this.slidesetValidator = slidesetValidator;

    }

    public Slideset createPresentation() {
        Slideset slideset = defaultPresentationFactory.createDefaultPresentation();

        slidesetValidator.validate(slideset);
        storageService.save(slideset);

        return slideset;
    }

    public Slideset getPresentation(String id) {
        return storageService.load(id);
    }

    public Slideset updatePresentation(String id, Slideset slideset) {
        slideset.setId(id);

        slidesetValidator.validate(slideset);
        storageService.save(slideset);

        return slideset;
    }
}