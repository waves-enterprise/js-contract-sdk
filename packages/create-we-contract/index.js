#!/usr/bin/env node

const path = require('path')
const process = require('process');
const fs = require('fs');


const {Command} = require('commander');
const {pascalCase} = require("pascal-case");
const program = new Command();


const CURR_DIR = process.cwd();

program
  .name('we-create-contract')
  .description('CLI to generate WE Contract')
  .version('0.1.0');


program
  .description('Generates TS boilerplate')
  .argument('name', 'Contract name in CamelCase')
  .option('-t, --target <char>', 'Target Path', 'we-contract-starter')
  .option('-o, --overwrite', 'Overwrite target path', false)
  .option('-n, --name', 'Package name')
  .action(async (arg, options) => {
    const {target, overwrite, name} = options;

    const contractName = pascalCase(arg);

    const templatePath = path.join(__dirname, 'template');
    const rootPath = path.join(CURR_DIR, target);

    console.log(`\nScaffolding project in ${rootPath}...`)
    console.log()

    const templateFiles = {
      [path.join('src', 'contract.ts')]: {
        contractName: contractName
      }
    }

    const renameFiles = {
      _gitignore: '.gitignore'
    }

    function copy(src, dest) {
      const stat = fs.statSync(src)
      if (stat.isDirectory()) {
        copyDir(src, dest)
      } else {
        const templateName = Object.keys(templateFiles)
          .find((k) => src.endsWith(k));

        if (!templateName) {
          fs.copyFileSync(src, dest)
        } else {
          let fileTemplate = fs.readFileSync(src).toString();

          const templateParams = templateFiles[templateName];

          for (let v of Object.keys(templateParams)) {
            fileTemplate = fileTemplate.replace(`#{${v}}`, templateParams[v])
          }

          fs.writeFileSync(dest, fileTemplate)
        }
      }
    }

    const copyDir = (srcDir, destDir) => {
      fs.mkdirSync(destDir, {recursive: true})

      for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
      }
    }

    const emptyDir = (dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);

        return
      }
      for (const file of fs.readdirSync(dir)) {
        const abs = path.resolve(dir, file)
        // baseline is Node 12 so can't use rmSync :(
        if (fs.lstatSync(abs).isDirectory()) {
          emptyDir(abs)
          fs.rmdirSync(abs)
        } else {
          fs.unlinkSync(abs)
        }
      }
    }

    const pkgFromUserAgent = (userAgent) => {
      if (!userAgent) return undefined
      const pkgSpec = userAgent.split(' ')[0]
      const pkgSpecArr = pkgSpec.split('/')
      return {
        name: pkgSpecArr[0],
        version: pkgSpecArr[1]
      }
    }

    const write = (file, content) => {
      const targetPath = renameFiles[file]
        ? path.join(rootPath, renameFiles[file])
        : path.join(rootPath, file)

      if (content) {
        fs.writeFileSync(targetPath, content)
      } else {
        copy(path.join(templatePath, file), targetPath)
      }
    }


    if (overwrite) {
      emptyDir(rootPath)
    } else if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath)
    }

    const files = fs.readdirSync(templatePath)
    for (const file of files.filter((f) => f !== 'package.json')) {
      write(file)
    }

    const pkg = require(path.join(templatePath, `package.json`))

    pkg.name = name || 'we-contract-starter'

    write('package.json', JSON.stringify(pkg, null, 2))

    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
    const pkgManager = pkgInfo ? pkgInfo.name : 'npm'


    console.log(`\nDone. Now run:\n`)
    if (rootPath !== CURR_DIR) {
      console.log(`  cd ${path.relative(CURR_DIR, rootPath)}`)
    }
    switch (pkgManager) {
      case 'yarn':
        console.log('  yarn')
        console.log('  yarn dev')
        break
      default:
        console.log(`  ${pkgManager} install`)
        console.log(`  ${pkgManager} run dev`)
        break
    }
    console.log()
  });


program.parse(process.argv);