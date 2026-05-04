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
public class TextElement {

    private String id;
    @JsonProperty("placeholder-id")
    private String placeholderId;

    private Position position;
    @JsonProperty("pos-type")
    private String posType;

    private Double width;
    private Double height;
    private Double rotation;

    private String overflow;

    @JsonProperty("z-index")
    private Integer zIndex;
    private String background;

    private List<Paragraph> paragraphs = new ArrayList<>();
}
