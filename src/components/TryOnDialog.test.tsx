import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TryOnDialog from "./TryOnDialog";
import { preparePhoto, tryOn, TryOnError } from "../tryOn";

// The photo is prepared with canvas APIs jsdom doesn't have, and the picture
// comes from the Worker: both are replaced here. TryOnError stays real.
vi.mock("../tryOn", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../tryOn")>()),
  preparePhoto: vi.fn(),
  tryOn: vi.fn(),
}));

const prepared = { blob: new Blob(["jpeg"], { type: "image/jpeg" }), width: 768, height: 1024 };
const dogPhoto = () => new File(["dog"], "dog.jpg", { type: "image/jpeg" });
const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

beforeEach(() => {
  vi.mocked(preparePhoto).mockResolvedValue(prepared);
  vi.mocked(tryOn).mockResolvedValue({ image: "data:image/jpeg;base64,AAAA", remaining: 2 });
  URL.createObjectURL = vi.fn(() => "blob:photo");
  URL.revokeObjectURL = vi.fn();
});

describe("TryOnDialog", () => {
  it("starts with the piece that was open on the rail", () => {
    render(<TryOnDialog open onClose={vi.fn()} garmentId="yellow" />);
    expect(screen.getByRole("dialog", { name: /try it on your dog/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Rain Slicker, Mustard" })).toBeChecked();
  });

  it("needs a photo before it can dress the dog", () => {
    render(<TryOnDialog open onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Dress my dog" })).toBeDisabled();
    expect(screen.getByText(/location data removed in your browser/i)).toBeInTheDocument();
  });

  it("dresses the dog in the chosen piece and offers a download", async () => {
    const user = userEvent.setup();
    render(<TryOnDialog open onClose={vi.fn()} />);
    await user.upload(fileInput(), dogPhoto());
    expect(screen.getByRole("img", { name: "Your photo" })).toHaveAttribute("src", "blob:photo");

    await user.click(screen.getByRole("radio", { name: "Striped Roll-Neck, Cream & Rust" }));
    await user.click(screen.getByRole("button", { name: "Dress my dog" }));

    const picture = await screen.findByRole("img", { name: /your dog wearing the striped roll-neck/i });
    expect(picture).toHaveAttribute("src", "data:image/jpeg;base64,AAAA");
    expect(tryOn).toHaveBeenCalledWith(prepared, "lines");
    expect(screen.getByText("2 more try-ons left today.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("download", "cord-and-coat-lines.jpg");
    // the same piece again would only spend a try-on
    expect(screen.getByRole("button", { name: "Try this one" })).toBeDisabled();
  });

  it("can show the photo before and after", async () => {
    const user = userEvent.setup();
    render(<TryOnDialog open onClose={vi.fn()} />);
    await user.upload(fileInput(), dogPhoto());
    await user.click(screen.getByRole("button", { name: "Dress my dog" }));
    await user.click(await screen.findByRole("button", { name: "Show before" }));
    expect(screen.getByRole("img", { name: "Your photo" })).toBeInTheDocument();
  });

  it("says kindly when today's try-ons are used up, and stops offering more", async () => {
    vi.mocked(tryOn).mockRejectedValue(new TryOnError("visitor"));
    const user = userEvent.setup();
    render(<TryOnDialog open onClose={vi.fn()} />);
    await user.upload(fileInput(), dogPhoto());
    await user.click(screen.getByRole("button", { name: "Dress my dog" }));

    expect(await screen.findByText(/your three try-ons for today/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dress my dog" })).toBeDisabled();
  });

  it("explains when a photo can't be opened", async () => {
    vi.mocked(preparePhoto).mockRejectedValue(new TryOnError("unreadable"));
    const user = userEvent.setup();
    render(<TryOnDialog open onClose={vi.fn()} />);
    await user.upload(fileInput(), dogPhoto());
    expect(await screen.findByText(/couldn’t open that photo/i)).toBeInTheDocument();
  });

  it("closes with the close button", async () => {
    const onClose = vi.fn();
    render(<TryOnDialog open onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close the fitting room" }));
    expect(onClose).toHaveBeenCalled();
  });
});
