package com.revealeditor.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaElement {

    private String id;

    @JsonProperty("file-link")
    private String fileLink;
    @JsonProperty("media-type")
    private String mediaType;

    private Position position;

    private Double width;
    private Double height;
    private Double rotation;

    @JsonProperty("z-index")
    private Integer zIndex;

    private Double scale;

    private List<String> crop;
    private Map<String, String> effects;
    private Map<String, String> playback;
}
