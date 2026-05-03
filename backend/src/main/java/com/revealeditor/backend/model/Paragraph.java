package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paragraph {

    private String id;
    private Formatting formatting;
    private String bullets;

    private List<Run> runs = new ArrayList<>();
}
