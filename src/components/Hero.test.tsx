import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Hero from "./Hero";

function setup() {
  const onSignedUp = vi.fn();
  render(<Hero onSignedUp={onSignedUp} />);
  return {
    onSignedUp,
    user: userEvent.setup(),
    input: screen.getByLabelText(/join the list for 15% off/i),
    submit: screen.getByRole("button", { name: /notify me/i }),
  };
}

describe("Hero email form", () => {
  it("shows the headline and says the form is only a demo", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dressed for every walk.");
    expect(screen.getByText(/demo only: nothing is sent or stored/i)).toBeInTheDocument();
  });

  it("does nothing when the field is empty", async () => {
    const { user, submit, onSignedUp } = setup();
    await user.click(submit);

    expect(onSignedUp).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rejects an address that isn't an email and keeps what was typed", async () => {
    const { user, input, submit, onSignedUp } = setup();
    await user.type(input, "not-an-email");
    await user.click(submit);

    expect(input).toBeInvalid();
    expect(input).toHaveValue("not-an-email");
    expect(onSignedUp).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("accepts a valid email, clears the field and explains that nothing is sent", async () => {
    const { user, input, submit, onSignedUp } = setup();
    await user.type(input, "  anna@example.com  ");
    await user.click(submit);

    expect(onSignedUp).toHaveBeenCalledOnce();
    expect(input).toHaveValue("");
    expect(screen.getByRole("dialog")).toHaveTextContent(/no emails will be fetched/i);
  });

  it("can be submitted with the Enter key", async () => {
    const { user, input, onSignedUp } = setup();
    await user.type(input, "anna@example.com{Enter}");

    expect(onSignedUp).toHaveBeenCalledOnce();
  });
});
