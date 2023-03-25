"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
exports.__esModule = true;
exports.sideProjects = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("@remix-run/react");
exports.sideProjects = [];
exports.sideProjects.push({
  id: "youshouldwatch",
  title: "You Should Watch",
  image: {
    url: "/images/about/youshouldwatch.png",
    width: 110,
    height: 110,
  },
  url: "https://ushdwat.ch",
  body: (0, jsx_runtime_1.jsxs)("p", {
    children: [
      "You Should Watch is a mobile-friendly web app for remembering and sharing movies and TV shows you should watch. Like a to-do list to open when you finally sit down with the remote in your hand.",
      (0, jsx_runtime_1.jsx)("br", {}),
      (0, jsx_runtime_1.jsx)(
        react_1.Link,
        __assign(
          { to: "/plog/announcing-you-should-watch" },
          { children: "Blog post about it here" }
        )
      ),
      ".",
      " ",
      (0, jsx_runtime_1.jsx)(
        react_1.Link,
        __assign(
          { to: "/plog/the-technology-behind-you-should-watch" },
          { children: "Blog post about the technology used" }
        )
      ),
      ".",
    ],
  }),
});
