define(['jquery','renderer'], function dialsProviderTopsites ($,renderer) {
    var deferred = new $.Deferred(),
        self = {
            ignored: []
        };

    self.provide = function () {
        var deferred = new $.Deferred(),
            deferredTopsites = new $.Deferred();
        deferredTopsites.then(function createDials (topsites) {
            var dials = [];
            for (var i = topsites.length - 1; i >= 0; i--) {
                var topsiteObject = topsites[i];
                dials[i] = {
                        url   : topsiteObject.url,
                        title : topsiteObject.title
                    };
                log(dials[i]);
            };
            deferred.resolve(dials);
        }).fail(deferred.fail);

        //Filter out ignoredDials
        // var diffArr = _.reject(_topsites, function(site) {
        //         if (_.findWhere(self.topsites, {
        //             url: site.url
        //         })) return true;
        //         if (self.ignoreList.indexOf(site.url) > -1) return true;
        //         return false;
        //     });

        chrome.topsites.get(deferredTopsites.resolve);
        return deferred;
    };

    self.dialClickHandler = function (e) {
        // e.stopPropagation();
        // var $target = $(e.currentTarget);
        // var url = $target.data('url');

        // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
        //     window.location.href = url;
        // });

        // setTimeout(function () {
        //     window.location.href = url;
        // }, 500);
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
        // e.stopPropagation();
        // e.preventDefault();
        // var $target = $(e.currentTarget);
        // var id = $target.data('id');
        // chrome.management.launchApp(id, function () {
        // });
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
})