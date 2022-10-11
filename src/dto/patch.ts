import * as vscode from 'vscode'

export enum PatchType {Insert, Delete, Replace};

export class Patch {
    public constructor(
        private readonly type: PatchType,
        private readonly range: vscode.Range,
        private readonly patch: string
    ) {}
}

export class PatchLineInfo {
	public constructor(
        public readonly uri: string,
        public readonly lines: number[]
    ) {}
}

export class SaverPatch {
    constructor(
        public readonly method: string,
        public readonly line: number,
        public readonly column: number,
        public readonly contents: string
    ) {}
}

export class NPEXPatch {
    public constructor(
        public readonly patched_lines: number[]
    ) {}
}

export class NPEXResult {
    public constructor(
        public readonly verified_patches: string[]
    ) {}
}