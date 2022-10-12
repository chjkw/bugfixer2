import {
  commands,
  Disposable,
} from "vscode";

import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';

import { Engine } from "./engine/engine";
import { EngineEnv } from "./engine/engine_env";
import * as util from "./common/util";
import * as log_util from "./common/logger";
import * as wc from "./ui/window_controller";
import * as constants from "./common/constants";

export class EngineController {
  private _commandForAnalysisAll: Disposable;
  private _commandForAnalysisContinue: Disposable;
  private logger: log_util.Logger;

  public constructor(private context: vscode.ExtensionContext) {
    this._commandForAnalysisAll = commands.registerCommand("bugfixer.analyze_all",
      (uri: vscode.Uri) => {
        this.analyze_all(uri);
      });

      this._commandForAnalysisContinue = commands.registerCommand("bugfixer.analyze_continue",
      (uri: vscode.Uri) => {
        this.analyze_continue(uri);
      });

    vscode.commands.registerCommand(constants.MAKE_PATCH_COMMAND, (key) => this.make_patch(key))
    this.logger = new log_util.Logger("EngineController");
  }

  public dispose() {
    this._commandForAnalysisAll.dispose();
    this._commandForAnalysisContinue.dispose();
  }

  protected analyze_all(uri: vscode.Uri) {
    const analyzer: Engine = EngineEnv.getInstance().get_analyzer();
    analyzer.build_cmd = "make";
    analyzer.clean_build_cmd = "make clean all"
    console.log(util.getCwd());
    let args: string[] = analyzer.get_analysis_cmd();

    const output_path = path.join(util.getCwd(), analyzer.output_path);
    if (util.pathExists(output_path)) {
      fs.rmdirSync(output_path, { recursive: true });
    }

    this.analyze(uri, analyzer, args);
  }

  protected analyze_continue(uri: vscode.Uri) {
    const analyzer: Engine = EngineEnv.getInstance().get_analyzer();
    analyzer.build_cmd = "make";
    analyzer.clean_build_cmd = "make clean all"
    let args: string[] = analyzer.get_incremental_cmd();

    this.analyze(uri, analyzer, args);
  }

  protected analyze(uri: vscode.Uri, analyzer: Engine, args: string[]) {
    const output_path = path.join(util.getCwd(), analyzer.output_path);

    vscode.window.showInformationMessage(`${analyzer.analyze_cmd} ${args.join(" ")}`);
    this.logger.info(`${analyzer.analyze_cmd} ${args.join(" ")}`);

    vscode.commands.executeCommand('bugfixer.progress_detail', null);
    vscode.commands.executeCommand('bugfixer.setStatus', "Build");

    const stderrHandler = (data:any) => {
      const progress = data.progress;

      this.logger.debug(`!!! ${data.log} !!!`);
      
      const logs = data.log.split(/\r?\n/);
      logs.forEach((l:string) => {
        this.logger.debug(`stderr: ${l}`);
        const log = analyzer.logHandler(l.trim());

        var arr = log.match(/\[(.*)\] (.*)/);

        if (arr?.length != 3) {
          return;
        }

        const title = arr[1];
        const message = arr[2];

        if (title == "Progress") progress.report({ message: message });
        else if (title == "Build") vscode.commands.executeCommand('bugfixer.setStatus', "Build");
        else if (title == "Analyze") vscode.commands.executeCommand('bugfixer.setStatus', "Analyze");
        else if (title == "Patch]") vscode.commands.executeCommand('bugfixer.setStatus', "Patch");
        else if (title == "Validate") vscode.commands.executeCommand('bugfixer.setStatus', "Validate");
        else vscode.commands.executeCommand('bugfixer.updateLog', title, util.getTime(new Date()), message);
      });
    }
    
    const stdoutHandler = (data:any) => {
      const progress = data.progress;

      this.logger.debug(`!!! ${data.log} !!!`);
      
      const logs = data.log.split(/\r?\n/);
      logs.forEach((l:string) => {
        this.logger.debug(`stdout: ${l}`);
        const log = analyzer.logHandler(l.trim());

        var arr = log.match(/\[(.*)\] (.*)/);

        if (arr?.length != 3) {
          return;
        }

        const title = arr[1];
        const message = arr[2];

        if (title == "Progress") progress.report({ message: message });
        else if (title == "Build") vscode.commands.executeCommand('bugfixer.setStatus', "Build");
        else if (title == "Analyze") vscode.commands.executeCommand('bugfixer.setStatus', "Analyze");
        else if (title == "Patch]") vscode.commands.executeCommand('bugfixer.setStatus', "Patch");
        else if (title == "Validate") vscode.commands.executeCommand('bugfixer.setStatus', "Validate");
        else vscode.commands.executeCommand('bugfixer.updateLog', title, util.getTime(new Date()), message);
      });
    }

    const exitHandler = (data:any) => { 
      vscode.commands.executeCommand('bugfixer.refreshBugs');
      vscode.commands.executeCommand('bugfixer.updateLog', "완료", "", "분석이 완료되었습니다.");
    }

    const windowController = new wc.WindowController(this.logger, "");
    
    // remove previous restuls
    const reportFile = path.join(util.getCwd(), analyzer.output_path, analyzer.report_file);
    if(util.pathExists(reportFile))
      fs.unlinkSync(reportFile);

    vscode.commands.executeCommand("bugfixer.clearDiag");
    vscode.commands.executeCommand('bugfixer.refreshBugs'); 
    windowController.runWithProgress(`${analyzer.name} 실행`, analyzer.name, analyzer.analyze_cmd, args, stdoutHandler, stderrHandler, exitHandler);
  }

  protected make_patch(key: string) {
    
    const patch_maker: Engine = EngineEnv.getInstance().get_patch_maker();

    let patch_maker_result = "";

    vscode.commands.executeCommand('bugfixer.setStatus', "Patch");

    const stdoutHandler = (data:any) => {
      patch_maker_result += data.toString();
    }
    const stderrHandler = (data:any) => {
      patch_maker_result += data.log;
    }
    const exitHandler = (data:any) => { 
      const cwd = util.getCwd();
      const patchDataPath = path.join(cwd, patch_maker.patch_data_path);
        
      if(!util.pathExists(patchDataPath))
          fs.mkdirSync(patchDataPath, {recursive: true});

      const patchFile = path.join(patchDataPath, `${key}.log`);
      fs.writeFileSync(patchFile, patch_maker_result, 'utf8');
      
      patch_maker.make_patch(key);
      vscode.commands.executeCommand('bugfixer.updateLog', "완료", "", "패치 생성이 완료되었습니다.");
    }

    const windowController = new wc.WindowController(this.logger, "");
    const args = patch_maker.get_patch_cmd(key);
    vscode.window.showInformationMessage(`${patch_maker.analyze_cmd} ${args.join(" ")}`);
    this.logger.info(`${patch_maker.analyze_cmd} ${args.join(" ")}`);
    windowController.runWithProgress('패치 생성', patch_maker.name, patch_maker.analyze_cmd, patch_maker.get_patch_cmd(key), stdoutHandler, stderrHandler, exitHandler);
  }
  
}