
module.exports = function (migration) {

    migration.createContentType('newType2')
        .name('NewType')
        .description('My new type')

}