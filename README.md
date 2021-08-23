# Migrateful

Migrateful is a migration manager for the Contentful platform. 

Contentful has Javascript SDK's for managing content `contentful-management` and running migrations `contentful-migration`. 
However, these are somewhat low-level and still require the user to either run migrations by hand or manage your own versioning system.

Migrateful gives you migration versioning out-of-the-box for production and development environments.
Maintain your CMS infrastructure as code, with a complete and reproducable history of your data type creations and transformations. 
Test your migrations in a dev environment before applying them to your production space.

## Setup the space

There are a few things you need to do to prepare your contentful space.

* Create an empty Space
    * `Settings -> General settings -> Copy SpaceId`

* Create a personal access token
    * Copy the token

* Opt into the master alias
    * `Settings -> Environments -> Set up your first alias`
    * It will ask to rename the master environment ... say yes


## Usage

```
npm install --save-dev migrateful
```

Put all of your contentful migration files in a folder called `migrations`. 

```
npx migrateful master
```