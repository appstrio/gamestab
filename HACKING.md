# Hacking

## Code Organization

- **Libraries**:
    1. install via `bower` with `--save` flag.
    2. Add to the copy:libs task in Gruntfile.

- **Assets** : Images, Everything that needs to be copied into *build*.
- **Extra**  : Asseta for multiple-build version deployment
- **BOWER**  : Bower libs & components
- **Source** : JS code, templates, etc. Also copied after each modification into *build*.
- **builds** : build directories, each containing an extension with variations.
- **buiid**  : contains the current build.

## Conventions
- Services:
    - No callbacks project. Only promises. Anything that can fail should use promises, never fail silently or use a callback.
    - All promises go into variables, even if not used -> they will be.
    - Any async service should have local initting defer and should return the initting promise

## App Structure - Modularized File Organization
- Structure :
    - jade/ : app-level jade files
        - jade/templates/ : sub-templates for different angular components
    - js/ : app-level js files
        - js/common/ : common utilities, services, directives
        - js/launcher/ : main launcher business-logic, controllers, directives, everything related to apps
        - js/search/ : search box logic including auto complete
        - js/settings/ : setup, config, settings logics, including appearance, customization of the UI and remote update
        - js/vendor/ : modified 3rd party libs
    - less/ : less files to be compiled to css
    - less/import/ : less files to be included in the compiled less files.

## Libs and Common Components

## Setup Process
- Setup Service
    - Run startSetup() : return setup promise
    - Run Config Setup
    - Download partners.json
    - Run decidePartner()
        - Run history check for each partner, look for the install_url_snippit in the chrome.history
            - Found partner
                - Download partner_config_XXX.json
            - Didn't find partner : run generic setup
    - Create config object based on defaults + partner config
    - Store config
    - Set default background image
    - Run Apps Config
    - Finish Setup

## JSON Files Schemas
- partners.json
    [
        {
            "partner_id" : "",
            "partner_install_url_snippit" : "XXX",
            "partner_config_json_url" : ""
        }
        ...
    ]
- partner_config_XXX.json
    {
        "partner_id" : "XXX",
        "partner_name" : "XXX",
        "partner_website_url" : "XXX",
        "partner_logo" : "XXX",
        "default_background_url" : "XXX",
        "web_apps_db" : [WEB_APP_SCHEMA],
        "user_preferences": {
            "show_search_box" : TRUE|FALSE
        },
        "config_update_url" : "XXX"
    }
- web_apps_db.json
    [
        {
            "title" : "XXX",
            "url" : "XXX",
            "icon" : "XXX",
            "default" : ["ALL"||COUNTRY_CC],
            "tags" : ["XXX","XXX"],
            "owner_partner_id" : "XXX" | OPTIONAL
            "overlay" : "XXX" | OPTIONAL
        }
        ...
    ]


