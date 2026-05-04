package com.revealeditor.backend.service;

import com.revealeditor.backend.model.Formatting;
import com.revealeditor.backend.model.Layout;
import com.revealeditor.backend.model.Placeholder;
import com.revealeditor.backend.model.Position;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LayoutTemplateFactory {

    private static final String TYPE_TEXT = "text";
    private static final String TYPE_IMAGE = "image";

    private static final String ROLE_TITLE = "title";
    private static final String ROLE_BODY = "body";

    public Layout createTitleLayout() {
        Placeholder title = createPlaceholder(
                "title",
                TYPE_TEXT,
                ROLE_TITLE,
                80.0, 80.0,
                800.0, 80.0,
                "10px"
        );

        Layout layout = new Layout();
        layout.setLayoutId("title");
        layout.setPlaceholders(List.of(title));

        return layout;
    }

    public Layout createTitleAndContentLayout() {
        Placeholder title = createPlaceholder(
                "title",
                TYPE_TEXT,
                ROLE_TITLE,
                80.0, 50.0,
                800.0, 70.0,
                "10px"
        );

        Placeholder body = createPlaceholder(
                "body",
                TYPE_TEXT,
                ROLE_BODY,
                80.0, 150.0,
                800.0, 300.0,
                "10px"
        );

        Layout layout = new Layout();
        layout.setLayoutId("title-content");
        layout.setPlaceholders(List.of(title, body));

        return layout;
    }

    public Layout createImageTextLayout() {
        Placeholder image = createPlaceholder(
                "image",
                TYPE_IMAGE,
                ROLE_BODY,
                80.0, 140.0,
                380.0, 280.0,
                "0px"
        );

        Placeholder body = createPlaceholder(
                "body",
                TYPE_TEXT,
                ROLE_BODY,
                500.0, 140.0,
                380.0, 280.0,
                "10px"
        );

        Layout layout = new Layout();
        layout.setLayoutId("image-text");
        layout.setPlaceholders(List.of(image, body));

        return layout;
    }

    private Placeholder createPlaceholder(
            String placeholderId,
            String type,
            String role,
            Double x,
            Double y,
            Double width,
            Double height,
            String padding
    ) {
        Placeholder placeholder = new Placeholder();
        placeholder.setPlaceholderId(placeholderId);
        placeholder.setType(type);
        placeholder.setRole(role);
        placeholder.setPosition(new Position(x, y));
        placeholder.setWidth(width);
        placeholder.setHeight(height);
        placeholder.setPadding(padding);
        placeholder.setBackground("transparent");
        placeholder.setFormatting(new Formatting());

        return placeholder;
    }
}
