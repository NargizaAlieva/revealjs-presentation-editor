package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Run {

    private Formatting formatting;

    @JsonProperty("super-sub-script")
    private String superSubScript;
    private String text;
    private Link link;
}