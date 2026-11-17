import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OfferPopup from "./OfferPopup";

// The pop-up watches where the #rail section is on screen. jsdom has no layout,
// so a fake rail reports whatever position the test puts it at.
let railTop = 0;
let rail: HTMLElement;

function scrollRailTo(top: number) {
  railTop = top;
  act(() => {
    fireEvent.scroll(window);
  });
}
const atHero = () => scrollRailTo(window.innerHeight); // rail still below the screen
const atRail = () => scrollRailTo(100); // rail filling the screen

function waitForDelay() {
  act(() => {
    vi.advanceTimersByTime(1200);
  });
}

const popup = () => screen.queryByRole("complementary", { name: /opening offer/i });

beforeEach(() => {
  vi.useFakeTimers();
  rail = document.createElement("section");
  rail.id = "rail";
  rail.getBoundingClientRect = () => ({ top: railTop }) as DOMRect;
  document.body.append(rail);
  railTop = window.innerHeight;
});

afterEach(() => {
  vi.useRealTimers();
  rail.remove();
});

describe("OfferPopup", () => {
  it("stays hidden on the hero, which has its own email form", () => {
    render(<OfferPopup signedUp={false} onSignedUp={vi.fn()} />);
    atHero();
    waitForDelay();

    expect(popup()).not.toBeInTheDocument();
  });

  it("waits a moment after reaching the rail, then slides in", () => {
    render(<OfferPopup signedUp={false} onSignedUp={vi.fn()} />);
    atRail();
    expect(popup()).not.toBeInTheDocument();

    waitForDelay();
    expect(popup()).toBeInTheDocument();
    expect(popup()).toHaveTextContent(/15% off your first order/i);
  });

  it("hides again when the visitor scrolls back up to the hero", () => {
    render(<OfferPopup signedUp={false} onSignedUp={vi.fn()} />);
    atRail();
    waitForDelay();
    atHero();

    expect(popup()).not.toBeInTheDocument();
  });

  it("stays closed after the × is pressed, even when scrolling back to the rail", () => {
    render(<OfferPopup signedUp={false} onSignedUp={vi.fn()} />);
    atRail();
    waitForDelay();

    fireEvent.click(screen.getByRole("button", { name: /close the offer/i }));
    expect(popup()).not.toBeInTheDocument();

    atHero();
    atRail();
    waitForDelay();
    expect(popup()).not.toBeInTheDocument();
  });

  it("never shows to someone who already signed up in the hero", () => {
    render(<OfferPopup signedUp onSignedUp={vi.fn()} />);
    atRail();
    waitForDelay();

    expect(popup()).not.toBeInTheDocument();
  });

  it("can't be reached with the keyboard while hidden", () => {
    render(<OfferPopup signedUp={false} onSignedUp={vi.fn()} />);
    const aside = document.querySelector("aside")!;
    expect(aside).toHaveAttribute("inert");

    atRail();
    waitForDelay();
    expect(aside).not.toHaveAttribute("inert");
  });

  it("signs up with a valid email and explains that no code will arrive", async () => {
    const onSignedUp = vi.fn();
    render(<OfferPopup signedUp={false} onSignedUp={onSignedUp} />);
    atRail();
    waitForDelay();
    vi.useRealTimers();

    const user = userEvent.setup();
    const input = screen.getByLabelText(/your email/i);
    await user.type(input, "anna@example.com");
    await user.click(screen.getByRole("button", { name: /get 15%/i }));

    expect(onSignedUp).toHaveBeenCalledOnce();
    expect(input).toHaveValue("");
    expect(screen.getByRole("dialog")).toHaveTextContent(/no 15% code/i);
  });

  it("rejects an invalid email", async () => {
    const onSignedUp = vi.fn();
    render(<OfferPopup signedUp={false} onSignedUp={onSignedUp} />);
    atRail();
    waitForDelay();
    vi.useRealTimers();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/your email/i), "anna@");
    await user.click(screen.getByRole("button", { name: /get 15%/i }));

    expect(onSignedUp).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
