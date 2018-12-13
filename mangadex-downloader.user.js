// ==UserScript==
// @name         MangaDex Downloader
// @version      0.18
// @description  A userscript to add download-buttons to mangadex
// @author       icelord
// @homepage     https://github.com/xicelord/mangadex-scripts
// @updateURL    https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-downloader.user.js
// @match        https://mangadex.org/settings
// @match        https://www.mangadex.org/settings
// @match        https://mangadex.org/title/*
// @match        https://www.mangadex.org/title/*
// @icon         https://mangadex.org/favicon.ico
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

(function() {
    'use strict';

    //Required to retrieve iso_codes
    let language_iso = {
        'Arabic': 'ara',
        'Bengali': 'ben',
        'Bulgarian': 'bul',
        'Catalan': 'cat',
        'Chinese': 'chi',
        'Czech': 'cze',
        'Danish': 'dan',
        'Dutch': 'dut',
        'English': 'eng',
        'Filipino': 'fil',
        'Finnish': 'fin',
        'French': 'fre',
        'German': 'ger',
        'Greek': 'gre',
        'Hungarian': 'hun',
        'Indonesian': 'ind',
        'Italian': 'ita',
        'Japanese': 'jpn',
        'Korean': 'kor',
        'Malaysian': 'may',
        'Mongolian': 'mon',
        'Persian': 'per',
        'Polish': 'pol',
        'Portuguese (Brazil)': 'por',
        'Portuguese (Portugal)': 'por',
        'Romanian': 'rum',
        'Russian': 'rus',
        'Serbo-Croatian': 'hrv',
        'Spanish (LATAM)': 'spa',
        'Spanish (Spain)': 'spa',
        'Swedish': 'swe',
        'Thai': 'tha',
        'Turkish': 'tur',
        'Vietnamese': 'vie'
      };

    //Settings or download
    if (document.URL === 'https://mangadex.org/settings') {
      //Add tab
      $('.nav-item').last().after('<li class="nav-item">' +
                                    '<a class="nav-link" href="#download_settings" aria-controls="download_settings" data-toggle="tab">' +
                                        '<span class="fas fa-download fa-fw" aria-hidden="true"></span>' +
                                        '<span class="d-none d-lg-inline"> Downloads</span>' +
                                    '</a>' +
                                  '</li>');

      //Add options
      $('#supporter_settings').after('<div role="tabpanel" class="tab-pane fade" id="download_settings">' +
                                    '<div class="form-horizontal">' +
                                      '<div class="form-group row">' +
                                        '<label for="file-extension" class="col-sm-3 control-label">Extension:</label>' +
                                        '<div class="col-sm-9">' +
                                          '<select class="form-control selectpicker" id="file-extension">' +
                                            '<option ' + (((localStorage.getItem("file-extension") || '.zip') === '.zip' ) ? 'selected ' : '') + 'value=".zip">.zip</option>' +
                                            '<option ' + (((localStorage.getItem("file-extension") || '.zip') === '.cbz' ) ? 'selected ' : '') + 'value=".cbz">.cbz</option>' +
                                          '</select>' +
                                        '</div>' +
                                      '</div>' +
                                      '<div class="form-group row">' +
                                        '<label for="chapter-info" class="col-sm-3 control-label">Save release info:</label>' +
                                        '<div class="col-sm-9">' +
                                          '<select class="form-control selectpicker" id="chapter-info">' +
                                            '<option ' + ((localStorage.getItem("chapter-info") === '0' ) ? 'selected ' : '') + 'value="0">Disabled</option>' +
                                            '<option ' + ((localStorage.getItem("chapter-info") === '1' ) ? 'selected ' : '') + 'value="1">Text file</option>' +
                                            '<option ' + ((localStorage.getItem("chapter-info") === '2' ) ? 'selected ' : '') + 'value="2">JSON</option>' +
                                          '</select>' +
                                        '</div>' +
                                      '</div>' +
                                      '<div class="form-group row">' +
                                        '<label for="parallel-downloads" class="col-sm-3 control-label">Parallel Downloads:</label>' +
                                        '<div class="col-sm-9">' +
                                          '<input type="numbers" class="form-control" id="parallel-downloads" value="' + (localStorage.getItem("parallel-downloads") || 3) + '" />' +
                                        '</div>' +
                                      '</div>' +
                                      '<div class="form-group row">' +
                                        '<div class="col-sm-offset-3 col-sm-9">' +
                                          '<button type="submit" class="btn btn-default" id="save_downloader_settings"><span class="fas fa-save fa-fw" aria-hidden="true"></span> Save</button>' +
                                        '</div>' +
                                      '</div>' +
                                    '</div>' +
                                  '</div>');

      //Add handler to save options
      document.getElementById('save_downloader_settings').addEventListener('click', () => {
        localStorage.setItem('file-extension', document.getElementById('file-extension').value);
        localStorage.setItem('parallel-downloads', parseInt(document.getElementById('parallel-downloads').value));
        localStorage.setItem('chapter-info', document.getElementById('chapter-info').value);
        alert('Updated settings!');
      }, false);
      return;
    }

    //Inject download-buttons
    $('div.chapter-row').find('div.order-lg-2').each((i, element) => {
      if (i === 0) return;

      let id = $(element).find('a')[0].href.split('/').pop();

      $('<span title="Download" id="dl-' + id + '" class="fas fa-download" style="color: rgb(102, 102, 102); cursor: pointer; margin: 0px 5px;"></span>').prependTo(element);
      document.getElementById('dl-' + id).addEventListener('click', () => { downloadChapter(id); }, false);
    });


    //Function to download a chapter (called by download-buttons)
    function downloadChapter(id) {
      //Inject progressbar
      $(
        '<div id="progress-out-' + id + '" style="width: 50px; margin-bottom: 2px; background-color: grey;">' +
          '<div id="progress-in-' + id + '" style="width: 0%; height: 7px; background-color: green;">' +
          '</div>' +
        '</div>').insertBefore($('#dl-' + id));

      //Fetch page-urls and download them
      getChapterData(id, (err, chapter_data) => {
        if (err) {
          alert('The page-urls could not be fetched. Check the console for more details.');
          setProgress(id, -1);
          console.error(err);
        } else {
          //Prepare
          let link = $('a[href="/chapter/' + id + '"]');
          const chapterInfo = {
            manga: $("h6.card-header").contents().not($("h6.card-header").children()).text().trim(),
            altnames: $('.fa-book').map((i, book) => {
                if (i > 2)
                    return $(book).parent().text().trim();
            }).get(),
            link: 'https://mangadex.org/chapter/' + chapter_data.id,
            chapter: chapter_data.chapter,
            volume: chapter_data.volume || null,
            title: chapter_data.title,
            groups: link.parent().parent().find('div:nth-child(7) > a').map((i, group) => {
                return group.innerText;
            }).get(),
            genres: $('.genre').map((i, genre) => {
                return genre.text;
            }).get(),
            uploader: {
              id: parseInt(link.parent().parent().find('div:nth-child(8) > a').attr('href').replace(/\/user\//, '')),
              username: link.parent().parent().find('div:nth-child(8)').text().trim()
            },
            posted: new Date(chapter_data.timestamp * 1000),
            language: chapter_data.lang_name,
            translated: (chapter_data.lang_name !== $('h6 > img').attr('title')),
            images: chapter_data.page_array.map(function(filename) {
                return chapter_data.server + chapter_data.hash + '/' + filename;
            })
          };

          //Fetch all pages using JSZip
          let zip = new JSZip();
          let zipFilename =
            chapterInfo.manga +
            (chapterInfo.language == "English" ? "" : " [" + language_iso[chapterInfo.language] + "]") +
            " - c" + (chapterInfo.chapter < 100 ? chapterInfo.chapter < 10 ? '00' + chapterInfo.chapter : '0' + chapterInfo.chapter : chapterInfo.chapter) +
            (chapterInfo.volume ? " (v" + (chapterInfo.volume < 10 ? '0' + chapterInfo.volume : chapterInfo.volume) + ")" : "") +
            " [" + chapterInfo.groups + "]" +
            (localStorage.getItem("file-extension") || '.zip');
          let page_count = chapterInfo.images.length;
          let active_downloads = 0;
          let failed = false;

          //Build metadata-file based on setting
          if (localStorage.getItem("chapter-info") == '1') {
            let textFile = '';
            textFile += chapterInfo.manga + '\n';
            textFile += chapterInfo.altnames.join(', ') + '\n';
            textFile += chapterInfo.link + '\n\n';
            textFile += 'Chapter: ' + chapterInfo.chapter + '\n';
            textFile += 'Volume: ' + (chapterInfo.volume !== null ? chapterInfo.volume : 'Unknown') + '\n';
            textFile += 'Title: ' + chapterInfo.title + '\n';
            textFile += 'Groups: ' + chapterInfo.groups + '\n';
            textFile += 'Genres: ' + chapterInfo.genres.join(', ') + '\n';
            textFile += 'Uploader: ' + chapterInfo.uploader.username + ' (ID: ' + chapterInfo.uploader.id + ')\n';
            textFile += 'Posted: ' + chapterInfo.posted + '\n';
            textFile += 'Language: ' + chapterInfo.language + (chapterInfo.translated ? ' (TL) \n' : '\n');
            textFile += 'Length: ' + chapterInfo.images.length + '\n\n';
            chapterInfo.images.forEach((image, i) => {
              textFile += 'Image ' + (i +1) + ': ' + image + '\n';
            });
            textFile += '\n\nDownloaded at ' + (new Date()) + '\n';
            textFile += 'Generated by MangaDex Downloader. https://github.com/xicelord/mangadex-scripts';

            zip.file('info.txt', textFile.replace(/\n/gi, '\r\n'));
          } else if (localStorage.getItem("chapter-info") == '2') {
            zip.file('info.json', JSON.stringify(chapterInfo, null, 4));
          }

          let page_urls = chapterInfo.images;
          let interval = setInterval(() => {
            if (active_downloads < (localStorage.getItem("parallel-downloads") || 3) && page_urls.length > 0) {
              let to_download = page_urls.shift();
              let current_page = page_count - page_urls.length;
              let page_filename =
                (chapterInfo.manga +
                (chapterInfo.language == "English" ? "" : " [" + language_iso[chapterInfo.language] + "]") +
                " - c" + (chapterInfo.chapter < 100 ? chapterInfo.chapter < 10 ? '00' + chapterInfo.chapter : '0' + chapterInfo.chapter : chapterInfo.chapter) +
                (chapterInfo.volume ? " (v" + (chapterInfo.volume < 10 ? '0' + chapterInfo.volume : chapterInfo.volume) + ")" : "") +
                " - p" + (current_page < 100 ? current_page < 10 ? '00' + current_page : '0' + current_page : current_page) +
                " [" + chapterInfo.groups + "]" +
                '.' + to_download.split('.').pop())
                .replace(/[\/\?<>\\:\*\|":\x00-\x1f\x80-\x9f]/gi, '_')


              active_downloads++;
              GM_xmlhttpRequest({
                method:   'GET',
                url:      to_download,
                responseType: 'arraybuffer',
                onload:   function (data) {
                  zip.file(page_filename, data.response, { binary: true });
                  if (!failed) { setProgress(id, ((page_count -page_urls.length) /page_count) * 100); }
                  active_downloads--;
                },
                onerror:  function (data) {
                  alert('A page-download failed. Check the console for more details.');
                  console.error(data);
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
    function getChapterData(id, cb) {
      $.get('https://mangadex.org/api/?id=' + id + '&type=chapter', (chapter_data) => {
        cb(null, chapter_data);
      }).fail((jqXHR, textStatus, error) => {
        cb({ textStatus: textStatus, error: error }, null);
      });
    }

    //Set progress of download for id
    function setProgress(id, progress) {
      if (progress !== -1) {
        $('#progress-in-' + id).width(progress + '%');
      } else {
        $('#progress-out-' + id).remove();
      }
    }
  })();
