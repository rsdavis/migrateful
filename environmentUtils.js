

function prodEnvId () {
    const d = new Date()
    const sub = d.toISOString().substr(0, 10)
    const h = String(d.getUTCHours()).padStart(2, '0')
    const m = String(d.getUTCMinutes()).padStart(2, '0')
    const s = String(d.getUTCSeconds()).padStart(2, '0')
    return `release-${sub}.${h}-${m}-${s}`
}

function devEnvId () {
    return 'dev'
}

function getEnvId (isProd) {
    return isProd ? prodEnvId() : devEnvId()
}

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
            console.log('Creating the migration type')
            await createMigrationType()(env)
        }

    }

}

function getMigrations () {

    return async env => {

        const { items } = await env.getEntries({
            content_type: 'migration'
        })

        console.log(JSON.stringify(items, null, 4))

        const migrations = items
            .map(item => ({
                version: item.fields.version,
                name: item.fields.name['en-US']
            }))
            .sort((a, b) => {
                return a.version - b.version
            })

        return migrations

    }

}

module.exports = {
    getEnvId,
    createMigrationTypeIfNotExists,
    getMigrations
}