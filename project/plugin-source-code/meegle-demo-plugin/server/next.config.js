module.exports = {
  basePath: '/b/plugin_demo',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 修改 webpack配置以支持 CommonJS
      config.output.libraryTarget = 'commonjs2';
    }
    return config;
  },
};
