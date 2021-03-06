import {
  commands,
  window,
  Disposable,
  ProgressLocation
} from "vscode";

import * as child_process from "child_process";
import * as vscode from "vscode";
import * as path from 'path';

import { Engine } from "./engine/engine";
import { EngineEnv } from "./engine/engine_env";

import * as util from "./common/util";
import * as fs from 'fs';

export class BugfixerController {
  private _commandForAnalysis: Disposable;

  public constructor(private context: vscode.ExtensionContext) {
    this._commandForAnalysis = commands.registerCommand("bugfixer.analyze_all",
      (uri: vscode.Uri) => {
        this.analyse(uri);
      });
  }

  public dispose() {
    this._commandForAnalysis.dispose();
  }

  protected analyse(uri: vscode.Uri) {
    const analyzer: Engine = EngineEnv.getInstance().get_analyzer();
    analyzer.build_cmd = "make";
    analyzer.clean_build_cmd = "make"

    const output_path = path.join(util.getCwd(), analyzer.output_path);

    if (util.pathExists(output_path)) {
      fs.rmdirSync(output_path, { recursive: true });
    }

    let args: string[] = analyzer.get_analysis_cmd();

    vscode.window.showInformationMessage(`${analyzer.analyze_cmd} ${args.join(" ")}`);

    window.withProgress({
      location: ProgressLocation.Notification,
      title: `${analyzer.name} 실행`,
      cancellable: true
    },
      async (progress, token) => {
        let canceled = false;

        const p = new Promise(resolve => {
          let result = "";
          let errmsg = "";

          let bugfixer = child_process.spawn(
            analyzer.analyze_cmd,
            args,
            { cwd: util.getCwd() }
          );

          bugfixer.stderr.on("data", data => {
            let log: string = data.toString();
            errmsg += log;

            if (log.includes("Starting analysis...")) {
              progress.report({ message: `${analyzer.name} 분석 중` });
            }
          });

          bugfixer.stdout.on("data", data => {
            let log: string = data.toString();
            result += data.toString();

            progress.report({ message: log });
          });

          bugfixer.on("exit", (code) => {
            if (canceled) {
              vscode.window.showInformationMessage(`${analyzer.name} 실행이 취소되었습니다.`);
              bugfixer.kill();
            }
            else {
              progress.report({ increment: 100, message: "실행 완료" });
              vscode.window.showInformationMessage(`${analyzer.name} 실행이 완료되었습니다.`);
              vscode.commands.executeCommand('bugfixer.refreshBugs');
            }

            resolve(0);
          });
        });;

        return p;
      });
  }
}