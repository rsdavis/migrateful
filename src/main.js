
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

async function main () {

    const envName = parseArgs(process.argv)
    const isProd = envName === 'master'

    const client = contentful.createClient({
        accessToken: config.accessToken
    })

    const space = await client.getSpace(config.spaceId)

    await spaceUtils.assertAliasExists('master')(space)

    const envId = isProd ? environmentUtils.getEnvId(isProd) : envName

    const envExists = await spaceUtils.checkEnvironmentExists(envId)(space)

    if (envExists && isProd) {
        throw new Error(`Environment already exists: ${envId}`)
    }
    else if (envExists) {
        await spaceUtils.deleteEnvironment(envId)(space)
    }

    const env = await spaceUtils.cloneEnvironment(envId)(space)

    await environmentUtils.createMigrationTypeIfNotExists()(env)

    const remoteMigrations = await environmentUtils.getMigrations()(env)

    const localMigrations = await localMigration.loadLocalMigrations()

    const migrations = localMigration.matchMigrations(remoteMigrations, localMigrations)

    for (const migration of migrations) {
        await environmentUtils.processMigration(config.accessToken, migration)(env)
    }

    if (isProd) {
        await spaceUtils.realias('master', envId)(space)
    }

}

try {
    main()
}
catch (err) {
    console.error('Failed with error')
}