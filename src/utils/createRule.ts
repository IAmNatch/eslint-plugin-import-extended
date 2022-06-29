import {ESLintUtils} from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
    () => `https://github.com/{repoHere}/blob/main/README.md`
);
