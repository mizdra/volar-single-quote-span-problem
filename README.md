## What's this?

This repository explains the peculiar behavior exhibited by the TypeScript language service loaded via @volar/typescript when object property names are enclosed in single quotes within generated `.d.ts` files.

## Environment

- macOS 26.2
- Node.js v25.3.0
- TypeScript v5.9.3
- @volar/typescript v2.4.28

## The code used for explanation

`src/index.ts`:

```ts
import styles from "./a.module.css";
styles.a_1;
```

`src/a.module.css`:

```css
.a_1 {
  color: red;
}
```

## Introduction

まずシングルクオートを使用しない場合の挙動について説明します。この時は @volar/typescript がロードされた Language Service は正常に動作します。これは [`volar.ts`](./volar.ts) スクリプトを実行することで確認できます。

```console
$ node volar.ts
=== Virtual Code for src/a.module.css ===
declare const styles: {
  a_1: string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 26 ], lengths: [ 3 ], sourceOffsets: [ 1 ] }

=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
      textSpan: { start: 1, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
        textSpan: { start: 1, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]
```

ところが、`.d.ts` ファイル内でオブジェクトのプロパティ名がシングルクオートで囲まれている場合、@volar/typescript がロードされた Language Service は正しく動作しません。実際に加える変更は以下の通りです。

- https://github.com/mizdra/typescript-volar-span-comparison/compare/main...case-2

`case-2` ブランチに切り替えて [`volar.ts`](./volar.ts) スクリプトを実行することで挙動を確認できます。

```console
$ git switch case-2
$ node volar.ts
=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 27 ], lengths: [ 3 ], sourceOffsets: [ 1 ] }

=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 0, length: 0 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
      textSpan: { start: 1, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
        textSpan: { start: 1, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]
```

これが `@volar/typescript` を使用した場合の奇妙な挙動です。

## 何が起きているのでしょうか?

この挙動には、TypeScript の Language Service 自体の動作が関係しています。シングルクオートで囲まれたプロパティ名に対して、TypeScript の Language Service は `getDefinitionAtPosition` でシングルクオートを含む範囲を返しますが、`findReferences` と `findRenameLocations` ではシングルクオートを含まない範囲を返します。`case-2` ブランチにて、以下のように [`typescript.ts`](./typescript.ts) スクリプトを実行すると確認できます。

```console
$ git switch case-2
$ node typescript.ts
=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
    textSpan: { start: 26, length: 5 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
      textSpan: { start: 27, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
        textSpan: { start: 27, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
    textSpan: { start: 27, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  }
]
```

ここで、`node volar.ts` の以下のログを思い出してください。

```console
=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 27 ], lengths: [ 3 ], sourceOffsets: [ 1 ] }
```

このログは、Volar.js が生成した仮想コードと、元の CSS ファイルとの位置マッピングを示しています。見ての通り `a_1` の mapping が存在します。シングルクオートで囲まれた部分 (`'a_1'`) の mapping は存在しません。

Volar.js は対応する mapping が見つからない時、`{ start: 0, length: 0 }` を返すようです (詳しくは[ここ](https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/typescript/lib/node/transform.ts#L160))。これが奇妙な動作の原因です。

## `a_1` の代わりに `'a_1'` の mapping を生成したら?

では、`a_1` の代わりに `'a_1'` の mapping を生成したらどうなるでしょうか? これは `case-3` ブランチで試すことができます。

- https://github.com/mizdra/typescript-volar-span-comparison/compare/main...case-3

```console
$ git switch case-3
$ node volar.ts

=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{
  generatedOffsets: [ 26 ],
  lengths: [ 3 ],
  sourceOffsets: [ 1 ],
  generatedLengths: [ 5 ]
}

=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
      textSpan: { start: 2, length: 2 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
        textSpan: { start: 2, length: 2 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 2, length: 2 }
  }
]
```

`getDefinitionAtPosition` は正しいですが、`findReferences` と `findRenameLocations` は間違っています。

## `a_1` と `'a_1'` の両方の mapping を生成したら?

では、`a_1` と `'a_1'` の両方の mapping を生成したらどうなるでしょうか? これは `case-4` ブランチで試すことができます。

- https://github.com/mizdra/typescript-volar-span-comparison/compare/main...case-4

```console
$ git switch case-4
$ node volar.ts

=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{
  generatedOffsets: [ 26, 27 ],
  lengths: [ 3, 3 ],
  sourceOffsets: [ 1, 1 ],
  generatedLengths: [ 5, 3 ]
}

=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
      textSpan: { start: 2, length: 2 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
        textSpan: { start: 2, length: 2 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 2, length: 2 }
  }
]
```

結果は `case-3` ブランチと同じです。`findReferences` と `findRenameLocations` は依然として間違っています。

## `case-4` で `findReferences` と `findRenameLocations` が正しく動作しない理由

`case-4` では正しい mapping が存在するにも関わらず、`findReferences` と `findRenameLocations` が正しく動作しません。その理由は Volar.js の mapping の探索ロジックにあります。Volar.js は以下の `findMatchingOffsets` 関数で mapping を探索しています。

- https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L51C3-L51C22

`.d.ts` 上でのオフセット (`27`) を `.module.css` 側のオフセット (`1`) に変換するのは、`translateOffset` 関数です。

- https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L77-L87

`findReferences` が `a_1` の開始位置 (内部では [`mappedStart`](https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L103) と呼ばれます) を計算するとき、`translateOffset` 関数には以下のような実引数が渡されます。

```ts
const mappedStart = translateOffset(
  27, // start
  [26, 27], // fromOffsets
  [1, 1], // toOffsets
  [5, 3], // fromLengths
  [5, 3], // toLengths
);
```

本来、この関数は `1` を返すべきですが、実際には `2` を返します。これは `translateOffset` 関数がある位置において、複数の range が重なっているケースを正しく処理できないためです。

`findReferences` が `a_1` の終了位置を計算するとき (内部では [`mappedEnd`](https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L108) と呼ばれます) は、`preferEnd == true` を伴って `translateOffset` 関数が呼び出されます。

```ts
const mappedEnd = translateOffset(
  30, // start
  [26, 27], // fromOffsets
  [1, 1], // toOffsets
  [5, 3], // fromLengths
  [5, 3], // toLengths
  true, // preferEnd
);
```

この関数は、期待通り `4` を返します。

まとめると、`mappedStart` は `2`、`mappedEnd` は `4` になります。つまり、`length` は `2` となります。その結果、`findReferences` と `findRenameLocations` は `{ start: 2, length: 2 }` を返してしまうのです。

## どうすれば良いのでしょうか?

恐らく、Volar.js の `translateOffset` 関数が、ある位置に複数の range が重なっているケースを正しく処理するよう修正する必要があります。
