
const { readdir } = require('fs/promises')
const path = require('path')
const _ = require('underscore')


class LocalMigration {

    constructor ({ version, name, filename, path }) {
        this.version    = version
        this.name       = name
        this.filename   = filename
        this.path       = path
    }

}

async function readMigrationFiles (migrationsFolder) {

    try {
        return await readdir(migrationsFolder)
    }
    catch (err) {
        console.error(`Could not find migrations folder: ${migrationsFolder}`)
        throw new Error(err)
    }

}

function parseLocalMigration (folder, filename) {

    const regex = /^(?<version>\d+)-(?<name>.*)\.js$/
    const match = filename.match(regex)

    if (match === null) {
        console.error(`Migration filename is not formatted correctly: ${fn}`)
        throw new Error(`Invalid migration`)
    }

    return new LocalMigration({
        version: Number(match.groups.version), 
        name: match.groups.name, 
        filename: filename, 
        path: path.join(folder, filename)
    })

}

async function loadLocalMigrations () {

    const migrationFolder = path.join(process.cwd(), 'migrations')
    const filenames = await readMigrationFiles(migrationFolder)
    const migrations = filenames.map(parseLocalMigration.bind(null, migrationFolder))
    return _.sortBy(migrations, 'version')

}

function matchMigrations (remoteMigrations, localMigrations) {

    const zipped = _.zip(remoteMigrations, localMigrations)

    const historical    = zipped.filter(d =>  d[0] &&  d[1])
    const missing       = zipped.filter(d =>  d[0] && !d[1]).map(_.first)
    const next          = zipped.filter(d => !d[0] &&  d[1]).map(_.last)

    const isValid = d => {
        return d[0]
            && d[1]
            && d[0].name === d[1].name
            && d[0].version === d[1].version
    }

    const isNotValid    = _.negate(isValid)
    const invalid       = historical.filter(isNotValid)

    if (invalid.length) {
        console.error('Found invalid migration history')
        console.error(invalid)
        throw new Error('Invalid migrations')
    }

    if (missing.length) {
        console.error('Migrations missing from local environment')
        console.error(missing)
        throw new Error('Missing migrations')
    }

    return next

}


module.exports = {
    loadLocalMigrations,
    matchMigrations
}