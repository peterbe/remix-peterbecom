/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",

  future: {
    v2_routeConvention: true,

    // https://remix.run/docs/en/1.14.3/route/meta#metav2
    v2_meta: true,

    // https://remix.run/docs/en/1.15.0/pages/v2#catchboundary-and-errorboundary
    v2_errorBoundary: true,
  },
};
