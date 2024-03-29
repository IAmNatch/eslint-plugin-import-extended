import {
    isAbsolute as nodeIsAbsolute,
    relative,
    resolve as nodeResolve,
} from "path";
import isCoreModule from "is-core-module";

import resolve from "eslint-module-utils/resolve";
import {getContextPackagePath} from "./packagePath";
import {Rule} from "eslint";
import {TSESLint} from "@typescript-eslint/utils";

function baseModule(name: string) {
    if (isScoped(name)) {
        const [scope, pkg] = name.split("/");
        return `${scope}/${pkg}`;
    }
    const [pkg] = name.split("/");
    return pkg;
}

function isInternalRegexMatch(
    name: string,
    settings: Rule.RuleContext["settings"]
) {
    const internalScope: string | undefined =
        settings && settings["import/internal-regex"];
    return internalScope && new RegExp(internalScope).test(name);
}

export function isAbsolute(name: string) {
    return typeof name === "string" && nodeIsAbsolute(name);
}

// path is defined only when a resolver resolves to a non-standard path
export function isBuiltIn(
    name: string,
    settings: Rule.RuleContext["settings"],
    path: string
) {
    if (path || !name) return false;
    const base = baseModule(name);
    const extras = (settings && settings["import/core-modules"]) || [];
    return isCoreModule(base) || extras.indexOf(base) > -1;
}

export function isExternalModule(
    name: string,
    path: string,
    context: RuleContext
) {
    if (arguments.length < 3) {
        throw new TypeError(
            "isExternalModule: name, path, and context are all required"
        );
    }
    return (
        (isModule(name) || isScoped(name)) &&
        typeTest(name, context, path) === "external"
    );
}

export function isExternalModuleMain(
    name: string,
    path: string,
    context: RuleContext
) {
    if (arguments.length < 3) {
        throw new TypeError(
            "isExternalModule: name, path, and context are all required"
        );
    }
    return isModuleMain(name) && typeTest(name, context, path) === "external";
}

const moduleRegExp = /^\w/;
function isModule(name: string) {
    return name && moduleRegExp.test(name);
}

const moduleMainRegExp = /^[\w]((?!\/).)*$/;
function isModuleMain(name: string) {
    return name && moduleMainRegExp.test(name);
}

const scopedRegExp = /^@[^/]+\/?[^/]+/;
export function isScoped(name: string) {
    return name && scopedRegExp.test(name);
}

const scopedMainRegExp = /^@[^/]+\/?[^/]+$/;
export function isScopedMain(name: string) {
    return name && scopedMainRegExp.test(name);
}

function isRelativeToParent(name: string) {
    return /^\.\.$|^\.\.[\\/]/.test(name);
}

const indexFiles = [".", "./", "./index", "./index.js"];
function isIndex(name: string) {
    return indexFiles.indexOf(name) !== -1;
}

function isRelativeToSibling(name: string) {
    return /^\.[\\/]/.test(name);
}

function isExternalPath(path: string, context: RuleContext) {
    if (!path) {
        return false;
    }

    const packagePath = getContextPackagePath(context);

    if (relative(packagePath, path).startsWith("..")) {
        return true;
    }

    const folders = ["node_modules"];
    return folders.some((folder: string) => {
        const folderPath = nodeResolve(packagePath, folder);
        const relativePath = relative(folderPath, path);
        return !relativePath.startsWith("..");
    });
}

function isInternalPath(path: string, context: RuleContext) {
    if (!path) {
        return false;
    }
    const packagePath = getContextPackagePath(context);
    return !relative(packagePath, path).startsWith("../");
}

function isExternalLookingName(name: string) {
    return isModule(name) || isScoped(name);
}

function typeTest(name: string, context: RuleContext, path: string) {
    const {settings} = context;
    if (isInternalRegexMatch(name, settings)) {
        return "internal";
    }
    if (isAbsolute(name)) {
        return "absolute";
    }
    if (isBuiltIn(name, settings, path)) {
        return "builtin";
    }
    if (isRelativeToParent(name)) {
        return "parent";
    }
    if (isIndex(name)) {
        return "index";
    }
    if (isRelativeToSibling(name)) {
        return "sibling";
    }
    if (isExternalPath(path, context)) {
        return "external";
    }
    if (isInternalPath(path, context)) {
        return "internal";
    }
    if (isExternalLookingName(name)) {
        return "external";
    }
    return "unknown";
}

type RuleContext = Readonly<TSESLint.RuleContext<never, never[]>>;
export default function resolveImportType(name: string, context: RuleContext) {
    return typeTest(name, context, resolve(name, context));
}
