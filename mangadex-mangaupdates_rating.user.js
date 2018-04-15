// ==UserScript==
// @name         MU-Rating for MangaDex
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show the rating of mangaupdates on mangadex
// @author       icelord
// @match        https://mangadex.org/manga/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Get MU-url
    let mu_url = $('a[href*="www.mangaupdates.com/series.html?id="]');

    // Ignore if no url specified
    if (mu_url.length === 1) {
        //Fetch data from mu
        GM_xmlhttpRequest({
            method:   'GET',
            url:      mu_url[0].href,
            responseType: 'text',
            onload:   function (data) {
                // Inject into page
                $('<br><br>MangaUpdates:<br>').appendTo($('th:contains("Rating:")').parent().children()[1]);
                $(data.response).find('div.sContent:contains("Bayesian Average: ")').appendTo($('th:contains("Rating:")').parent().children()[1]);
            },
            onerror:  function (data) {
                // Log error
                console.log('Fetching the data from mangaupdates failed');
                console.log(data);
            }
        });
    }
})();
