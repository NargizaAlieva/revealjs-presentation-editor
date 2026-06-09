import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SlideList from "../SlideList";

describe("SlideList", () => {
  const slides = [
    {
      title: { content: "First Slide" },
      hidden: false,
    },
    {
      title: { content: "Second Slide" },
      hidden: true,
    },
  ];

  it("renders slide titles and hidden badge", () => {
    render(
      <SlideList slides={slides} selectedSlideId={0} onSelectSlide={vi.fn()} />,
    );

    expect(screen.getByTitle("First Slide")).toBeInTheDocument();
    expect(screen.getByTitle("Second Slide (hidden)")).toBeInTheDocument();
    expect(screen.getByText("hidden")).toBeInTheDocument();
  });

  it("calls onSelectSlide when a slide is clicked", () => {
    const onSelectSlide = vi.fn();

    render(
      <SlideList
        slides={slides}
        selectedSlideId={0}
        onSelectSlide={onSelectSlide}
      />,
    );

fireEvent.click(screen.getByTitle("Second Slide (hidden)"));
    expect(onSelectSlide).toHaveBeenCalledWith(1);
  });
});
