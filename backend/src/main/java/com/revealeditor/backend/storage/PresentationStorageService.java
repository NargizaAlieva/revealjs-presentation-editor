package com.revealeditor.backend.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revealeditor.backend.model.Slideset;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class PresentationStorageService {

    private final ObjectMapper objectMapper;
    private final Path storageRoot = Paths.get("storage", "presentations");

    public PresentationStorageService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void save(Slideset slideset) {
        try {
            if (slideset == null) {
                throw new RuntimeException("Slideset must not be null");
            }

            if (slideset.getId() == null || slideset.getId().isBlank()) {
                throw new RuntimeException("Slideset ID must not be null or empty");
            }

            Path presentationDir = storageRoot.resolve(slideset.getId());

            Files.createDirectories(presentationDir);
            Files.createDirectories(presentationDir.resolve("assets/images"));

            Path filePath = presentationDir.resolve("slideset.json");

            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(filePath.toFile(), slideset);

        } catch (IOException e) {
            throw new RuntimeException("Failed to save presentation: " + slideset.getId(), e);
        }
    }

    public Slideset load(String id) {
        try {
            Path presentationDir = storageRoot.resolve(id);
            Path filePath = presentationDir.resolve("slideset.json");

            if (!Files.exists(filePath)) {
                throw new RuntimeException("Presentation not found: " + id);
            }

            return objectMapper.readValue(filePath.toFile(), Slideset.class);

        } catch (IOException e) {
            throw new RuntimeException("Failed to load presentation: " + id, e);
        }
    }
}