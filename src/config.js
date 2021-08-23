
class Config {

    constructor () {
        this.accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
        this.spaceId = process.env.CONTENTFUL_SPACE_ID
    }

}

module.exports = new Config()