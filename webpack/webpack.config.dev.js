const path = require('path');
const webpack = require('webpack');
var isLocalBuild = process.env.NODE_ENV === 'local';
const merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var _ = require('lodash');
const { WebpackPluginServe: Serve } = require('webpack-plugin-serve');

let htmlPluginOptions = {
  alwaysWriteToDisk: true,
  filename: 'index.html',
  template: './src/demo/ClientApp/index.template.ejs',
};

const clientOutputDir = path.join(__dirname, '..', 'src', 'demo', 'wwwroot');

module.exports = merge({
  customizeArray(a, b, key) {
    if (key === 'plugins') {
      a = _.remove(a, function(plugin) {
        return !(plugin.filename && plugin.filename === '[name].css');
      });
      return a.concat(b);
    }

    // Fall back to default merging
    return undefined;
  },
  customizeObject(a, b, key) {
    if (key === 'entry') {
      return b;
    }

    // Fall back to default merging
    return undefined;
  },
})(require('./webpack.config.base'), {
  resolve: {
    alias: {
      // 'react-dom': '@hot-loader/react-dom'
    },
  },
  entry: ['./src/demo/ClientApp/Main.tsx', 'webpack-plugin-serve/client'],
  output: {
    path: clientOutputDir,
    publicPath: '/',
    filename: 'dist/[name].[hash].js',
  },
  externals: {},
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(htmlPluginOptions),
    new CopyWebpackPlugin([
      {
        from: './src/demo/ClientApp/assets/favicon/icons',
        to: 'dist/icons',
      },
    ]),
    new Serve({
      port: 8082,
      static: clientOutputDir,
      open: true,
      host: 'localhost',
      progress: false,
      hmr: true,
      historyFallback: true,
    }),
  ],
  watch: true,
});
