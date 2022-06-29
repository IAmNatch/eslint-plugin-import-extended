const allExtensions = [".ts", ".tsx", ".js", ".jsx"];

module.exports = {
    env: {
        es2017: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        // sourceType: "module",
    },
    settings: {
        // "import/extensions": [".ts", ".js"],
        // "import/resolver": [".ts", ".js"],
        "import/extensions": allExtensions,
        "import/external-module-folders": [
            "node_modules",
            "node_modules/@types",
        ],
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            node: {
                extensions: allExtensions,
            },
        },
    },
    rules: {
        "import/default": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
        "import/namespace": "off", // this is very slow
        "no-eval": "error",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: "default",
                format: null,
            },
            {
                selector: "variable",
                format: ["PascalCase", "UPPER_CASE"],
                types: ["boolean"],
                prefix: ["is", "should", "has", "can", "did", "will"],
            },
            {
                selector: "variableLike",
                format: ["camelCase", "UPPER_CASE", "PascalCase"],
            },

            {
                selector: "parameter",
                format: ["camelCase"],
            },
            {
                selector: "memberLike",
                modifiers: ["private"],
                format: ["camelCase"],
                leadingUnderscore: "forbid",
            },
            {
                selector: "typeLike",
                format: ["PascalCase"],
            },
            {
                selector: "property",
                modifiers: ["readonly"],
                format: ["PascalCase"],
            },
            {
                selector: "enumMember",
                format: ["UPPER_CASE"],
            },
        ],
    },
    plugins: ["@typescript-eslint", "import", "prefer-arrow"],
};
