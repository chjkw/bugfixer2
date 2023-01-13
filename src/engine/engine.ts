import {Bug} from '../dto/bug'
import { PatchLineInfo } from '../results/diagnostics';

export abstract class Engine {
    private _name: string;
    private _output_path: string;
    private _analyze_cmd: string;
    private _build_cmd: string = "";
    private _clean_build_cmd: string = "";
    private _report_file: string = "";
    protected _patch_path: string = "";
    private _patch_data_path: string = "";
    private _patch_input_path: string = "";
    private _patched_path: string = "";

    abstract get_analysis_cmd(): string[];
    abstract get_incremental_cmd(): string[];
    abstract get_file_bugs_map(): Map<string, Bug[]>;
    abstract get_patch_cmd(key: string): string[];
    abstract make_patch(key: string): void;
    abstract apply_patch(src: string, patched: string): void;
    abstract get_error_key(bug: Bug): string;
<<<<<<< HEAD
    abstract get_patches(): PatchLineInfo[];
=======
    abstract logHandler(log: string): string;
>>>>>>> 9fa4c9f861cdbd09d4def5fddb84c999649cf778
    
    constructor(name:string, analyze_cmd:string, output_path:string){
        this._name = name;
        this._analyze_cmd = analyze_cmd; 
        this._output_path = output_path;
        this._patch_path = `${this._output_path}/${this._name}/patches`;
        this._patch_data_path = `${this._patch_path}/data`;
        this._patch_input_path = `${this._patch_path}/input`;
        this._patched_path = `${this._patch_path}/patched`;
    }
    
    public get name() {
        return this._name;
    }

    public get output_path(): string {
        return this._output_path;
    }

    public set output_path(value: string) {
        this._output_path = value;
    }

    public get report_file(): string {
        return this._report_file;
    }

    public set report_file(value: string) {
        this._report_file = value;
    }

    public get analyze_cmd(): string {
        return this._analyze_cmd;
    }

    public get build_cmd(): string {
        return this._build_cmd;
    }
    public set build_cmd(value: string) {
        this._build_cmd = value;
    }

    public get clean_build_cmd(): string {
        return this._clean_build_cmd;
    }
    public set clean_build_cmd(value: string) {
        this._clean_build_cmd = value;
    }
    public get patch_path(): string {
        return this._patch_path;
    }
    public get patch_data_path(): string {
        return this._patch_data_path;
    }
    public get patch_input_path(): string {
        return this._patch_input_path;
    }
    public get patched_path(): string {
        return this._patched_path;
    }

    
}