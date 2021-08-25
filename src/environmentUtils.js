
const { runMigration } = require('contentful-migration')

function checkMigrationTypeExists () {

    return async env => {

        const types = await env.getContentTypes()
        const type = types.items.find(d => d.sys.id === 'migration')
        return Boolean(type)

    }

}

function createMigrationType () {

    const migrationType = {
        name: 'Migration',
        displayField: 'name',
        description: 'Track migration versions',
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

    return async env => {
        const type = await env.createContentTypeWithId('migration', migrationType)
        await type.publish()
    }

}

function createMigrationTypeIfNotExists () {

    return async env => {

        const exists = await checkMigrationTypeExists()(env)

        if (!exists) {
            await createMigrationType()(env)
        }

    }

}

function getMigrations () {

    return async env => {

        const { items } = await env.getEntries({
            content_type: 'migration'
        })

        const migrations = items
            .map(item => ({
                version: item.fields.version['en-US'],
                name: item.fields.name['en-US']
            }))
            .sort((a, b) => {
                return a.version - b.version
            })

        return migrations

    }

}

function createMigrationEntry (migration) {

    return async env => {

        const entry = await env.createEntry('migration', {
            fields: {
                version: {
                    'en-US': migration.version,
                },
                name: {
                    'en-US': migration.name
                }
            }
        })

        await entry.publish()

    }

}

function processMigration (accessToken, migration) {

    return async env => {

        await runMigration({
            filePath: migration.path,
            spaceId: env.sys.space.sys.id,
            accessToken: accessToken,
            environmentId: env.sys.id,
            yes: true
        })

        await createMigrationEntry(migration)(env)

    }

}

module.exports = {
    createMigrationTypeIfNotExists,
    getMigrations,
    processMigration
}