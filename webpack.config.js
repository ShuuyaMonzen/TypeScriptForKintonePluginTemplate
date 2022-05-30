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
/**
 * ppkファイル名取得(1件のみ取得の前提)
 */
var ppkFiles = fs.readdirSync('./key/');
console.log("使用したppkファイル : " + ppkFiles[0]);

module.exports = {
  mode: process.env.NODE_ENV,
  entry: entries,
  output: {
    filename: '[name]',
    path: path.join(__dirname, 'temp', 'js', 'entries')
  },
  devtool: (process.env.NODE_ENV == 'development') ? 'inline-source-map' : undefined,
  target: 'node',
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }],
  },
  resolve: {
    // 拡張子を配列で指定
    extensions: ['.ts', '.js',],
  },
  plugins: [
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, "./tsconfig.json")
      },
      async: false,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new KintonePlugin({
      manifestJSONPath: path.join(__dirname, 'temp', 'manifest.json'),
      privateKeyPath: path.join(__dirname, 'key', ppkFiles[0]),
      pluginZipPath: path.join(__dirname, 'dist', 'plugin.zip'),
    }),
  ],
  optimization: 
  //developmentの場合は圧縮,コメント削除しない
  //productの場合は圧縮,コメント削除をする
  (process.env.NODE_ENV == 'development') ? 
  undefined :
  {
    minimize: true,
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            //圧縮
            compress: true,
            output: {
              //コメント削除
              comments: false,
              //難読化
              beautify: false
            }
          }
        }).apply(compiler);
      },
    ]
  },
};