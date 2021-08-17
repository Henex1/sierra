// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require("next-transpile-modules")([
  "d3-array",
  "d3-color",
  "d3-format",
  "d3-interpolate",
  "d3-scale",
  "d3-time",
  "d3-time-format",
  "internmap",
]);

// This causes the bundler to skip test files.
// https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
module.exports = withTM({
  webpack5: false,
  webpack: (config, { webpack }) => {
    // Note: we provide webpack above so you should not `require` it

    // Ignore colocated tests and mocks
    config.plugins.push(new webpack.IgnorePlugin(/\.test.[tj]sx?$/));
    config.plugins.push(new webpack.IgnorePlugin(/\/__mocks__\//));

    if (process.env.NODE_ENV === "production") {
      // Ignore pages in /dev/ folders
      config.plugins.push(new webpack.IgnorePlugin(/\/dev\//));
    }

    // Important: return the modified config
    return config;
  },
});
