var templates = (function(){
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['classic-app']=function anonymous(it) {
var out='<div class="app" data-id="'+(it.id)+'"><a class="inner" href="#"><div class="thumbnail-wrapper" style="background-image:url('+(it.icon)+')"><div class="app-remove-button">x</div></div><div class="name">'+(it.name)+'</div></a></div>';return out;
};
  tmpl['classic-dial']=function anonymous(it) {
var out='<div class="dial" data-url="'+(it.url)+'"><a class="inner" href="'+(it.url)+'">';if(it.screenshot){out+='<div class="thumbnail-wrapper" style="background-image:url('+(it.screenshot)+')"><div class="favicon"><img src="chrome://favicon/'+(it.url)+'"></img></div><div class="dial-remove-button">x</div></div>';}else if(true){out+='<div class="thumbnail-wrapper"><div class="favicon"><img src="chrome://favicon/'+(it.url)+'"></img></div><div class="dial-remove-button">X</div></div>';}out+='<div class="title">'+(it.title)+'</div></a></div>';return out;
};
  tmpl['classic']=function anonymous(it) {
var out='<div class="classic-container"><div class="search-wrapper"></div><div class="top-wrapper"><div class="viewport"><div class="dials-wrapper"></div><div class="apps-wrapper"></div></div></div><div class="bottom-wrapper"><div class="buttons"><a href="#" class="dials-switch selected"> Home </a><a href="#" class="apps-switch"> Apps </a></div></div></div>';return out;
};
  tmpl['item-details']=function anonymous(it) {
var out='<div class="details-wrapper"><div style="direction : '+(it.item.direction)+'" class="title">'+(it.item.title)+'</div><div style="direction : '+(it.item.direction)+'" class="meta"><span style="color : '+(it.color)+'" class="source">'+(it.item.from[0].name)+' &nbsp;</span><span class="time">&nbsp;';item.niceDateout+='</span></div><div class="thumbnail-wrapper"><img src="'+(it.item.image)+'"/></div><div style="direction : '+(it.item.direction)+'" class="content">'+(it.item.content)+'</div><div class="read-more"><a href="'+(it.item.link)+'" target="_blank">READ MORE...</a></div></div>';return out;
};
  tmpl['launcher-app']=function anonymous(it) {
var out='<div class="app launchable" data-id="'+(it.id)+'"><div class="inner"><div style="background-image : url('+(it.icon)+')"  class="thumbnail"></div><div class="title"><span class="app-remove-button remove-button">x</span>'+(it.name)+'</div></div></div>';return out;
};
  tmpl['launcher-dial']=function anonymous(it) {
var out='<div class="dial launchable" data-url="'+(it.url)+'"><div class="inner"><div style="background-image : url('+(it.screenshot)+')"  class="thumbnail screenshot"></div><div class="title"><span class="dial-remove-button remove-button">x</span>'+(it.title)+'</div></div></div>';return out;
};
  tmpl['launcher-wrapper']=function anonymous(it) {
var out='<div id="launcher"><div class="viewport"><div class="inner"></div></div></div>';return out;
};
  tmpl['news-wrapper']=function anonymous(it) {
var out='<div id="news-inner"><div class="loading-wrapper hide"><img src="/img/loader.light.bg.gif"/></div><div style="clear:both;" class="collection-wrapper">';var arr1=it.collection;if(arr1){var item,index=-1,l1=arr1.length-1;while(index<l1){item=arr1[index+=1];out+='<div class="item" data-link="'+(item.link)+'"><div class="inner"><div class="thumbnail-wrapper"><div style="background-image : url('+(item.image)+')" class="thumbnail"></div></div><div class="content-wrapper"><div style="direction : '+(item.direction)+'" class="title">'+(item.title)+'</div><div style="direction : '+(item.direction)+'" class="content">'+(item.shortContent)+'</div><div style="direction : '+(item.direction)+'" class="meta"><span style="color : '+(item.color)+'" class="source">'+(item.from[0].name)+' &nbsp;</span><span class="time">&nbsp;'+(item.niceDate)+'</span></div><div class="read-more"><a href="'+(item.link)+'" target="_blank">READ MORE...</a></div></div></div></div>';} } out+='</div></div>';return out;
};
  tmpl['search-wrapper']=function anonymous(it) {
var out='<div class="inner"><div class="input-container"><div class="search-icon"></div><input type="text" placeholder="Search the web..."  class="search-input" autocomplete="off"/></div><button class="submit-button btn btn-large">Search</button></div>';return out;
};
  tmpl['title-wrapper']=function anonymous(it) {
var out='<h1 class="title">';if(it.icon){out+='<img src="'+(it.icon)+'" />';}out+='<span class="text">'+(it.title)+'</span><span class="sub-title running-clock"><span class="date"></span><span class="clock"></span></span></h1>';return out;
};
  tmpl['weather-wrapper']=function anonymous(it) {
var out='<div class="loading hide"><img src="/img/loader.gif"/></div><div class="weather">';var arr1=it.days;if(arr1){var day,index=-1,l1=arr1.length-1;while(index<l1){day=arr1[index+=1];out+='<div class="day"><div class="icon">'+(day.icon)+'</div><div class="temp"><span class="min">'+(day.temp.min)+'&nbsp;</span><span class="max">'+(day.temp.min)+'</span></div><div class="title">'+(day.title)+'</div></div>';} } out+='</div>';return out;
};
  tmpl['wrapper']=function anonymous(it) {
var out='<div class="container"><div class="top-wrapper"><div class="search-wrapper"></div><div class="main-wrapper"><div class="title-wrapper"></div><div class="scrollable"><div class="weather-wrapper hide"></div><div class="news-wrapper hide"></div></div></div></div><div class="launcher-wrapper"></div></div>';return out;
};
return tmpl;})()