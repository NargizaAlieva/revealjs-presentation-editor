package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Master {

    @JsonProperty("aspect-ratio")
    private String aspectRatio;
    @JsonProperty("slide-dimensions")
    private SlideDimensions slideDimensions;
    @JsonProperty("dimension-units")
    private String dimensionUnits;
    private Formatting formatting;

    @JsonProperty("color-theme")
    private List<ColorTheme> colorTheme = new ArrayList<>();
}
