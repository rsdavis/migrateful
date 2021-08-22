
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

    console.log(nextUp)

    // config
    // get space
    // check alias exists
    // get new environment name
    // check if environment exists
    // delete environment
    // clone env
    // check migration type exists
    // create migration type coniditional
    // read migrations
    // validate existing migrations
    // run migration
    // update version

}

main()