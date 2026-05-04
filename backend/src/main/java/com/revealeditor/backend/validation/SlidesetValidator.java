package com.revealeditor.backend.validation;

import com.revealeditor.backend.exception.InvalidSlidesetException;
import com.revealeditor.backend.model.Layout;
import com.revealeditor.backend.model.Slide;
import com.revealeditor.backend.model.Slideset;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class SlidesetValidator {

    public void validate(Slideset slideset) {
        if (slideset == null) {
            throw new InvalidSlidesetException("Slideset must not be null");
        }

        if (slideset.getTitle() == null || slideset.getTitle().isBlank()) {
            throw new InvalidSlidesetException("Slideset title must not be empty");
        }

        if (slideset.getLayouts() == null || slideset.getLayouts().isEmpty()) {
            throw new InvalidSlidesetException("Slideset must contain at least one layout");
        }

        if (slideset.getSlides() == null || slideset.getSlides().isEmpty()) {
            throw new InvalidSlidesetException("Slideset must contain at least one slide");
        }

        for (Layout layout : slideset.getLayouts()) {
            if (layout.getLayoutId() == null || layout.getLayoutId().isBlank()) {
                throw new InvalidSlidesetException("Layout must have a valid id");
            }
        }

        Set<String> layoutIds = slideset.getLayouts().stream()
                .map(Layout::getLayoutId)
                .collect(Collectors.toSet());

        for (Slide slide : slideset.getSlides()) {
            if (slide.getLayoutId() == null || slide.getLayoutId().isBlank()) {
                throw new InvalidSlidesetException("Each slide must reference a layout");
            }

            if (!layoutIds.contains(slide.getLayoutId())) {
                throw new InvalidSlidesetException("Slide references unknown layout: " + slide.getLayoutId());
            }
        }
    }
}
