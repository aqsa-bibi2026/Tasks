import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Counter from "../components/Counter";

describe("Counter Component", () => {
  test("renders counter with initial value", () => {
    render(<Counter />);

    expect(screen.getByText("Counter: 0")).toBeInTheDocument();
  });

  test("increments counter when button is clicked", () => {
    render(<Counter />);

    const button = screen.getByRole("button", {
      name: "Increment"
    });

    fireEvent.click(button);

    expect(screen.getByText("Counter: 1")).toBeInTheDocument();
  });
});