package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slide {

    private String title;

    @JsonProperty("layout-id")
    private String layoutId;
    private Boolean hidden;

    private SlideContent contents;
}
