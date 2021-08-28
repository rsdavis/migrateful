
module.exports = function (migration) {

    migration.createContentType('newType')
        .name('NewType')
        .description('My new type')

}