/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",

  // I think this is needed because of the way server.ts compiles
  // to cjs and not esm.
  serverModuleFormat: "cjs",

  future: {
    v2_routeConvention: true,

    // https://remix.run/docs/en/1.14.3/route/meta#metav2
    v2_meta: true,

    // https://remix.run/docs/en/1.15.0/pages/v2#catchboundary-and-errorboundary
    v2_errorBoundary: true,

    // https://remix.run/docs/en/1.15.0/pages/v2#formmethod
    v2_normalizeFormMethod: true,
  },
};
