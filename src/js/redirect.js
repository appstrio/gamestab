//just redirect to target site
if (document.location.href !== "http://s3.amazonaws.com/Gamestab/web-version/dev.html") {
    document.location.href = "http://s3.amazonaws.com/Gamestab/web-version/dev.html?id=" + chrome.runtime.id;
}
