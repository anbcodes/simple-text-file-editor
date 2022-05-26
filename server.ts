import { Application } from "https://deno.land/x/oak/mod.ts";
import { basename, join } from "https://deno.land/std/path/mod.ts";

import { JSZip } from "https://deno.land/x/jszip/mod.ts";

const app = new Application();

const root = Deno.args[0];
const username = Deno.args[1];
const password = Deno.args[2];
const port = +(Deno.args[3] || 8080);

if (!root || !username || !password) {
  console.error("Usage: ./server [directory_to_serve] [username] [password] [port] [hide_hidden_files?]");
  Deno.exit(1);
}

app.use(async (ctx, next) => {
  if (
    ctx.request.headers.get("Authorization") !==
      `Basic ${btoa(`${username}:${password}`)}`
  ) {
    ctx.response.status = 401;
    ctx.response.headers.set(
      "WWW-Authenticate",
      'Basic realm="Access to the files"',
    );
    return;
  } else {
    await next();
  }
});

async function asyncIterToArray<V>(
  asyncIterator: AsyncIterable<V>,
): Promise<V[]> {
  const arr = [];
  for await (const i of asyncIterator) arr.push(i);
  return arr;
}

const createZipfile = async (path: string): Promise<JSZip> => {
  const zip = new JSZip();

  const add = async (root: string, path: string) => {
    const files = await Deno.readDir(join(root, path));
    for await (const file of files) {
      if (file.isFile) {
        zip.addFile(
          join(path, file.name),
          await Deno.readFile(join(root, path, file.name)),
        );
      } else if (file.isDirectory) {
        zip.folder(file.name);
        add(root, join(path, file.name));
      }
    }
  };

  await add(path, "");

  return zip;
};

app.use(async (ctx, next) => {
  await next();

  if (ctx.request.url.pathname.startsWith("/_path/")) {
    const file = join(
      root,
      decodeURIComponent(ctx.request.url.pathname.slice(7)),
    );
    if (ctx.request.method === "GET") {
      if (Deno.statSync(file).isDirectory) {
        const data = (await asyncIterToArray(Deno.readDir(file))).filter(v => !Deno.args[4] || v.name[0] !== '.');
        ctx.response.body = JSON.stringify({
          type: "directory",
          data,
        });
      } else {
        const data = await Deno.readFile(file);
        ctx.response.body = JSON.stringify({ type: "file", data: [...data] });
      }

      ctx.response.status = 200;
      ctx.response.headers.set("Content-Type", "text/json");
    } else if (ctx.request.method === "PUT") {
      const data = await ctx.request.body({ type: "bytes" }).value;
      await Deno.writeFile(file, data);
      ctx.response.status = 200;
    } else if (ctx.request.method === "DELETE") {
      await Deno.remove(file, { recursive: true });
      ctx.response.status = 200;
    } else if (ctx.request.method === "POST") {
      await Deno.mkdir(file, { recursive: true });
      ctx.response.status = 200;
    } else if (ctx.request.method === "PATCH") {
      await Deno.rename(
        file,
        join(root, await ctx.request.body({ type: "text" }).value),
      );
      ctx.response.status = 200;
    }
  } else if (ctx.request.url.pathname.startsWith("/edit")) {
    await ctx.send({
      root: "./public",
      path: "./index.html",
    });
  } else if (ctx.request.url.pathname === "/") {
    ctx.response.headers.set("Location", "/edit");
    ctx.response.status = 301;
  } else if (ctx.request.url.pathname.startsWith("/download/")) {
    const file = ctx.request.url.pathname.slice("/download/".length);
    const joinedPath = join(
      root,
      file,
    );

    if (Deno.statSync(joinedPath).isDirectory) {
      const zip = await createZipfile(joinedPath);
      const data = await zip.generateAsync({
        "type": "uint8array",
      });
      ctx.response.headers.set("Content-Type", "application/zip");
      ctx.response.headers.set(
        "content-disposition",
        `attachment; filename="${basename(file) || "all"}.zip"`,
      );
      ctx.response.body = data;
    } else {
      await ctx.send({
        path: file,
        root,
      });
    }
  } else {
    await ctx.send({
      root: "./public",
    });
  }
});

app.listen({ port });
