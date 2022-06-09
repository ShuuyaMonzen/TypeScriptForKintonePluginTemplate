# typescript-kintone-plugin-template
KintoneのプラグインをTypeScriptで開発用のテンプレート


# 構築手順
1. 本テンプレートをダウンロード
2. git bashを起動
3. $ cd (本テンプレートのフォルダ)
4. $ npm install 

# ビルドについて
1. $ npm run buildDev
　→ 開発用ビルドです、ソースマップが含まれているのでデバッグが容易です。
  使用するppkファイル: key/development/xxxxx.ppk

2. $ npm run buildStg
  → 検証環境用ビルドです。
  使用するppkファイル: key/staging/xxxxx.ppk

3. $ npm run buildPro
  → 本番環境用ビルドです。
  使用するppkファイル: key/production/xxxxx.ppk
