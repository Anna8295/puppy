import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GARMENTS } from "../wardrobe";
import Rack from "./Rack";

// Hover and tap are covered by the end-to-end tests in a real browser; here we check
// that the rail works with a keyboard and tells screen readers what is going on.
describe("Rack", () => {
  it("shows one button and one described image per garment", () => {
    render(<Rack />);

    expect(screen.getByRole("heading", { name: /five pieces for colder walks/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^turn the/i })).toHaveLength(GARMENTS.length);
    for (const garment of GARMENTS) {
      expect(screen.getByRole("img", { name: new RegExp(`${garment.name}.*${garment.colour}`) })).toBeInTheDocument();
    }
  });

  it("turns a piece to the front with the keyboard and announces its name", async () => {
    const user = userEvent.setup();
    render(<Rack />);
    const slicker = screen.getByRole("button", { name: /rain slicker in mustard/i });

    slicker.focus();
    await user.keyboard("{Enter}");

    expect(slicker).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Rain Slicker")).toBeInTheDocument();
    expect(screen.getByText("Mustard")).toBeInTheDocument();
  });

  it("puts the piece back with Escape", async () => {
    const user = userEvent.setup();
    render(<Rack />);
    const slicker = screen.getByRole("button", { name: /rain slicker in mustard/i });

    slicker.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");

    expect(slicker).toHaveAttribute("aria-pressed", "false");
  });

  it("only has one piece turned at a time", async () => {
    const user = userEvent.setup();
    render(<Rack />);
    const [first, second] = screen.getAllByRole("button", { name: /^turn the/i });

    first.focus();
    await user.keyboard("{Enter}");
    second.focus();
    await user.keyboard("{Enter}");

    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(second).toHaveAttribute("aria-pressed", "true");
  });

  it("offers the fitting room for the piece that's open, when the try-on is set up", async () => {
    vi.stubEnv("VITE_TRY_ON_URL", "https://try-on.example");
    const user = userEvent.setup();
    render(<Rack />);
    await user.click(screen.getByRole("button", { name: /turn the rain slicker/i }));
    await user.click(screen.getByRole("button", { name: "Try the Rain Slicker on your dog" }));

    expect(screen.getByRole("dialog", { name: /try it on your dog/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Rain Slicker, Mustard" })).toBeChecked();
    vi.unstubAllEnvs();
  });

  it("hides the fitting room when the try-on isn't set up", () => {
    render(<Rack />);
    expect(screen.queryByRole("button", { name: /on your dog/i })).not.toBeInTheDocument();
  });
});
