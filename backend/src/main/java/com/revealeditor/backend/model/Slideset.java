package com.revealeditor.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slideset {

    private String id;
    private String filename;
    private String title;
    private String author;
    private LocalDate creationDate;

    private Master master;
    private List<Font> fonts = new ArrayList<>();
//    private List<Layout> layouts = new ArrayList<>();
//    private List<Slide> slides = new ArrayList<>();
}