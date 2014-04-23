Gamestab
--------------------------

## Installation

1. Clone repo.
2. Run `npm install && bower install`.
3. You will need `Gulp` installed globally. Do this by: `npm i gulp -g`.
4. run `gulp` and start developing.
5. App is built into the `build` directory, and also changes are watched.

## Path Structure

- Structure :
    - `src/`
        - `js/`
            - `js/common/`   : common utilities, services, directives
            - `js/launcher/` : main launcher business-logic, controllers, directives, everything related to apps
            - `js/search/`   : search box logic including auto complete
            - `js/settings/` : setup, config, settings logics, including appearance, customization of the UI and remote update
            - `js/vendor/`   : modified 3rd party libs
        - `bower_components/`
        - `jade/`
        - `less/`
    - `build/` : development deployment directory
    - `dist/` : production deployment directory
    - `assets/` - all app non-src assets
    - `node_modules/`
    - `gulp/` : gulp related tasks
    - `workspace/` : random non-production things
    - `test/` : app-level js files

## Start a developing flow

Run `gulp`. Load up the extension from the `build/` directory. This also watches files for changes.

## Build a production version

Run: `gulp deploy`. This will output a minified & concated version.

## Bump versions

Run `gulp bump` in order to bump versions of the app in both `manifest.json, bower.json and package.json`.

## Loading extension

After building extension (using `gulp`) load the `build` directory in your Chrome Extensions page.
Extension should automatically load itself, and run when you open a newtab.

## White-Labels

White labels are copies of the `master` branch to `white-labels/#{gameName}`. They are kept up to date with `master` and
they differ by minor changes:
1. They only point to a single JSON file of a partner to load, and don't go through the whole loop of finding a matching partner.
2. Differences in `redirectUrl` and several other options.

In order to understand the difference between a `white-label` and `master` run:
```bash
git diff white-label/kitzimitzi master --stat
```

That will list the differences in files and you can go through them.

#### Q: How are white-label branches kept up to date?

**A:** By cherry picking changes in master to each one of them. You can try `git checkout white-label/kitzimitzi && git checkout master -p`
to apply changes as a patch from `master` to the `white-label` branch.
