(function(){
    setTimeout(function(){window.open('', '_self', ''); window.close();},10000);

    window.onbeforeunload=function(e){
        e.preventDefault();
        e.stopPropagation();
    };
})()
