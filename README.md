# eslint-plugin-import-extended

## Rules

### no-internal-from-external-modules

This rule prevents external modules and files from accessing a module's internals, while allowing the module itself to reference its own internals.
Modules can still accessed via their index files, establishing a pattern of public vs private interfaces.

#### Options

| Option     | type                                    | description                                               | Ex                                            |
| ---------- | --------------------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| moduleRoot | array of strings (path or glob pattern) | Sets the top level folder where a module may be accessed. | `[**/packages/*]` or `[src/modules/myModule]` |

#### Examples

Given the following folder structure:

```
my-project
├── packages
│   └── package-one
│       └── index.ts
│       └── internal-file-one.ts
│   └── package-two
│       └── index.ts
│       └── internal-file-two.ts
└── entry.js
```

And the .eslintrc file:

```
{
  ...
  "rules": {
    "import-extended/no-internal-from-external-modules": [ "error", {
      "moduleRoot": ["**/packages/*"],
    } ]
  }
}
```

The following patterns are considered problems:

```js
// in my-project/entry.ts
import {settings} from "my-project/packages/package-one/internal-file-one";
import reducer from "my-project/packages/package-two/internal-file-two";
export * from "/packages/package-two/internal-file-two";
// in my-project/packages/package-two/index.ts
import {settings} from "my-project/packages/package-one/internal-file-one";
```

The following patterns are NOT considered problems:

```js
// in my-project/packages/package-two/index.ts
import reducer from "my-project/packages/package-two/internal-file-two";
// in my-project/packages/package-one/index.ts
import { settings } from "my-project/packages/package-two;
import { settings } from "my-project/packages/package-two/index.ts;
// in my-project/entry.ts
import * from "my-project/packages/package-one;
```

## Contributing

This projects uses [Yarn Modern](https://yarnpkg.com/) and [Corepack](https://github.com/nodejs/corepack). To install the project for development, you must first make sure corepack is enabled, run:

```sh
corepack enable
```

You can then run `yarn && yarn bootstrap`. The `bootstrap` command will configure git hooks.
