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

//#region バンドル対象を取得する
// ts→jsコンパイル後のものをbundle
const entries = {};
const srcDir = path.resolve(__dirname, 'src', 'ts', 'entries');
glob.sync('**/*.ts', {
  ignore: '**/_*.ts',
  cwd: srcDir
}).map((value) => {
  var fileName = path.basename(value, '.ts')
  entries[fileName + '.js'] = path.resolve(srcDir, value);
});

fs.copySync(path.resolve(__dirname, 'src'), path.resolve(__dirname, 'temp'));
fs.copyFileSync(path.resolve(__dirname, 'manifest.json'), path.resolve(__dirname, 'temp', 'manifest.json'));
//#endregion

//#region ppkファイル取得
/**
 * ppkファイル名取得(1件のみ取得の前提)
 */
 var ppkFiles = fs.readdirSync(path.resolve(__dirname, 'key', process.env.APP_ENV));
//#endregion

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

//#region webpackプラグインのオブジェクトを作成する
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
  manifestJSONPath: path.resolve(__dirname, 'temp', 'manifest.json'),
  privateKeyPath: path.resolve(__dirname, 'key', process.env.APP_ENV, ppkFiles[0]),
  pluginZipPath: path.resolve(__dirname, 'dist', 'plugin.zip'),
});
//#endregion

console.log("使用したppkファイル : " + ppkFiles[0]);
module.exports = {
  mode: process.env.NODE_ENV,
  entry: entries,
  output: {
    filename: '[name]',
    // tempフォルダにts→jsにトランスパイル結果を出力
    path: path.resolve(__dirname, 'temp', 'js', 'entries'),
    clean: true,
  },
  devtool: (process.env.NODE_ENV == 'development') ? 'inline-source-map' : undefined,
  // node,web共通のモジュールの場合はexports.browserのエントリポイントを使用
  target: 'web',
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
    // ビルド時のパスを解決
    // @ → src/tsに置換 
    alias: { '@': path.resolve(__dirname, 'src/ts'), },
  },
  plugins: [forkTsCheckerWebpackPlugin, kintonePluginPackerWebPackPlugin]
};