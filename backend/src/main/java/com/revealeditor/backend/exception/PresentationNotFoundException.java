package com.revealeditor.backend.exception;

public class PresentationNotFoundException extends RuntimeException {

    public PresentationNotFoundException(String id) {
        super("Presentation not found: " + id);
    }
}
