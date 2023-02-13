import Config from "./_Config";
import * as fs from "fs"
import { execFileSync } from "child_process";

export async function convertToMobi(path: string) {
    if (!fs.existsSync(path)) {
        throw new Error("File not found");
    }
    
    console.info("Converting %s to mobi", path);

    const mobiPath = path.replace(/(epub)$/, "mobi");
    if (fs.existsSync(mobiPath)) {
        return mobiPath;
    }

    try {
        execFileSync(Config.Mobi.converterPath, [path, "-locale", "en"]);
    } catch (err) {
        // execFile always return command failed even if it worked
    }

    if (!fs.existsSync(mobiPath)) {
        throw new Error("Convertion failed");
    }

    return mobiPath;
}