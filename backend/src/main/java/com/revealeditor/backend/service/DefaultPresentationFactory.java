package com.revealeditor.backend.service;

import com.revealeditor.backend.model.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
public class DefaultPresentationFactory {

    public Slideset createDefaultPresentation() {
        String id = UUID.randomUUID().toString();

        Slideset slideset = new Slideset();
        slideset.setId(id);
        slideset.setFilename("presentation");
        slideset.setTitle("New Presentation");
        slideset.setAuthor("unknown");
        slideset.setCreationDate(LocalDate.now());

        slideset.setMaster(createDefaultMaster());
        slideset.setLayouts(List.of(createTitleLayout()));
        slideset.setSlides(List.of(createTitleSlide()));

        return slideset;
    }

    private Master createDefaultMaster() {
        Master master = new Master();
        master.setAspectRatio("16:9");
        master.setSlideDimensions(new SlideDimensions(960, 540));
        master.setDimensionUnits("px");
        master.setFormatting(new Formatting());

        return master;
    }

    private Layout createTitleLayout() {
        Placeholder title = new Placeholder();
        title.setPlaceholderId("title");
        title.setPosition(new Position(80.0, 80.0));
        title.setWidth(800.0);
        title.setHeight(80.0);
        title.setType("text");
        title.setRole("title");
        title.setPadding("10px");
        title.setBackground("transparent");
        title.setFormatting(new Formatting());

        Layout layout = new Layout();
        layout.setLayoutId("title-layout");
        layout.setPlaceholders(List.of(title));

        return layout;
    }

    private Slide createTitleSlide() {
        Run titleRun = new Run();
        titleRun.setText("Click to add title");

        Paragraph titleParagraph = new Paragraph();
        titleParagraph.setId("paragraph-1");
        titleParagraph.setRuns(List.of(titleRun));

        TextElement titleText = new TextElement();
        titleText.setId("text-1");
        titleText.setPlaceholderId("title");
        titleText.setPosition(new Position(80.0, 80.0));
        titleText.setPosType("relative");
        titleText.setWidth(800.0);
        titleText.setHeight(80.0);
        titleText.setRotation(0.0);
        titleText.setOverflow("none");
        titleText.setZIndex(1);
        titleText.setBackground("transparent");
        titleText.setParagraphs(List.of(titleParagraph));

        SlideContent content = new SlideContent();
        content.setText(List.of(titleText));

        Slide slide = new Slide();
        slide.setTitle("Title Slide");
        slide.setLayoutId("title-layout");
        slide.setHidden(false);
        slide.setContents(content);

        return slide;
    }
}
