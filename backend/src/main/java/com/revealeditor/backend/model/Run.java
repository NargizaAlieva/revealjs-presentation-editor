package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Run {

    private Formatting formatting;
    private String superSubScript;
    private String text;
    private Link link;
}