import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import NotifyDialog from "./NotifyDialog";

describe("NotifyDialog", () => {
  it("is hidden while closed", () => {
    render(<NotifyDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is honest that no email or discount code will arrive", () => {
    render(<NotifyDialog open onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: /no emails will be fetched/i });

    expect(dialog).toHaveTextContent(/pretend shop/i);
    expect(dialog).toHaveTextContent(/no 15% code/i);
  });

  it("focuses the main button when it opens", () => {
    render(<NotifyDialog open onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /fair enough/i })).toHaveFocus();
  });

  it("closes with “Fair enough”", async () => {
    const onClose = vi.fn();
    render(<NotifyDialog open onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /fair enough/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("closes and scrolls to the rail with “See the rail”", async () => {
    const rail = document.createElement("section");
    rail.id = "rail";
    document.body.append(rail);
    const onClose = vi.fn();
    render(<NotifyDialog open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /see the rail/i }));

    expect(onClose).toHaveBeenCalled();
    expect(rail.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    rail.remove();
  });
});
