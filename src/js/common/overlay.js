var overlayModule = angular.module('aio.overlay', []);

overlayModule.directive('aioOverlay',[function(){
    return {
        scope : {
            overlayOptions : "="
        },
        link : function(scope, element, attrs){

            var $overlay = element;

            scope.$watch('overlayOptions', function(newVal){
                if(!newVal || !newVal.name){
                    hide();
                }else{
                    scope.templateURL = newVal.name + '.html';
                    setTimeout(show, 0);
                }
            });


            var hide = function(done){
                $overlay.removeClass('showed');
                $('#wrapper').removeClass('blurred');
                $overlay.removeClass('enlarged');
                setTimeout(function(){
                    scope.templateURL = '';
                    scope.overlayOptions = null;
                    done && done();
                },0);
            };
            var show = function(done){
                $overlay.addClass('showed');
                $('#wrapper').addClass('blurred');
                setTimeout(function(){
                    $overlay.addClass('enlarged');
                    setTimeout(function(){
                        done && done();
                    },0);
                },0);
            };

            element.on('click', function(e){
                hide();
            }).on('click','.main', function(e){
                    e.stopPropagation();
                });

            scope.$on('$destroy', function(){
                element.off();
            })
        }
    }
}]);



