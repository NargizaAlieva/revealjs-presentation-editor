package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Placeholder {

    private String placeholderId;
    private Double width;
    private Double height;
    private String padding;
    private String type;
    private String role;
    private String background;

    private Position position;
    private Formatting formatting;
}