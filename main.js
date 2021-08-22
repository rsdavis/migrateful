
const path = require('path')
const contentful = require('contentful-management')

const config = require('./config.js')
const spaceUtils = require('./spaceUtils.js')
const environmentUtils = require('./environmentUtils.js')
const migrationUtils = require('./migrationUtils.js')


async function main () {

    const isProd = true

    const client = contentful.createClient({
        accessToken: config.accessToken
    })

    const space = await client.getSpace(config.spaceId)

    await spaceUtils.assertAliasExists('master')(space)

    const envId = environmentUtils.getEnvId(isProd)

    const envExists = await spaceUtils.checkEnvironmentExists(envId)(space)

    if (envExists && isProd) {
        throw new Error(`Environment already exists: ${envId}`)
    }
    else if (envExists) {
        // delete environment
    }

    const env = await spaceUtils.cloneEnvironment(envId)(space)

    await environmentUtils.createMigrationTypeIfNotExists()(env)

    const remoteMigrations = environmentUtils.getMigrations()(env)

    const migrationFolder = path.join(__dirname, 'migrations')
    const localMigrations = await migrationUtils.getMigrations(migrationFolder)

    const nextUp = migrationUtils.matchMigrations(remoteMigrations, localMigrations)

    for (const migration of nextUp) {
        await environmentUtils.processMigration(config.accessToken, migration)(env)
    }

    if (isProd) {
        await spaceUtils.realias('master', envId)(space)
    }

}

main()