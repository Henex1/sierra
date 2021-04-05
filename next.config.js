// This causes the bundler to skip test files.
// https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
module.exports = {
  webpack: (config, { webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    config.plugins.push(new webpack.IgnorePlugin(/\.test.[tj]sx?$/));

    // Important: return the modified config
    return config;
  },
};
