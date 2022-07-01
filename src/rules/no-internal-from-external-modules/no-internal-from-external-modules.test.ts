import rule from "./no-internal-from-external-modules";
import {testFilePath} from "../../utils/test-file-path";
import {ESLintUtils} from "@typescript-eslint/utils";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const allExtensions = [".ts", ".tsx", ".js", ".jsx"];
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    settings: {
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
});

ruleTester.run("no-internal-from-external-modules", rule, {
    valid: [
        {
            name: "Allow sibling import within internal module",
            code: 'import x from "./package-one-secret-sauce"',
            options: [{moduleRoot: "**/packages/*"}],
            filename: testFilePath(
                "no-internal-modules/src/packages/package-one/index.ts"
            ),
        },
        {
            name: "Allow sibling import within internal module's nested folder",
            code: 'import x from "../package-one-secret-sauce"',
            options: [{moduleRoot: "**/packages/*"}],
            filename: testFilePath(
                "no-internal-modules/src/packages/package-one/nested-folder/some-file.ts"
            ),
        },
        {
            name: "Allow importing index from external module",
            code: 'import x from "./packages/package-one"',
            options: [{moduleRoot: "**/packages/*"}],
            filename: testFilePath("no-internal-modules/src/index.ts"),
        },
        {
            name: "Allow importing index directly from external module",
            code: 'import x from "./packages/package-one/index"',
            options: [{moduleRoot: "**/packages/*"}],
            filename: testFilePath("no-internal-modules/src/index.ts"),
        },
        {
            name: "Ignore modules that are not specified as a root module",
            code: 'import x from "./common/some-common-file"',
            options: [{moduleRoot: "**/packages/*"}],
            filename: testFilePath("no-internal-modules/src/index.ts"),
        },
    ],
    invalid: [
        {
            name: "Disallow importing internal modules from sibling modules",
            code: 'import {x} from "../package-two/package-two-secret-sauce"',
            filename: testFilePath(
                "no-internal-modules/src/packages/package-one/index.ts"
            ),
            options: [{moduleRoot: "**/packages/*"}],
            errors: [
                {
                    messageId: "shouldUseExternal",
                },
            ],
        },
        {
            name: "Disallow importing interal module from unrelated file",
            code: 'import {x} from "../packages/package-two/package-two-secret-sauce"',
            filename: testFilePath("no-internal-modules/src/common/index.ts"),
            errors: [
                {
                    messageId: "shouldUseExternal",
                },
            ],
            options: [{moduleRoot: "**/packages/*"}],
        },
        {
            name: "Disallow importing index that is not a modules root index",
            code: 'import {x} from "../packages/package-one/nested-folder/index.ts"',
            filename: testFilePath("no-internal-modules/src/common/index.ts"),
            errors: [
                {
                    messageId: "shouldUseExternal",
                },
            ],
            options: [{moduleRoot: "**/packages/*"}],
        },
        {
            name: "Disallow importing files from an external package, if specified in options",
            code: 'import x from "@someCompany/external-package/internal-file"',
            options: [{moduleRoot: "@someCompany/external-package"}],
            filename: testFilePath("no-internal-modules/src/common/index.ts"),
            errors: [
                {
                    messageId: "shouldUseExternal",
                },
            ],
        },
    ],
});
