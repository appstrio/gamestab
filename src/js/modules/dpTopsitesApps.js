define(['jquery'], function dialsProviderTopsitesAndApps ($) {
    var deferred = new $.Deferred(),
        self = {
            ignored: []
        };

    self.provide = function (type) {
        var def = new $.Deferred(),
            innerDef = new $.Deferred(),
            createAppsDials = function createAppsDials (apps) {
                var dials = [];
                for (var i = 0; i < apps.length; i++) {
                    var app = apps[i];
                    log(app);

                    if(isApp(app))
                        dials.push({
                            id     : app.id,
                            name   : app.shortName,
                            icon   : app.icons.last().url,
                            description: app.description,
                            click  : self.appClickHandler,
                            remove : self.appRemoveClickHandler
                        });
                };
                def.resolve(dials);
            },
            createTopsitesDials = function createTopsitesDials (topsites) {
                var dials = [];
                for (var i = topsites.length - 1; i >= 0; i--) {
                    var topsiteObject = topsites[i];
                    dials[i] = {
                            url    : topsiteObject.url,
                            title  : topsiteObject.title,
                            click  : self.dialClickHandler,
                            remove : self.dialRemoveClickHandler
                        };
                };
                def.resolve(dials);
            },
            method = type === "apps" ? createAppsDials : createTopsitesDials;
        if(type === "apps")
            chrome.management.getAll(innerDef.resolve);
        else
            chrome.topSites.get(innerDef.resolve);
        innerDef.then(method).fail(def.fail);

        //Filter out ignoredDials
        // var diffArr = _.reject(_topsites, function(site) {
        //         if (_.findWhere(self.topsites, {
        //             url: site.url
        //         })) return true;
        //         if (self.ignoreList.indexOf(site.url) > -1) return true;
        //         return false;
        //     });

        return def;
    };

    self.dialClickHandler = function (e) {
        e.stopPropagation();
        var $target = $(e.currentTarget);
        var url = $target.data('url');

        // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
        //     window.location.href = url;
        // });

        setTimeout(function () {
            window.location.href = url;
        }, 500);
    };

    self.dialRemoveClickHandler = function (e) {
        // e.stopPropagation();
        // e.preventDefault();
        // var $target = $(e.currentTarget).parents('.dial').eq(0);
        // $target.fadeOut(function () {
        //     self.topsites.getAndAddNewDial(function (err, newDial) {
        //         if (newDial) {
        //             _.defer(function () {
        //                 self.renderDial(newDial);
        //             });

        //         }
        //     });
        // });
        // self.topsites.addToIgnored($target.data('url'));
    };

    self.appClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget);
        var id = $target.data('id');
        chrome.management.launchApp(id, function () {
        });
    };

    self.appRemoveClickHandler = function (e) {
        // e.stopPropagation();
        // e.preventDefault();
        // var $target = $(e.currentTarget).parents('.app').eq(0);
        // var id = $target.data('id');
        // chrome.management.uninstall(id, {showConfirmDialog: true}, function () {
        //     chrome.management.getAll(function (apps) {
        //         apps = apps || [];
        //         var found = _.findWhere(apps, {id: id});
        //         if (!found) {
        //             $target.fadeOut();
        //         }
        //     });

        // });
    };

    // self.init = (function initdialsProvider_Topsites () {

    // })();

    return self;
});
var isApp = function isApp (ExtensionInfo) {
    return ExtensionInfo.type === 'hosted_app' || ExtensionInfo.type === 'packaged_app' || ExtensionInfo.type === 'legacy_packaged_app';
}