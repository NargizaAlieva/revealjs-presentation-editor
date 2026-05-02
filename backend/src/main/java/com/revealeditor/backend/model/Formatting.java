package com.revealeditor.backend.model;

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
    private String textDecoration;
    private String lineSpacing;
    private String listType;
    private Map<String, String> listStyle;
    private Integer indentLevel;
    private String margin;
    private String align;
    private String verticalAlign;
}