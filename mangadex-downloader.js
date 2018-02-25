// ==UserScript==
// @name         MangaDex Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A userscript to add download-buttons to mangadex
// @author       icelord
// @homepage     https://github.com/xicelord/mangadex-scripts
// @updateURL    https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-downloader.js
// @downloadURL  https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-downloader.js
// @match        https://mangadex.com/manga/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip-utils/0.0.2/jszip-utils.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Inject download-buttons
    $('tr[id^="chapter_"]').find('td:first').each((i, element) => {
        let id = $(element).find('a')[0].href.split('/').pop();
        $('<span title="Download" id="dl-' + id + '" class="fas fa-download" style="color: rgb(102, 102, 102); cursor: pointer; margin: 0px 5px;"></span>').prependTo(element);
        document.getElementById('dl-' + id).addEventListener('click', () => { downloadChapter($(element).find('a')[0].href); }, false);
    });

    //Function to download a chapter (called by download-buttons)
    function downloadChapter(url) {
        //Inject progressbar
        let id = url.split('/').pop();
        $('<div id="progress-out-' + id + '" style="width: 100%; margin-bottom: 2px; background-color: grey;"><div id="progress-in-' + id + '" style="width: 0%; height: 5px; background-color: green;"></div></div>').insertBefore($('#dl-' + id));

        getPageUrls(url, (err, page_urls) => {
            if (err) {
                alert('The page-urls could not be fetched. Check the console for more details.');
                console.log(err);
            } else {
                //Fetch all pages using JSZip
                let zip = new JSZip();
                let zipFilename = "download.zip";
                let page_count = page_urls.length;
                let active_downloads = 0;
                let failed = false;

                let interval = setInterval(() => {
                    if (active_downloads < 3 && page_urls.length > 0) {
                        let to_download = page_urls.shift();

                        active_downloads++;
                        JSZipUtils.getBinaryContent(to_download, function (err, data) {
                            if (!err) {
                                zip.file('x' + pad(to_download.split('/').pop().split('.').shift().substr(1), 5) + '.' + to_download.split('.').pop(), data, { binary: true });
                                if (!failed) { setProgress(id, ((page_count -page_urls.length) /page_count) * 100); }
                                active_downloads--;
                            } else {
                                alert('A page-download failed. Check the console for more details.');
                                console.log(err);
                                clearInterval(interval);
                                setProgress(id, -1);
                            }
                        });
                    } else if (active_downloads === 0 && page_urls.length === 0) {
                        clearInterval(interval);
                        zip.generateAsync({ type: "blob" }).then((zipFile) => {
                            saveAs(zipFile, zipFilename);
                            setProgress(id, -1);
                        });
                    }
                }, 500);
            }
        });
    }

    //Get all page-urls of chapter
    function getPageUrls(url, cb) {
        $.get(url, (data) => {
            try {
                let server = data.match(/var server = \'(.+)\';/)[1];
                let dataurl = data.match(/var dataurl = \'(.+)\';/)[1];

                let str_page_array = data.match(/var page_array = \[\r\n(.+)\];/)[1];
                if (str_page_array.endsWith(',')) { str_page_array = str_page_array.slice(0,-1); }
                str_page_array = replaceAll(str_page_array, '\'', '"');
                let page_array = JSON.parse('[' + str_page_array + ']');

                let urls = [];
                if (Array.isArray(page_array)) {
                    for (let i = 0; i < page_array.length; i++) {
                        urls.push(server + dataurl + '/' + page_array[i]);
                    }
                }

                cb(null, urls);
            } catch (ex) {
                cb(ex, null);
            }
        }).fail((jqXHR, textStatus, error) => {
            cb({ textStatus: textStatus, error: error }, null);
        });
    }

    //Set progress of download for id
    function setProgress(id, progress) {
        if (progress !== -1) {
            $('#progress-in-' + id).width(progress + '%');
        } else {
            $('#progress-in-' + id).remove();
        }
    }

    //Helper-functions
    function replaceAll(str, search, replacement) {
        return str.split(search).join(replacement);
    }
    function pad(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
})();
