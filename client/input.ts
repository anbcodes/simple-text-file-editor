import { confirmEl, promptEl } from "./elements.ts";

let promptPromiseResolve = (_: string | null) => {};

export const prompt = (text: string): Promise<string | null> => {
  promptEl.container.style.display = "flex";
  promptEl.title.textContent = text;
  promptEl.input.value = "";

  return new Promise((resolve) => {
    promptPromiseResolve = resolve;
  });
};

promptEl.cancel.addEventListener("click", () => {
  promptPromiseResolve(null);
  promptEl.container.style.display = "none";
});

promptEl.save.addEventListener("click", () => {
  promptPromiseResolve(promptEl.input.value);
  promptEl.container.style.display = "none";
});

promptEl.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    promptPromiseResolve(promptEl.input.value);
    promptEl.container.style.display = "none";
  }
});

promptEl.card.addEventListener("click", (e) => e.stopPropagation());
promptEl.container.addEventListener("click", () => {
  promptPromiseResolve(null);
  promptEl.container.style.display = "none";
});

let confirmPromiseResolve = (_: boolean) => {};

export const confirm = (text: string): Promise<boolean> => {
  confirmEl.container.style.display = "flex";
  confirmEl.title.textContent = text;

  return new Promise((resolve) => {
    confirmPromiseResolve = resolve;
  });
};

confirmEl.cancel.addEventListener("click", () => {
  confirmPromiseResolve(false);
  confirmEl.container.style.display = "none";
});

confirmEl.continue.addEventListener("click", () => {
  confirmPromiseResolve(true);
  confirmEl.container.style.display = "none";
});

confirmEl.card.addEventListener("click", (e) => e.stopPropagation());
confirmEl.container.addEventListener("click", () => {
  confirmPromiseResolve(false);
  confirmEl.container.style.display = "none";
});
