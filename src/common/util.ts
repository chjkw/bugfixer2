import * as fs from 'fs';
import * as vscode from 'vscode';

export function pathExists(p: string): boolean {
	try {
	  fs.accessSync(p);
	} catch (err) {
	  return false;
	}
  
	return true;
}

export function getCwd(): string {
	if(vscode.workspace.workspaceFolders === undefined) return "";

  return vscode.workspace.workspaceFolders[0].uri.fsPath;
} 

function insertLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 0, contents);
}

function replaceLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 1, contents);
}

function deleteLine(data: Array<string>, line:number, contents: string): Array<string> {
	return data.splice(line, 1);
}

export const insertFromFile = manipulateFile(insertLine);
export const replaceFromFile = manipulateFile(replaceLine);
export const deleteFromFile = manipulateFile(deleteLine);

function manipulateFile(func: Function): (src: string, dst: string, line: number, contents: string) => void {
	return function(src: string, dst: string, line: number, contents: string) {
		var data = fs.readFileSync(src).toString().split("\n");
		func(data, line, contents)
		var text = data.join("\n");

		fs.writeFile(dst, text, function (err) {
			if (err) return console.log(err);
		});
	} 
}

// json 파일에서 읽어들이기
export function readJSON<T>(jsonPath: string): T {
	const jsonString = fs.readFileSync(jsonPath, 'utf-8');
	const data: T = JSON.parse(jsonString);
	return data;
}
