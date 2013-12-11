//Run in console on each page
var arr2 = [];
$('.entry a').each(function(i, e) {
    $this = $(this);
    arr2.push({
        url   : e.href,
        imgurl: $this.find('img').attr('src'),
        title : $this.find('.text').html()
    });
});
$.extend(arr,arr2);
