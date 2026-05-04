package com.revealeditor.backend.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revealeditor.backend.dto.PresentationSummary;
import com.revealeditor.backend.exception.InvalidSlidesetException;
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
                throw new InvalidSlidesetException("Slideset must not be null");
            }

            if (slideset.getId() == null || slideset.getId().isBlank()) {
                throw new InvalidSlidesetException("Slideset ID must not be null or empty");
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
                throw new ProviderNotFoundException(id);
            }

            return objectMapper.readValue(filePath.toFile(), Slideset.class);

        } catch (IOException e) {
            throw new RuntimeException("Failed to load presentation: " + id, e);
        }
    }

    public List<PresentationSummary> listPresentationSummaries() {
        try {
            Files.createDirectories(storageRoot);

            try (var stream = Files.list(storageRoot)) {
                return stream
                        .filter(Files::isDirectory)
                        .map(path -> path.resolve("slideset.json"))
                        .filter(Files::exists)
                        .map(path -> {
                            try {
                                Slideset slideset = objectMapper.readValue(path.toFile(), Slideset.class);
                                return new PresentationSummary(
                                        slideset.getId(),
                                        slideset.getTitle()
                                );
                            } catch (IOException e) {
                                throw new RuntimeException("Failed to read presentation file: " + path, e);
                            }
                        })
                        .toList();
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to list presentations", e);
        }
    }
}