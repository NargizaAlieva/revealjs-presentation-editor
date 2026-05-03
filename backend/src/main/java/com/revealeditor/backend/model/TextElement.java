package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TextElement {

    private String id;
    private String placeholderId;

    private Position position;
    private String posType;

    private Double width;
    private Double height;
    private Double rotation;

    private String overflow;
    private Integer zIndex;
    private String background;

    private List<Paragraph> paragraphs = new ArrayList<>();
}
