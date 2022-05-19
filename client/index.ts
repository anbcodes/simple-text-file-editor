import {
  addButtonsContainer,
  addFile,
  addFolder,
  backButton,
  deleteButton,
  downloadButton,
  file,
  fileUpload,
  folder,
  image,
  imageContainer,
  uploadButton,
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
    body: file.value,
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

const fileListToArray = (list: FileList): File[] => {
  const arr: File[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list.item(i);
    if (!item) {
      throw new Error("No file at index!");
    }
    arr.push(item);
  }

  return arr;
};

fileUpload.addEventListener("input", async () => {
  if (fileUpload.files) {
    const files = fileListToArray(fileUpload.files);
    await Promise.all(
      files.map(async (file) =>
        fetch(`/_path/${getLoc()}${getLoc() ? "/" : ""}${file.name}`, {
          method: "PUT",
          body: await file.arrayBuffer(),
        })
      ),
    );

    update();
    fileUpload.files = null;
  }
});

const getLoc = () =>
  location.pathname.slice("/edit/".length).replaceAll(/(\/$)|(^\/)/g, "");

const update = async () => {
  const loc = getLoc();

  if (loc !== "") {
    backButton.style.display = "flex";
  } else {
    backButton.style.display = "none";
  }

  const res = await fetch("/_path/" + loc);
  const data = await res.json();
  downloadButton.href = `/download/${getLoc()}`;

  if (data.type === "file") {
    folder.style.display = "none";
    uploadButton.style.display = "none";

    const dataArray = new Uint8Array(data.data);
    console.log("Got", data.data, dataArray);
    try {
      const tryDecode = new TextDecoder("utf-8", { fatal: true }).decode(
        dataArray,
      );
      file.value = tryDecode;
      file.style.display = "block";
    } catch (e) {
      if (e instanceof TypeError) {
        image.src = URL.createObjectURL(new Blob([dataArray.buffer]));
        imageContainer.style.display = "flex";
        image.onerror = () => {
          imageContainer.style.display = "none";
          folder.style.display = "block";
          folder.textContent =
            "Can not display file - it is in an invalid format";
        };
      } else {
        throw e;
      }
    }
    addButtonsContainer.style.display = "none";
  } else {
    uploadButton.style.display = "flex";
    file.style.display = "none";
    imageContainer.style.display = "none";
    folder.style.display = "block";
    addButtonsContainer.style.display = "block";
    folder.innerHTML = "";
    data.data.forEach((file: Deno.DirEntry) => {
      const div = document.createElement("div");
      div.className = "folder-item";

      const icon = document.createElement("img");
      icon.src = file.isDirectory ? "/folder.png" : "/file.png";
      icon.width = 30;
      icon.height = 30;

      div.appendChild(icon);

      const input = document.createElement("div");
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
