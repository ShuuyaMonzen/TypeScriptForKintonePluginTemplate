const fs = require('fs-extra');
const path = require('path');
const glob = require("glob");
const webpack = require('webpack');
// 難読化モジュール
const WebpackObfuscator = require('webpack-obfuscator');
// ts型・構文チェックモジュール
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// kintoneプラグイン作成用のwebpackプラグイン
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

//#region ローダールールのオブジェクトを作成する
/**
 * babelローダールール
 */
 var babelLoaderRule = { 
  test: /\.ts$/,
  exclude: /node_modules/,
  use: [{
    loader: 'babel-loader',
    
    options: {
      presets: [
        [
          "@babel/preset-env",
          {
            "useBuiltIns": "usage",
            "corejs": 3,
          },
        ],
        "@babel/typescript",
      ],
      plugins: [
        ["@babel/plugin-proposal-decorators", {
          legacy: true
        }],
        ["@babel/proposal-class-properties"],

        // NODE_ENV, APP_ENVの変数を'development'などのビルドオプション文字列に置換
        ["transform-inline-environment-variables", {
          "include": [
            "NODE_ENV",
            "APP_ENV"
          ]
        }]
      ]
    }
  }]
};

/**
 * 難読化モジュールローダールール
 */
var WebpackObfuscatorLoaderRule = {
  test: /\.ts$/,
  exclude: /node_modules/,
  enforce: 'post',
  use: [{
      loader: WebpackObfuscator.loader,
      options: {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending:true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['rc4'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 5,
        stringArrayWrappersChainedCalls: true,    
        stringArrayWrappersParametersMaxCount: 5,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
      }
  }]
};
//#endregion

//#region プラグインのオブジェクトを作成する
/**
 * ts型・構文チェックプラグイン
 */
var forkTsCheckerWebpackPlugin = new ForkTsCheckerWebpackPlugin({
  typescript: {
    configFile: path.resolve(__dirname, "./tsconfig.json")
  },
  async: false,
});

/**
 * kintoneプラグイン作成用のwebpackプラグイン
 */
var kintonePluginPackerWebPackPlugin = new KintonePlugin({
  manifestJSONPath: path.join(__dirname, 'temp', 'manifest.json'),
  privateKeyPath: path.join(__dirname, 'key', ppkFiles[0]),
  pluginZipPath: path.join(__dirname, 'dist', 'plugin.zip'),
});
//#endregion

console.log("使用したppkファイル : " + ppkFiles[0]);
module.exports = {
  mode: process.env.NODE_ENV,
  entry: entries,
  output: {
    filename: '[name]',
    path: path.join(__dirname, 'temp', 'js', 'entries'),
    clean: true,
  },
  devtool: (process.env.NODE_ENV == 'development') ? 'inline-source-map' : undefined,
  target: 'node',
  // 開発用ビルドでは難読化なし
  // 検証・本番用ビルドでは難読化あり
  module: {
    rules: (process.env.NODE_ENV == 'development') ? 
    [babelLoaderRule] :
    [WebpackObfuscatorLoaderRule, babelLoaderRule],
  },
  resolve: {
    // 拡張子を配列で指定
    extensions: ['.ts', '.js',],
  },
  plugins: [forkTsCheckerWebpackPlugin, kintonePluginPackerWebPackPlugin]
};