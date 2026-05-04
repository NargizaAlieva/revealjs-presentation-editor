package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Formatting {

    private String font;
    private String size;
    private String color;
    private String weight;
    private Boolean italics;
    @JsonProperty("text-decoration")
    private String textDecoration;
    @JsonProperty("line-spacing")
    private String lineSpacing;
    @JsonProperty("list-type")
    private String listType;
    @JsonProperty("list-style")
    private Map<String, String> listStyle;
    @JsonProperty("indent-level")
    private Integer indentLevel;
    private String margin;
    private String align;
    @JsonProperty("vertical-align")
    private String verticalAlign;
}