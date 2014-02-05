# Hacking

## Code Organization

- **Libraries**:
    1. install via `bower` with `--save` flag.
    2. Add to the copy:libs task in Gruntfile.

- **Assets** : Images, Everything that needs to be copied into *build*.
- **Source** : JS code, templates, etc. Also copied after each modification into *build*.
- **builds** : build directories, each containing an extension with variations.
- **buiid**  : contains the current build.

## Conventions
- Services:
    - Any async service should have local initting defer and should return the initting promise
