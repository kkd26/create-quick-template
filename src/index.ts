#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import * as shell from 'shelljs';
import * as template from './template';

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What project template would you like to use?',
    choices: CHOICES,
  },
  {
    name: 'name',
    type: 'input',
    message: 'New project name?',
  },
  {
    name: 'npm_install',
    type: 'list',
    message: 'Do you want to run npm install?',
    choices: ['yes', 'no'],
  },
];

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  targetPath: string;
}

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then((answers) => {
  const projectChoice = answers['template'];
  const projectName = answers['name'];
  const templatePath = path.join(__dirname, 'templates', projectChoice);
  const targetPath = path.join(CURR_DIR, projectName);
  const options: CliOptions = {
    projectName,
    templateName: projectChoice,
    templatePath,
    targetPath,
  };

  if (!createProject(targetPath)) {
    return;
  }
  createDirectoryContents(templatePath, projectName);

  if (answers['npm_install'] === 'yes') postProcess(options);
});

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }
  fs.mkdirSync(projectPath);

  return true;
}

const SKIP_FILES = ['node_modules', '.template.json'];
const SKIP_EXT = ['.rest'];
const NO_RENDER = ['.ico', '.png', '.jpg', '.jpeg', '.mp3', '.mp4'];

function createDirectoryContents(templatePath: string, projectName: string) {
  // read all files/folders (1 level) from template folder
  const filesToCreate = fs.readdirSync(templatePath);
  // loop each file/folder
  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);
    const extname = path.extname(origFilePath);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    // skip files that should not be copied
    if (SKIP_FILES.indexOf(file) > -1) return;
    if (SKIP_EXT.indexOf(extname) > -1) return;

    if (stats.isFile()) {
      const writePath = path.join(CURR_DIR, projectName, file);

      if (NO_RENDER.includes(extname)) {
        fs.writeFileSync(writePath, fs.readFileSync(origFilePath));
      } else {
        // read file content and transform it using template engine
        let contents = fs.readFileSync(origFilePath, 'utf8');
        contents = template.render(contents, { projectName });
        // write file to destination folder
        fs.writeFileSync(writePath, contents, 'utf8');
      }
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));
      // copy files/folder inside current folder recursively
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file)
      );
    }
  });
}

function postProcess(options: CliOptions) {
  const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'));
  if (isNode) {
    shell.cd(options.targetPath);
    const result = shell.exec('npm install');
    if (result.code !== 0) {
      return false;
    }
  }

  return true;
}
