const webpack = require('webpack');

module.exports = {
  webpack(config, env) {
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.devtool = 'eval-source-map';
    config.mode = 'production';
    config.plugins.push(
      new webpack.BannerPlugin({
        raw: true,
        test: /.js$/,
        banner: '/* empty */\n',
      }),
    );
    return config;
  },

  devServer(configFunction) {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      config.open = false;
      // config.disableHostCheck = true;
      // config.compress = true;
      config.overlay = false;
      // config.hot = true;
      config.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      };
      return config;
    };
  },
};