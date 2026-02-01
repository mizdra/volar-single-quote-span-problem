## What's this?

This example demonstrates how the TypeScript language service and the TypeScript language service loaded via @volar/typescript behave when an object property name is enclosed in single quotes within the generated `.d.ts` file.

When property names are not enclosed in single quotes, both language services return the span for Definitions, References, and RenameLocations without issue.

When property names are enclosed in single quotes, the TypeScript language service exhibits strange behavior. Definitions returns a span that includes the single quotes. However, References and RenameLocations return spans that do not include the single quotes. This is odd, but appears to be by design in TypeScript.

The TypeScript language service loaded with @volar/typescript exhibits even stranger behavior. Definitions fails to find the correct location and falls back to `{ start: 0, length: 0 }`. Meanwhile, References and RenameLocations return the correct span. It is unclear whether this is the intended behavior of @volar/typescript.

## Environment

- macOS 26.2
- Node.js v25.3.0
- TypeScript v5.9.3
- @volar/typescript v2.4.28

## How to run

```bash
npm i
node typescript.ts
node volar.ts
```

## Case 1: Do not wrap property names in single quotes

First, modify the code as follows, then run.

```diff
diff --git a/src/a.module.css.d.ts b/src/a.module.css.d.ts
index c849fe0..e218de4 100644
--- a/src/a.module.css.d.ts
+++ b/src/a.module.css.d.ts
@@ -1,4 +1,4 @@
 declare const styles: {
-  'a_1': string,
+  a_1: string,
 };
 export default styles;
diff --git a/ts-plugin/language-plugin.js b/ts-plugin/language-plugin.js
index 9133514..297aeb6 100644
--- a/ts-plugin/language-plugin.js
+++ b/ts-plugin/language-plugin.js
@@ -72,7 +72,7 @@ function createDts(cssModuleText) {
   const classNames = result.map(i => i.slice(1));
   const dtsText = `
 declare const styles: {
-${classNames.map(className => `  '${className}': string,`).join('\n')}
+${classNames.map(className => `  ${className}: string,`).join('\n')}
 };
 export default styles;
   `.trim();
```


<details>
<summary><code>node typescript.ts</code></summary>

```bash
$ node typescript.ts

=== Definitions for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
    textSpan: { start: 26, length: 3 }
  }
]

=== References for a_1 ===
[
  {
    definition: {
      fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
      textSpan: { start: 26, length: 3 }
    },
    references: [
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
        textSpan: { start: 26, length: 3 }
      },
      {
        fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
        textSpan: { start: 44, length: 3 }
      }
    ]
  }
]
=== RenameLocations for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
    textSpan: { start: 26, length: 3 }
  },
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/index.ts',
    textSpan: { start: 44, length: 3 }
  }
]
```

</details>


<details>
<summary><code>node volar.ts</code></summary>

```bash
$ node volar.ts

=== Virtual Code for src/a.module.css ===
declare const styles: {
  a_1: string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 26 ], sourceOffsets: [ 1 ], lengths: [ 3 ] }

=== Definitions for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 1, length: 3 }
  }
]

=== References for a_1 ===
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
=== RenameLocations for a_1 ===
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

</details>

## Case 2: Wrap property names in single quotes

First, modify the code as follows, then run.

```bash
git reset --hard HEAD
```

<details>
<summary><code>node typescript.ts</code></summary>

```bash
$ node typescript.ts

=== Definitions for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css.d.ts',
    textSpan: { start: 26, length: 5 }
  }
]

=== References for a_1 ===
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
=== RenameLocations for a_1 ===
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

</details>


<details>
<summary><code>node volar.ts</code></summary>

```bash
$ node volar.ts

=== Virtual Code for src/a.module.css ===
declare const styles: {
  'a_1': string,
};
export default styles;

=== Mapping for src/a.module.css ===
{ generatedOffsets: [ 27 ], sourceOffsets: [ 1 ], lengths: [ 3 ] }

=== Definitions for a_1 ===
[
  {
    fileName: '/Users/mizdra/ghq/localhost/gomi/ts-compiler-api/src/a.module.css',
    textSpan: { start: 0, length: 0 }
  }
]

=== References for a_1 ===
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
=== RenameLocations for a_1 ===
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

</details>
