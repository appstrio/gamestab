define(function env() {
    return {
        type: "production",
        force: {
            loadConfigFromFile: true,
            booster: true,
        },
        debug: true
    };
});
