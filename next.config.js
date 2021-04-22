// This causes the bundler to skip test files.
// https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
module.exports = {
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
};
