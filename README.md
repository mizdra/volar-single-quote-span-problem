## What's this?

This repository explains the peculiar behavior exhibited by the TypeScript language service loaded via @volar/typescript when object property names are enclosed in single quotes within generated `.d.ts` files.

It also introduces problems caused by this peculiar behavior and methods to avoid them.

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

First, let's explain the behavior when single quotes are not used. In this case, the Language Service loaded by @volar/typescript works correctly. You can confirm this by running the [`volar.ts`](./volar.ts) script.

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
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
      textSpan: { start: 1, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
        textSpan: { start: 1, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]
```

However, when object property names in the `.d.ts` file are enclosed in single quotes, the Language Service loaded by @volar/typescript does not work correctly. The actual change is as follows.

- https://github.com/mizdra/typescript-volar-span-comparison/compare/main...case-2

You can observe the behavior by switching to the `case-2` branch and running the [`volar.ts`](./volar.ts) script.

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
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 0, length: 0 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
      textSpan: { start: 1, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
        textSpan: { start: 1, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]
```

This is the strange behavior observed when using `@volar/typescript`.

## What is happening?

This behavior is related to the TypeScript Language Service itself. For a property name enclosed in single quotes, TypeScript's Language Service returns a span that includes the single quotes for `getDefinitionAtPosition`, but returns a span that excludes the single quotes for `findReferences` and `findRenameLocations`. You can confirm this on the `case-2` branch by running the [`typescript.ts`](./typescript.ts) script as follows.

```console
$ git switch case-2
$ node typescript.ts
=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css.d.ts',
    textSpan: { start: 26, length: 5 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css.d.ts',
      textSpan: { start: 27, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css.d.ts',
        textSpan: { start: 27, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css.d.ts',
    textSpan: { start: 27, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  }
]
```

Here, recall the following log from `node volar.ts`.

```console
=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 27 ], lengths: [ 3 ], sourceOffsets: [ 1 ] }
```

This log shows the virtual code generated by Volar.js and the position mapping to the original CSS file. As you can see, there is a mapping for `a_1`. There is no mapping for the single-quoted part (`'a_1'`).

When Volar.js cannot find a corresponding mapping, it seems to return `{ start: 0, length: 0 }` (see [here](https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/typescript/lib/node/transform.ts#L160)). This is the cause of the strange behavior.

## What if we generate a mapping for `'a_1'` instead of `a_1`?

What happens if we generate a mapping for `'a_1'` instead of `a_1`? You can try this on the `case-3` branch.

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
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
      textSpan: { start: 2, length: 2 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
        textSpan: { start: 2, length: 2 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 2, length: 2 }
  }
]
```

`getDefinitionAtPosition` is correct, but `findReferences` and `findRenameLocations` are incorrect.

## Why `findReferences` and `findRenameLocations` do not work correctly in `case-3`

The reason is Volar.js's mapping lookup logic. Volar.js searches mappings using the following `findMatchingOffsets` function.

- https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L51C3-L51C22

The `translateOffset` function converts the offset on `.d.ts` (`27`) to the offset on `.module.css` (`1`).

- https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L77-L87

When `findReferences` calculates the start position of `a_1` (internally called [`mappedStart`](https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/source-map/lib/sourceMap.ts#L103)), `translateOffset` is invoked with the following arguments.

```ts
const mappedStart = translateOffset(
  27, // start
  [26], // fromOffsets
  [1], // toOffsets
  [5], // fromLengths
  [3], // toLengths
);
```

This function returns `2`. Because `start` is 1 greater than `fromOffsets`, it also returns `2`, which is 1 greater than `toOffsets`. This is by design in `translateOffset`.

To solve this, you need to generate a mapping for `'a_1'` as well for `findReferences` and `findRenameLocations`. In other words, you need mappings for both `a_1` and `'a_1'`.

## Now let's generate mappings for both `a_1` and `'a_1'`

You can try this on the `case-4` branch.

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
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
      textSpan: { start: 2, length: 2 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
        textSpan: { start: 2, length: 2 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 2, length: 2 }
  }
]
```

The result is the same as the `case-3` branch. `findReferences` and `findRenameLocations` are still incorrect. This is because Volar.js does not support overlapping mapping ranges.

- https://github.com/volarjs/volar.js/issues/203

## So, what should we do?

As far as I know, there are two ways to solve this problem.

1. Ask Volar.js to support overlapping mapping ranges.
    - Volar.js seems cautious about supporting overlapping mapping ranges.
        - https://github.com/volarjs/volar.js/issues/203#issuecomment-2176919103
    - Therefore, this solution may not be practical.
2. Use zero-length mappings.
    - This is the solution introduced below.
    - https://github.com/volarjs/volar.js/issues/203#issuecomment-2173885028
3. Use `Language.mapperFactory`.
    - Using Volar.js's `Language.mapperFactory`, you can customize the mapping lookup logic.
        - https://github.com/volarjs/volar.js/pull/207
    - This is the approach used by ws-typescript-angular-plugin.
        - https://github.com/JetBrains/intellij-plugins/commit/e9e7865c51e9d8b2feb342b54cb54d3a459bfa9b#diff-2de2da0170b8536fcf411a2ea7edcaa1c88e61d9a6a7d14bd2b1ce09ea181e65
4. Generate separate mapping objects for `a_1` and `'a_1'`, and give higher priority to the `a_1` mapping object.
    - Volar.js supports multiple mapping objects.
        - https://github.com/volarjs/volar.js/blob/882cd56d46a13d272f34e451f495d3d62251969a/packages/language-core/lib/types.ts#L74
    - `translateOffset` first searches in the `a_1` mapping object. If it cannot find a valid range for the `start` argument, it falls back to the `'a_1'` mapping object.

In this situation, I think the 4th solution is the easiest to implement. So I tried the 4th solution. You can check it on the `case-5` branch.

- https://github.com/mizdra/typescript-volar-span-comparison/compare/main...case-5

```console
$ git switch case-5
$ node volar.ts
=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
[
  { generatedOffsets: [ 27 ], lengths: [ 3 ], sourceOffsets: [ 1 ] },
  {
    generatedOffsets: [ 26 ],
    lengths: [ 3 ],
    sourceOffsets: [ 1 ],
    generatedLengths: [ 5 ]
  }
]

=== getDefinitionAtPosition for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== findReferences for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
      textSpan: { start: 1, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
        textSpan: { start: 1, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]

=== findRenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/index.ts',
    textSpan: { start: 44, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/volar-single-quote-span-problem/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]
```

Yep, perfect.

## Acknowledgments

The scripts such as `typescript.ts`, `volar.ts`, and `util.ts` were generated using Claude Code. All investigation and analysis of the issues were conducted by myself.
