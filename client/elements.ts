const ensure = <T extends HTMLElement>(q: string) => {
  const element = document.querySelector(q);
  if (element === null) {
    throw new Error(`Element '${q}' does not exist!`);
  }
  return element as T;
};

export const folder = ensure<HTMLDivElement>("#folder");

export const backButton = ensure<HTMLButtonElement>("#back-button");
export const deleteButton = ensure<HTMLButtonElement>("#delete-button");

export const file = ensure<HTMLTextAreaElement>("#file");

export const content = ensure<HTMLDivElement>("#content");

export const addButtonsContainer = ensure<HTMLDivElement>("#add-buttons");

export const addFile = ensure<HTMLButtonElement>("#add-file");

export const addFolder = ensure<HTMLButtonElement>("#add-folder");

export const fileUpload = ensure<HTMLInputElement>("#file-upload");
export const uploadButton = ensure<HTMLLabelElement>("#upload-button");

export const downloadButton = ensure<HTMLAnchorElement>("#download-button");

export const image = ensure<HTMLImageElement>("#image");
export const imageContainer = ensure<HTMLDivElement>("#image-container");

export const promptEl = {
  container: ensure<HTMLDivElement>("#prompt-container"),
  card: ensure<HTMLDivElement>("#prompt-card"),
  cancel: ensure<HTMLButtonElement>("#prompt-cancel"),
  save: ensure<HTMLButtonElement>("#prompt-save"),
  title: ensure<HTMLDivElement>("#prompt-title"),
  input: ensure<HTMLInputElement>("#prompt-input"),
};

export const confirmEl = {
  container: ensure<HTMLDivElement>("#confirm-container"),
  card: ensure<HTMLDivElement>("#confirm-card"),
  cancel: ensure<HTMLButtonElement>("#confirm-cancel"),
  continue: ensure<HTMLButtonElement>("#confirm-continue"),
  title: ensure<HTMLDivElement>("#confirm-title"),
};
