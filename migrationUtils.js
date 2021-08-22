
const { readdir } = require('fs/promises')
const path = require('path')
const _ = require('underscore')

// returns an array of filenames within the folder
async function readMigrationFiles (migrationsFolder) {

    try {
        return await readdir(migrationsFolder)
    }
    catch (err) {
        console.error(`Could not find migrations folder: ${migrationsFolder}`)
        throw new Error(err)
    }

}

/*
parse filenames into array 
[{ 
    version:    Number,
    name:       String,
    filename:   String,
    path:       String
}]
*/
function parseMigrations (folder, filenames) {

    let regex = /^(?<version>\d+)-(?<name>.*)\.js$/

    function parse(fn) {

        const match = fn.match(regex)

        if (match === null) {
            console.error(`Migration filename is not formatted correctly: ${fn}`)
            throw new Error(`Invalid migration`)
        }

        return {
            version: Number(match.groups.version),
            name: match.groups.name,
            filename: fn,
            path: path.join(folder, fn)
        }

    }

    function compVersions (a, b) {
        return a.version - b.version
    }

    return filenames
        .map(parse)
        .sort(compVersions)

}

async function getMigrations (folder) {
    const files = await readMigrationFiles(folder)
    const migrations = parseMigrations(folder, files)
    return migrations
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

function processMigration (migration) {

    return async config => {

        await runMigration({
            filePath: migration.path,
            spaceId: config.spaceId,
            accessToken: config.accessToken,
            environmentId: config.environmentId,
            yes: true
        })

    }

}


function runMigrations(currentVersion, migrations) {

    migrations
        .filter(m => m.version > currentVersion)
        .forEach(m => {

            runMigrations({
                filePath: m.path,
                spaceId: spaceId,
                accessToken: accessToken,
                environmentId: environmentId,
                yes: true
            })

        })
}

module.exports = {
    getMigrations,
    matchMigrations
}