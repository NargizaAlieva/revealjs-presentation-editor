package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlideContent {

    private List<TextElement> text = new ArrayList<>();
    private List<MediaElement> media = new ArrayList<>();

    private String background;
    private String transition;
    private String notes;
}
