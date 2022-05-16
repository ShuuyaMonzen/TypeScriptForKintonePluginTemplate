const fs = require('fs-extra');
const path = require('path');
const glob = require("glob");
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const KintonePlugin = require('@kintone/webpack-plugin-kintone-plugin');

// ts→jsコンパイル後のものをbundle
const entries = {};
const srcDir = path.join(__dirname, 'src', 'ts', 'entries');
glob.sync('**/*.ts', {
  ignore: '**/_*.ts',
  cwd: srcDir
}).map((value) => {
  var fileName = path.basename(value, '.ts')
  entries[fileName + '.js'] = path.resolve(srcDir, value);
});

fs.copySync(path.join(__dirname, 'src'), path.join(__dirname, 'temp'));
fs.copyFileSync(path.join(__dirname, 'manifest.json'), path.join(__dirname, 'temp', 'manifest.json'));

module.exports = {
  mode: 'production',
  entry: entries,
  output: {
    filename: '[name]',
    path: path.join(__dirname, 'temp', 'js', 'entries')
  },
  devtool: 'inline-source-map',
  target: 'node',
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }],
  },
  resolve: {
    // 拡張子を配列で指定
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new KintonePlugin({
      manifestJSONPath: path.join(__dirname, 'temp', 'manifest.json'),
      privateKeyPath: path.join(__dirname, 'key', 'jamnlebecigohjeafjiifdaiflakblde.ppk'),
      pluginZipPath: path.join(__dirname, 'dist', 'plugin.zip'),
    })
  ]
}