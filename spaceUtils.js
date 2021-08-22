

function assertAliasExists (aliasId) {

    return async space => {

        const aliases = await space.getEnvironmentAliases()
        const alias = aliases.items.find(d => d.sys.id === aliasId)

        if (!alias) {
            throw new Error(`The space does not have alias: ${aliasId}`)
        }

    }

}

function realias (aliasId, envId) {

    return async space => {

        const alias = await space.getEnvironmentAlias(aliasId)
        alias.environment.sys.id = envId
        await alias.update()

    }

}

function checkEnvironmentExists (envId) {

    return async space => {
        const response = await space.getEnvironments()
        const env = response.items.find(item => item.sys.id === envId)
        return Boolean(env)
    }

}

function cloneEnvironment (envId) {

    const delay = 1000

    function pause() {
        return new Promise(resolve => setTimeout(resolve, delay))
    }

    async function wait (space) {

        const env = await space.getEnvironment(envId)
        const status = env.sys.status.sys.id
        console.log(status)

        if (status === 'inProgress' || status === 'queued') {
            await pause()
            return wait(space)
        }
        else if (status === 'ready') {
            return env
        }
        else {
            throw new Error(`Unrecognized status while cloning environment: ${status}`)
        }

    }

    return async space => {

        console.log('Creating new environment ...')
        const env = await space.createEnvironmentWithId(envId, { name: envId })
        await wait(space)
        return env

    }

}


module.exports = {
    assertAliasExists,
    checkEnvironmentExists,
    cloneEnvironment,
    realias
}