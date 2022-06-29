declare module "eslint-module-utils/resolve" {
    const resolve: (
        name: string,
        context: Readonly<TSESLint.RuleContext<never, never[]>>
    ) => string;
    export default resolve;
}
declare module "eslint-module-utils/moduleVisitor" {
    const visitModules: (
        visitor: VisitorType,
        options: {commonJs?: boolean; esmodule?: boolean; ignore?: string[]}
    ) => import("@typescript-eslint/utils/dist/ts-eslint").RuleListener;
    export default visitModules;
}
declare module "eslint-module-utils/pkgUp" {
    const pkgUp: (opts: {cwd: string}) => string;
    export default pkgUp;
}
declare module "eslint-module-utils/readPkgUp" {
    const readPkgUp: (opts: {
        cwd?: string;
        normalize?: boolean;
    }) => {
        pkg: {name: string};
        path: string;
    };
    export default readPkgUp;
}
