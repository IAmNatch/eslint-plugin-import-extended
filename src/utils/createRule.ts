import {ESLintUtils} from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
    (ruleName) =>
        `https://github.com/IAmNatch/eslint-plugin-import-extended${ruleName}`
);
