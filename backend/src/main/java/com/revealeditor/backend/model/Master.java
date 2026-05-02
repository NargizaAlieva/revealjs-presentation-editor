package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Master {

    private String aspectRatio;
    private SlideDimensions slideDimensions;
    private String dimensionUnits;
    private Formatting formatting;

    private List<ColorTheme> colorTheme = new ArrayList<>();
}
