Gamestab
--------------------------

## First Installation

1. Clone repo.
2. Run `npm install`.
3. Run `bower install`.
4. You will need `Gulp` installed globally. Do this by: `npm i gulp -g`.
5. run `gulp` and start developing.
6. App is built into the `build` directory, and also changes are watched.

## Path Structure

- Structure :
    - `src/`
        - `js/`
            - `js/common/` : common utilities, services, directives
            - `js/launcher/` : main launcher business-logic, controllers, directives, everything related to apps
            - `js/search/` : search box logic including auto complete
            - `js/settings/` : setup, config, settings logics, including appearance, customization of the UI and remote update
            - `js/vendor/` : modified 3rd party libs
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

Simply run `gulp` and and a development version will be built in the `build/` folder, and a watch for dev files will run.

## Build a development version

Run: `gulp build`. This will output a minified & concated version.

## Watch files when in development mode

Run: `gulp watch`. On any change in source files `gulp build` will be exectued.

## Build a production version

Run: `gulp deploy`. This will output a minified & concated version.

## Bumping versions

Run `gulp bump` in order to bump versions of the app in both `manifest.json, bower.json and package.json`.

## Loading extension

After building extension (using `gulp`) load the `build` directory in your Chrome Extensions page.
Extension should automatically load itself, and run when you open a newtab.
