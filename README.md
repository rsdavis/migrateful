# Migrateful

Migrateful is a migration manager for the Contentful platform. 

* Represent your data schemas in code
* Automatically pick up and apply migration scripts
* Version releases for easy rollback
* Separate environments for prod, dev, and features
* No installation necessary

## Motivation

Contentful has nice SDK's in place for cloning environments and running migrations scripts.
However, these are somewhat low-level.
You can either run each migration script by hand or create your own versioning system.

Migrateful gives you a complete migration system out of the box.
It is designed based on [Contentful's scripting guide](https://www.contentful.com/developers/docs/tutorials/cli/scripting-migrations/) with a few more conveniences built in.
Just create a new Contentful space, drop in your migration scripts, and run `npx migrateful`.

## Setup the space

You will need the `SpaceID` and a personal access token

* Create an empty Space
    * Go to `Organization settings` &rightarrow; `Add space`
    * Name your space and select `Empty space`
    * In the new space, go to `Settings` &rightarrow; `General settings`
    * Copy the `Space ID`

* Create a personal access token
    * Go to `Settings` &rightarrow; `API keys` &rightarrow; `Content management tokens`
    * Click `Generate personal token`
    * Name the token and copy the key

* Opt into the master alias
    * Go to `Settings` &rightarrow; `Environments`
    * Click `Set up your first alias`
    * It will ask to rename the master environment ... say yes


## Usage

Put all of your contentful migration scripts in a folder called `migrations`. 
Name them using the format `{version}-{name}.js`.
For example, you might have `01-init.js`, `02-add-post-type.js`, `03-add-title-field.js`.

Run the following command, where `<env>` is your environment name.
For your prod environment, this can be either `master` or `main`.
For a dev or feature environment, you can name it whatever your want.
A new environment will be created and the migrations will be applied.

```
npx migrateful <env>
```

Migrateful will read your space ID and access token from the environment.

```
export CONTENTFUL_SPACE_ID=<spaceId>
export CONTENTFUL_ACCESS_TOKEN=<token>
```