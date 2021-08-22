
const contentful = require('contentful-management')

async function main () {

    const accessToken = '***REMOVED***'
    const spaceId = '***REMOVED***'
    const envId = 'release-2021-08-15.13-45-13'

    // await checkForEnvironmentAlias(accessToken, spaceId)
    // await createEnvironmentAlias(accessToken, spaceId, 'dev')
    
    // await setupEnvironment({
    //     accessToken,
    //     spaceId,
    //     envId: releaseEnvId()
    // })

    // await createMigrationType(accessToken, spaceId, envId)
    // const exists = await checkMigrationTypeExists (accessToken, spaceId, envId)
    // console.log({ exists })

    // const entry = await createMigrationEntry(accessToken, spaceId, envId, 2, 'init_migration')

    // console.log(entry)

}



async function checkForEnvironmentAlias (accessToken, spaceId, aliasId) {

    const client = contentful.createClient({
        accessToken
    })

    const space = await client.getSpace(spaceId)
    const aliases = await space.getEnvironmentAliases()

    const alias = aliases.items.find(d => d.sys.id === aliasId)

    return Bool(alias)

}

async function createEnvironmentAlias (accessToken, spaceId, aliasId) {

    const client = contentful.createClient({
        accessToken
    })

    const space = await client.getSpace(spaceId)

    const alias = await space.createEnvironmentAliasWithId(aliasId, {
        environment: {
            sys: { type: 'Link', linkType: 'Environment', id: 'test' }
        }
    })

    console.log(alias)

}

function releaseEnvId () {
    const d = new Date()
    const sub = d.toISOString().substr(0, 10)
    const h = String(d.getUTCHours()).padStart(2, '0')
    const m = String(d.getUTCMinutes()).padStart(2, '0')
    const s = String(d.getUTCSeconds()).padStart(2, '0')
    const envId = `release-${sub}.${h}-${m}-${s}`
    return envId
}

async function setupEnvironment ({ accessToken, spaceId, envId }) {

    const client = contentful.createClient({ accessToken })
    const space = await client.getSpace(spaceId)

    console.log('Setup new environment: ', envId)

    try {
        const env = await space.getEnvironment(envId)
        console.log('Deleting existing environment')
        await env.delete()
    }
    catch (e) {
        console.log('Environment does not yet exist')
    }

    console.log('Create the new environment')
    let environment = await space.createEnvironmentWithId(envId, { name: envId })

    while (environment.sys.status.sys.id === 'inProgress') {

        console.log(environment.sys.status.sys.id)
        await new Promise(resolve => setTimeout(resolve, delay))
        environment = await space.getEnvironment(envId)

    }

    console.log('Done with environment setup')

    return environment

}

async function checkMigrationTypeExists (accessToken, spaceId, envId) {

    const client = contentful.createClient({ accessToken })
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(envId)
    const types = await environment.getContentTypes()
    const type = types.items.find(d => d.sys.id === 'migration')
    return Boolean(type)

}

async function createMigrationType (accessToken, spaceId, envId) {

    const migrationType = {
        name: 'Migration',
        displayField: 'name',
        fields: [
            {
                id: 'version',
                name: 'Version',
                required: true,
                localized: false,
                type: 'Integer'
            },
            {
                id: 'name',
                name: 'Name',
                required: false,
                localized: false,
                type: 'Symbol'
            }
        ] 
    }

    const client = contentful.createClient({ accessToken })
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(envId)
    const type = await environment.createContentTypeWithId('migration', migrationType)
    await type.publish()

}

async function createMigrationEntry (accessToken, spaceId, envId, version, name) {

    const client = contentful.createClient({ accessToken })
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(envId) 

    const entry = await environment.createEntry('migration', {
        fields: { 
            version: {
                'en-US': version
            }, 
            name: {
                'en-US': name
            } 
        }
    })

    await entry.publish()

    return entry

}




main()