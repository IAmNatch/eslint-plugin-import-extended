import {dirname} from "path";
import pkgUp from "eslint-module-utils/pkgUp";
import readPkgUp from "eslint-module-utils/readPkgUp";
import {TSESLint} from "@typescript-eslint/utils";

export function getContextPackagePath(
    context: Readonly<TSESLint.RuleContext<never, never[]>>
) {
    return getFilePackagePath(
        context.getPhysicalFilename
            ? context.getPhysicalFilename()
            : context.getFilename()
    );
}

export function getFilePackagePath(filePath: string) {
    const fp = pkgUp({cwd: filePath});
    return dirname(fp);
}

export function getFilePackageName(filePath: string): string | null {
    const {pkg, path} = readPkgUp({cwd: filePath, normalize: false});
    if (pkg) {
        // recursion in case of intermediate esm package.json without name found
        return pkg.name || getFilePackageName(dirname(dirname(path)));
    }
    return null;
}
