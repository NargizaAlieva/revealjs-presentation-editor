package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColorTheme {

    @JsonProperty("css-variable-name")
    private String cssVariableName;
    private String color;
}
