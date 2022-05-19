import {
  addButtonsContainer,
  addFile,
  addFolder,
  backButton,
  deleteButton,
  file,
  folder,
} from "./elements.ts";

import { confirm, prompt } from "./input.ts";

const back = () => {
  history.pushState(
    null,
    "",
    window.location.pathname.replace(/\/[^\/]*$/, ""),
  );
  update();
};

backButton.addEventListener("click", () => {
  back();
});

addEventListener("popstate", () => {
  update();
});

file.addEventListener("input", () => {
  fetch(`/_path/${getLoc()}`, {
    method: "PUT",
    body: file.textContent,
  });
});

deleteButton.addEventListener("click", async () => {
  if (await confirm("Delete?")) {
    await fetch(`/_path/${getLoc()}`, {
      method: "DELETE",
    });
    back();
  }
});

addFile.addEventListener("click", async () => {
  const filename = await prompt("Name?");
  if (filename === null) return;
  await fetch(`/_path/${getLoc()}/${filename}`, {
    method: "PUT",
    body: "New file",
  });
  update();
});

addFolder.addEventListener("click", async () => {
  const foldername = await prompt("Name?");
  if (foldername === null) return;
  await fetch(`/_path/${getLoc()}/${foldername}`, {
    method: "POST",
  });
  update();
});

const getLoc = () =>
  location.pathname.slice("/edit/".length).replaceAll(/(\/$)|(^\/)/g, "");

const update = async () => {
  const loc = getLoc();

  if (loc !== "") {
    backButton.style.display = "block";
  } else {
    backButton.style.display = "none";
  }

  const res = await fetch("/_path/" + loc);
  const data = await res.json();

  if (data.type === "file") {
    file.style.display = "block";
    folder.style.display = "none";
    file.value = data.data;
    addButtonsContainer.style.display = "none";
  } else {
    file.style.display = "none";
    folder.style.display = "block";
    addButtonsContainer.style.display = "block";
    folder.innerHTML = "";
    data.data.forEach((file: Deno.DirEntry) => {
      const div = document.createElement("div");
      div.className = "folder-item";
      const input = document.createElement("span");
      input.className = "folder-item-input";
      input.textContent = file.name;

      input.contentEditable = "true";

      div.addEventListener("click", () => {
        history.pushState(
          null,
          "",
          `${window.location.pathname.replace(/\/$/, "")}/${input.textContent}`,
        );
        update();
      });

      input.addEventListener("click", (e) => e.stopPropagation());

      input.addEventListener("blur", async () => {
        await fetch(`/_path/${loc}${loc ? "/" : ""}${file.name}`, {
          method: "PATCH",
          body: input.textContent,
        });
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.blur();
          e.preventDefault();
        }
      });

      div.appendChild(input);

      folder.appendChild(div);
    });
  }
};

update();
