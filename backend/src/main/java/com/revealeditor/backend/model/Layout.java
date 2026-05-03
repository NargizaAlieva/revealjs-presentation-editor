package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Layout {

    private String layoutId;
    private List<Placeholder> placeholders = new ArrayList<>();
}