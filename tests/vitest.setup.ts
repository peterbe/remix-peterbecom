import { main } from "../server";

let teardownHappened = false;
type PromiseType<T extends Promise<any>> =
  T extends Promise<infer U> ? U : never;
type Server = PromiseType<ReturnType<typeof main>>;

let server: Server;

export async function setup() {
  server = await main();
}

export async function teardown() {
  if (teardownHappened) throw new Error("teardown called twice");
  teardownHappened = true;
  if (server) {
    server.close();
  }
}
