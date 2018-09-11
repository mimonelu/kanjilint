# kanjilint

## 概要

* 入力から常用漢字以外の漢字を出力するCLIです。
* [文化庁の開示している常用漢字表（平成22年内閣告示第2号）](http://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/index.html)はPDFであるため解析が難しく、代わりに[Wikipediaの常用漢字表](https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7)を解析、利用しています。つまりWikipediaの内容に問題がある場合、当プログラムの挙動にも問題が発生します。
* 2018年現在、すべての教育漢字が常用漢字であるかどうかがわからないため、[学年別漢字配当表](https://ja.wikipedia.org/wiki/%E5%AD%A6%E5%B9%B4%E5%88%A5%E6%BC%A2%E5%AD%97%E9%85%8D%E5%BD%93%E8%A1%A8)は考慮していません。
* ここでの漢字とは、Unicodeにおける4E00から9FA5（ `一-龥` ）を指します。他の文字は処理の対象になりません。

## インストール

グローバルで使いたい場合は、

```
$ npm i -g kanjilint
$ kanjilint -v
```

ローカルで使いたい場合は、

```
$ npm i --save-dev kanjilint
$ npx kanjilint -v
```

## 使い方

* `$ kanjilint -v` バージョンを表示します。
* `$ kanjilint sample.txt` `sample.txt` を処理します（標準出力に結果を表示します）。
* `$ kanjilint "sample/**/*.txt"` `sample` フォルダ以下のすべての.txtファイルを処理します。  
パスの指定については[glob](https://www.npmjs.com/package/glob)を参照してください。  
また、globの記法に準拠する場合、パスをクォーテーションで囲む必要があるかもしれません。
* `$ kanjilint "sample/**/*.txt" -e node_modules -o result.txt -f text -q 32` オプション（後述）を付けて処理します。

### オプション

* `-v, --version` バージョンを表示します。
* `-e, --exclude <s>` この文字列を含むファイルパスは処理されません。
* `-o, --output <s>` 出力ファイルのパスを指定します（デフォルトで標準出力）。
* `-f, --format <s>` 出力フォーマットを `json` と `text` から指定します（デフォルトで `text` ）。
* `-q, --quotation <n>` 出力に記載する引用文の長さを指定します（デフォルトで `32` ）。 `0` で記載しません。
* `-h, --help`

## 内訳

* `lib/make.js` Wikipediaの「常用漢字一覧」ページをスクレイピングし、 `list.json` ファイルを生成します。  
常用漢字が更新されない限り、起動する必要はありません。
* `lib/api.js` API関数群を提供します（現状ひとつのみ）。
* `bin/cli.js` CLI本体です。

## お問い合わせ

* [@mimonelu](https://twitter.com/mimonelu)
