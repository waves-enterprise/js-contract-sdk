#!/usr/bin/env node
/* eslint-disable max-len,no-console */

import sade from 'sade'
import ora from 'ora'
import chalk from 'chalk'
import * as process from 'process'
import fs from 'fs-extra'
import path from 'path'
import { pascalCase } from 'pascal-case'
import { getInstallCmd } from './install-cmd'
import { execa } from 'execa'
import pkg from '../package.json'

const { realpath } = fs
const prog = sade('we-create-contract [contractName]', true)

prog
  .version(pkg.version)
  .option('--path', 'Folder to create contract', 'we-contract-starter')
  .describe('Create a new contract')
  .example('create mypackage')
  .action(async (contractName: string, opts: { path: string }) => {
    console.log(
      chalk.green(`
 | | /| / / _ | | / / __/ __/ / __/ |/ /_  __/ __/ _ \\/ _ \\/  _/ __/ __/
 | |/ |/ / __ | |/ / _/_\\ \\  / _//    / / / / _// , _/ ____/ /_\\ \\/ _/  
 |__/|__/_/ |_|___/___/___/ /___/_/|_/ /_/ /___/_/|_/_/  /___/___/___/                                                                                                                                                                                                        
`),
    )

    const bootSpinner = ora(`Scaffolding Waves Enterpise JS Contract in ${chalk.bold.green(opts.path)}`)
    bootSpinner.start()

    if (!contractName) {
      bootSpinner.fail()

      console.log(`
Contract name is not specified.
Try ${chalk.yellowBright('we-create-contract MyContract')}
        `)

      process.exit(0)
    }

    bootSpinner.info()

    const realPath = await realpath(process.cwd())
    const projectPath = path.join(realPath, opts.path)
    const relContractPath = `./src/${contractName}.ts`
    const contractPath = path.resolve(projectPath, relContractPath)

    try {
      bootSpinner.start('Copy template files ...')

      await fs.copy(
        path.resolve(path.dirname('.'), './template'),
        projectPath,
        {
          overwrite: true,
        },
      )

      await fs.move(
        path.resolve(projectPath, './_gitignore'),
        path.resolve(projectPath, './.gitignore'),
        { overwrite: true },
      )

      await fs.move(
        path.resolve(projectPath, './src/contract'),
        contractPath,
        { overwrite: true },
      )

      await fs.move(
        path.resolve(projectPath, './index'),
        path.resolve(projectPath, './index.ts'),
        { overwrite: true },
      )

      let contractTpl: string = await fs.readFile(contractPath, { encoding: 'utf-8' })

      contractTpl = contractTpl.replace('#{contractName}', pascalCase(contractName))

      await fs.writeFile(contractPath, contractTpl, {
        encoding: 'utf-8',
      })

      // TODO deprecate index.ts
      let entrypoint: string = await fs.readFile(path.resolve(projectPath, './index.ts'), { encoding: 'utf-8' })
      entrypoint = entrypoint.replace('./src/contract', relContractPath)
      await fs.writeFile(
        path.resolve(projectPath, './index.ts'),
        entrypoint,
        {
          encoding: 'utf-8',
        },
      )

      bootSpinner.succeed()
    } catch (e) {

      console.log(e)
      process.exit(0)
    }

    process.chdir(projectPath)
    try {
      const cmd = await getInstallCmd()
      bootSpinner.start('Installing dependencies')
      await execa(cmd, ['install'])
      bootSpinner.succeed()
    } catch (e) {

      console.log(e)
      process.exit(0)
    }

    console.log(`
Successfully scaffolded project in ${chalk.blue(projectPath)}
Start build contract by change ${chalk.greenBright(relContractPath)}
        `)
  })
  .parse(process.argv)


