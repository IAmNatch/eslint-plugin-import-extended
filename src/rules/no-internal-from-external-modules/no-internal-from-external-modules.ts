import {TSESLint, TSESTree} from "@typescript-eslint/utils";
import {Literal} from "@typescript-eslint/types/dist/generated/ast-spec";
import importType from "../../utils/import-type";
import resolve from "eslint-module-utils/resolve";
import visitModules from "eslint-module-utils/moduleVisitor";
import minimatch from "minimatch";
import path from "path";
import {createRule} from "../../utils/createRule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    name: "no-internal-from-external-modules",
    defaultOptions: [],
    meta: {
        type: "problem",
        messages: {
            shouldUseExternal:
                "Reaching into internal modules is not allowed. If this import should be available, export it from the module's public interface.",
        },
        docs: {
            description:
                "forbid reaching into a module's internals from external modules while allowing internal imports within the module itself",
            recommended: false,
        },
        fixable: undefined,
        schema: [
            {
                type: "object",
                properties: {
                    moduleRoot: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(
        context: Readonly<
            TSESLint.RuleContext<"shouldUseExternal", {moduleRoot: string[]}[]>
        >
    ) {
        //----------------------------------------------------------------------
        // Options
        //----------------------------------------------------------------------
        const moduleRoot = context.options[0].moduleRoot || [];
        const genericModuleRootRegex = moduleRoot.map((root) =>
            minimatch.makeRe(root)
        );
        const genericModuleRootChildrenRegex = moduleRoot.map((root) =>
            minimatch.makeRe(path.join(root, "/**"))
        );

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------
        function reachingForbidden(importPath: string) {
            const importPathSplit = importPath.split("/");
            const importPathLast = importPathSplit[importPathSplit.length - 1];
            const importPathBaseArray = importPathSplit.slice(
                0,
                importPathSplit.length - 1
            );

            const importFilePathSplit = context.getFilename().split("/");

            // We must figure out which specific module we're in
            let moduleChildrenRegex;
            for (let i = 2; i <= importFilePathSplit.length - 1; i++) {
                const testPath = importFilePathSplit.slice(0, i).join("/");

                if (genericModuleRootRegex.some((re) => re.test(testPath))) {
                    moduleChildrenRegex = minimatch.makeRe(
                        path.join(testPath, "/**")
                    );
                    break;
                }
            }

            // If the importing file and the import are in the same module, it should pass
            if (moduleChildrenRegex && moduleChildrenRegex.test(importPath)) {
                return false;
            }

            // If the import is the child of any module, we must dig deeper
            if (
                genericModuleRootChildrenRegex.some((re) => re.test(importPath))
            ) {
                // If the import is for a modules top level folder, or top level index, it should pass.
                if (
                    genericModuleRootRegex.some((re) =>
                        re.test(importPathBaseArray.join("/"))
                    ) &&
                    importPathLast.split(".")[0] === "index"
                ) {
                    return false;
                }
                return true;
            }

            return false;
        }

        function isNoInternalViolation(importPath: string) {
            // First test the unresolved import
            if (
                reachingForbidden(importPath) ||
                reachingForbidden(`/${importPath}`)
            )
                return true;

            // if the import statement doesn't match directly, try to match the
            // resolved path if the import is resolvable
            const resolved = resolve(importPath, context);
            if (resolved && reachingForbidden(resolved)) return true;

            // this import was not forbidden by the forbidden paths so it is not a violation
            return false;
        }

        function checkImportForReaching(
            importPath: string,
            node: TSESTree.Node
        ) {
            const potentialViolationTypes = [
                "parent",
                "index",
                "sibling",
                "external",
                "internal",
            ];
            const typeOfImport = importType(
                importPath,
                context as Readonly<TSESLint.RuleContext<never, never[]>>
            );

            if (
                potentialViolationTypes.indexOf(typeOfImport) !== -1 &&
                isNoInternalViolation(importPath)
            ) {
                context.report({
                    node,
                    messageId: "shouldUseExternal",
                });
            }
        }
        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return visitModules(
            (source: Literal) => {
                checkImportForReaching(source.value as string, source);
            },
            {commonJs: true, ignore: []}
        );
    },
});
