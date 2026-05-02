import fs from 'fs';
import path from 'path';

const PROJECT_FILE = '.envl';

export function saveProjectId(gistId: string) {
    fs.writeFileSync(path.join(process.cwd(), PROJECT_FILE), gistId);
}

export function getProjectId(): string | undefined {
    const p = path.join(process.cwd(), PROJECT_FILE);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8').trim() : undefined;
}

export function scanEnvFiles(ignoreList: string[] = []): string[] {
    const files = fs.readdirSync(process.cwd());

    return files.filter(file =>
        file.startsWith('.env') &&
        !file.endsWith('.envl') &&
        !ignoreList.includes(file)
    );
}