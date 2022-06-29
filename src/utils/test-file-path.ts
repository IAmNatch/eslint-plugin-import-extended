const path = require("path");

export function testFilePath(relativePath: string) {
    return path.join(process.cwd(), "/src/fixtures", relativePath);
}
