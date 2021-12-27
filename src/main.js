#!/usr/bin/env node

const contentful = require('contentful-management')

const config = require('./config.js')
const spaceUtils = require('./spaceUtils.js')
const environmentUtils = require('./environmentUtils.js')
const localMigration = require('./localMigration.js')

function parseArgs (args) {

    if (args && args.length === 3) {
        return args[2]
    }
    else {
        throw new Error("Invalid arguments")
    }

}

function createReleaseId (migrations) {
    const maxVersion = migrations.reduce((acc, m) => Math.max(acc, m.version), 0)
    const strVersion = String(maxVersion).padStart(3, '0')
    return `release-${strVersion}`
}

async function main () {

    const envName = parseArgs(process.argv)
    const isProd = envName === 'master' || envName === 'main'

    const client = contentful.createClient({
        accessToken: config.accessToken
    })

    console.log('get space')
    const space = await client.getSpace(config.spaceId)


    console.log('assert alias')
    await spaceUtils.assertAliasExists('master')(space)

    console.log('get master')
    const master = await space.getEnvironment('master')
    console.log('master: ', master)

    console.log('remote migrations')
    const remoteMigrations = await environmentUtils.getMigrations()(master)

    console.log('local migrations')
    const localMigrations = await localMigration.loadLocalMigrations()

    const migrations = localMigration.matchMigrations(remoteMigrations, localMigrations)

    if (migrations.length || !isProd) {

        const envId = isProd ? createReleaseId(migrations) : envName

        const envExists = await spaceUtils.checkEnvironmentExists(envId)(space)

        if (envExists && isProd) {
            throw new Error(`Environment already exists: ${envId}`)
        }
        else if (envExists) {
            await spaceUtils.deleteEnvironment(envId)(space)
        }

        const env = await spaceUtils.cloneEnvironment(envId)(space)

        await environmentUtils.createMigrationTypeIfNotExists()(env)

        for (const migration of migrations) {
            await environmentUtils.processMigration(config.accessToken, migration)(env)
        }

        if (isProd) {
            await spaceUtils.realias('master', envId)(space)
        }

    }

}

try {
    main()
}
catch (err) {
    console.error('Failed with error')
}