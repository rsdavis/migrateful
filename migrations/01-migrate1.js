
module.exports = function (migration) {

    const post = migration.createContentType('post')
        .name('Post')
        .description('Blog post')

    post.createField('title')
        .name('Title')
        .type('Symbol')
        .required(true)

    post.createField('slug')
        .name('Slug')
        .type('Symbol')
        .required(true)

    post.createField('description')
        .name('Description')
        .type('Text')
        .required(true)

    post.createField('body')
        .name('Body')
        .type('Text')
        .required(true)

    post.createField('published')
        .name('Published')
        .type('Date')
        .required(false)

}