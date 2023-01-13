import * as vscode from 'vscode'

export enum PatchType {Insert, Delete, Replace};

export class Patch {
    public constructor(
        private readonly type: PatchType,
        private readonly range: vscode.Range,
        private readonly patch: string
    ) {}
}

<<<<<<< HEAD
export class NPEXPatch {
    public constructor(
        public readonly patched_lines: number[]
    ) {}
}

export class NPEXResult {
    public constructor(
        public readonly verified_patches: string[]
=======
export class PatchLineInfo {
	public constructor(
        public readonly uri: string,
        public readonly lines: number[]
>>>>>>> 9fa4c9f861cdbd09d4def5fddb84c999649cf778
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

<<<<<<< HEAD
export class MosesPatch {
    constructor(
		public readonly file: string,
		public readonly procedure: string,
		public readonly method: string,
		public readonly contents: string,
		public readonly line: number,
		public readonly column: number,
    ) {}
}

export class PyterPatch {
    constructor(
		public readonly file: string,
		public readonly method: string,
		public readonly contents: string,
		public readonly line: number,
		public readonly column: number
    ) {}
}
  


=======
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
>>>>>>> 9fa4c9f861cdbd09d4def5fddb84c999649cf778
