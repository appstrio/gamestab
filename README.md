WINT (White Label New Tab)
--------------------------

## First Installation

1. Clone repo.
2. Run `npm preinstall` which will bootstrap everything.
3. Load unpacked extension, at `build`.
4. Run `npm start`.
5. Start developing, while grunt compiles your changes on the fly with `watch`.

## Reinstallation

1. Just run `npm start`.

## Includes

An include is a `lib`.
**New include?** add it in the relevant array in the Gruntfile.

## File Structure

WINT is quite complex in matter of files and directories. It has to be verstaile enough to build multiple variations of extensions, yet be slim to be quickly build and developed upon.

1. **Assets** : Images, Everything that needs to be copied into *build*.
2. **Source** : JS code, templates, etc. Also copied after each modification into *build*.
3. **builds** : *will* contain directories, each containing an extension with variations.
4. **buiid**  : contains the current build.


## WINT Booting process

1. Load only the modules and files that are required to decide if we should use the booster (Env, Config etc etc)
2. Decide if we should use the Booster
3. Load the Runtime module
4. Load the rest of the modules
5. Render the UI


## WINT ASYNC Modules Conventions

1. Each async module should have the async_ prefix
2. Each async module should have 'private' defer for the initialization process called 'initting'.
3. Each async module should have async_module.promise object that will be resolved when the module is'ready'
4. Modules that are dependant on other async modules, should specify the module in the define function and
   to init only after listening to the async_module.promise.then(...)
