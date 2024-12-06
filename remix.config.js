/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],

  // I think this is needed because of the way server.ts compiles
  // to cjs and not esm.
  serverModuleFormat: "cjs",

  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true,
    v3_throwAbortReason: true,
  },

  // https://github.com/remix-run/remix/issues/2958#issuecomment-1744836495
  dev: {
    port: 8002,
  },
};
