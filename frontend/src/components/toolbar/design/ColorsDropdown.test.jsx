import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { COLOR_SCHEMES } from "../../../core/model/designThemes";
import { ColorsDropdown } from "./ColorsDropdown";

describe("ColorsDropdown", () => {
  test("applies a color scheme only when it is clicked", () => {
    const onColorSchemeSelect = vi.fn();
    const scheme = COLOR_SCHEMES[0];

    const { container } = render(
      <ColorsDropdown
        currentSchemeId={scheme.id}
        onColorSchemeSelect={onColorSchemeSelect}
      />,
    );

    fireEvent.click(screen.getByTitle(scheme.name));

    const schemeButton = container.querySelector(".colors-item");
    fireEvent.mouseEnter(schemeButton);
    fireEvent.mouseLeave(schemeButton);

    expect(onColorSchemeSelect).not.toHaveBeenCalled();

    fireEvent.click(schemeButton);

    expect(onColorSchemeSelect).toHaveBeenCalledTimes(1);
    expect(onColorSchemeSelect).toHaveBeenCalledWith(scheme);
  });
});
