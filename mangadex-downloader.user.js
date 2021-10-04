// ==UserScript==
// @name         MangaDex Downloader
// @version      1.0
// @description  A userscript to add download-buttons to mangadex
// @author       NO_ob, icelord
// @homepage     https://github.com/xicelord/mangadex-scripts
// @updateURL    https://github.com/NO-ob/mangadex-scripts/raw/master/mangadex-downloader.user.js
// @downloadURL  https://github.com/NO-ob/mangadex-scripts/raw/master/mangadex-downloader.user.js
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
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

    //Required to retrieve iso_codes
    let language_iso = {
      'ar': 'Arabic',
      'bn': 'Bengali',
      'bg': 'Bulgarian',
      'ca': 'ca',
      'zh': 'Chinese',
      'cs': 'Czech',
      'da': 'Danish',
      'nl': 'Dutch',
      'en': 'English',
        'fil': 'Filipino', // idk
        'fi': 'Finnish',
        'fr': 'French',
        'de': 'German',
        'el': 'Greek',
        'hu': 'Hungarian',
        'id': 'Indonesian',
        'it': 'Italian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ms': 'Malaysian',
        'mn': 'Mongolian',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese (Brazil)',
        'Portuguese (Portugal)': 'xdsdsdsd', //idk
        'ro': 'Romanian',
        'ru': 'Russian',
        'sh': 'Serbo-Croatian',
        'Spanish (LATAM)': 'spa', //idk
        'es': 'Spanish (Spain)',
        'sv': 'Swedish',
        'th': 'Thai',
        'tr': 'Thai',
        'vi': 'Vietnamese'
      };

    //Settings or download
    // observe for page to actually load, fuck webapps
    if (document.URL.includes("https://mangadex.org/settings")) {
      (new MutationObserver(addScriptSettings)).observe(document, {childList: true, subtree: true});
    } else if (document.URL.includes("https://mangadex.org/title/")){
      (new MutationObserver(addDownloadButtons)).observe(document, {childList: true, subtree: true});
    }

    function addScriptSettings(changes, observer){
    //Add tab
    if (document.querySelector("div.grid-auto-rows")){
      observer.disconnect();
      let settingsGroup = document.querySelector("div.grid-auto-rows");
      let navBar = document.querySelector("div.static.self-start");
      let newNavItem = document.createElement("div");
      newNavItem.innerHTML = '<div data-v-72573f18="" data-v-13a3d5e6="" class="text-primary cursor-pointer">Download Settings</div>';
      navBar.appendChild(newNavItem);
      navBar.lastChild.addEventListener('click', () => { window.location.href = window.location.href.split("#")[0] + "#dlSettings"; }, false);
      //Add options

      let newSettingsDiv = document.createElement("div");
      newSettingsDiv.innerHTML = '<div id="download_settings" style="margin-top: -96px; padding-top: 96px;">' +
      '<a id="dlSettings"/a>' +
      '<div class="bg-accent-darken2 dark:bg-accent-lighten2 rounded p-4">' +
      '<div data-v-064a2b93="" class="flex justify-between">' +
      '<div data-v-064a2b93="" class="text-lg">Download Settings</div>' +
      '</div>' +

      '<div class="flex md:flex-row flex-col justify-between gap-4 mt-4">' +
      '<div for="file-extension" class="text-sm opacity-80 md:max-w-1/2">File extension of downloaded manga.</div>' +
      '<select class="form-control md:max-w-1/2" id="file-extension">' +
      '<option ' + (((localStorage.getItem("file-extension") || '.zip') === '.zip' ) ? 'selected ' : '') + 'value=".zip">.zip</option>' +
      '<option ' + (((localStorage.getItem("file-extension") || '.zip') === '.cbz' ) ? 'selected ' : '') + 'value=".cbz">.cbz</option>' +
      '</select>' +
      '</div>' +

      '<div class="flex md:flex-row flex-col justify-between gap-4 mt-4">' +
      '<div for="chapter-info" class="text-sm opacity-80 md:max-w-1/2"">Type of release info to pack into the archive.</div>' +
      '<select class="form-control md:max-w-1/2" id="chapter-info">' +
      '<option ' + ((localStorage.getItem("chapter-info") === '0' ) ? 'selected ' : '') + 'value="0">Disabled</option>' +
      '<option ' + ((localStorage.getItem("chapter-info") === '1' ) ? 'selected ' : '') + 'value="1">Text file</option>' +
      '<option ' + ((localStorage.getItem("chapter-info") === '2' ) ? 'selected ' : '') + 'value="2">JSON</option>' +
      '</select>' +
      '</div>' +
      '<div class="flex md:flex-row flex-col justify-between gap-4 mt-4">' +
      '<div for="parallel-downloads" class="text-sm opacity-80 md:max-w-1/2"">Number of parallel downloads.</div>' +
      '<div class="col-sm-9 md:max-w-1/2">' +
      '<input type="numbers" class="form-control" id="parallel-downloads" value="' + (localStorage.getItem("parallel-downloads") || 3) + '" />' +
      '</div>' +
      '</div>' +
      '<div class="flex md:flex-row flex-col justify-between gap-4 mt-4">' +
      '<div for="save-button" class="text-sm opacity-80 md:max-w-1/2">Saves downloader settings.</div>' +
      '<div class="col-sm-offset-3 col-sm-9">' +
      '<button type="submit" class="rounded relative md-btn flex items-center px-3 dark:block hidden justify-center text-white bg-accent hover:bg-accent-darken active:bg-accent-darken2 px-6"'+
      ' id="save_downloader_settings" style="min-height: 48px; min-width: 220px;">' +
      '<span class="flex items-center justify-center font-medium select-none" style="z-index: 1; pointer-events: none;">Save</span>'+
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

      settingsGroup.appendChild(newSettingsDiv);

      //Add handler to save options
      document.getElementById('save_downloader_settings').addEventListener('click', () => {
        localStorage.setItem('file-extension', document.getElementById('file-extension').value);
        localStorage.setItem('parallel-downloads', parseInt(document.getElementById('parallel-downloads').value));
        localStorage.setItem('chapter-info', document.getElementById('chapter-info').value);
        alert('Updated settings!');
      }, false);
    }

  }
  function addDownloadButtons(changes, observer){
    if (document.querySelectorAll("div.flex.chapter").length > 0){
      observer.disconnect();
      console.log("flex chapter length ="+ document.querySelectorAll("div.flex.chapter").length);
    }
    document.querySelectorAll("div.flex.chapter").forEach((chapterRow) => {
      let chapterID = chapterRow.querySelector("div > div > a").href.split('/').pop();
      let dlButton = document.createElement("button");
      dlButton.innerHTML = "Download";
      dlButton.setAttribute("class","dlButton");
      dlButton.setAttribute("id","dl-" + chapterID);
      let divForButton = chapterRow.querySelector("div > div.flex.space-x-2.items-center");
      divForButton.insertBefore(dlButton, divForButton.firstChild);
      divForButton.firstChild.addEventListener('click', () => { startChapterDownload(chapterID, divForButton); }, false);
            //console.log(chapterID);
          });
  }

    //Function to download a chapter (called by download-buttons)
    async function startChapterDownload(id, parent) {
      //Inject progressbar
      let progressDiv = document.createElement("div");
      progressDiv.innerHTML = '<div id="progress-out-' + id + '" style="width: 50px; margin-bottom: 2px; background-color: grey;">' +
      '<div id="progress-in-' + id + '" style="width: 0%; height: 7px; background-color: green;">' +
      '</div>' +
      '</div>' ;
      parent.removeChild(parent.firstChild);
      parent.insertBefore(progressDiv,parent.firstChild);
      let chapterData = await getChapterMetaData(id);
      if (chapterData != null){
        let urlList = await getFileUrls(chapterData);
        if (urlList.length > 0){
         let mangaData = await getMangaData();
         if (mangaData != null){
          createZipFile(mangaData,urlList,chapterData);
        }
      }
    }
  }


  async function getChapterMetaData(chapterID){
        //https://api.mangadex.org/chapter/2de64986-f092-4027-ab35-f78c4a1b54f2
        let resp = await fetch("https://api.mangadex.org/chapter/" + chapterID);
        if (resp.ok) {
          let json = await resp.json();
          console.log("Got chapter metadata for: " + json.data.id);
          return json.data;
        } else {
          console.log("Failed to get metadata for: " + chapterID);
          return null;
        }
      }

      async function getFileUrls(chapterData){
     //https://api.mangadex.org/at-home/server/2de64986-f092-4027-ab35-f78c4a1b54f2
     let urlList = [];
     let resp = await fetch("https://api.mangadex.org/at-home/server/" + chapterData.id);
     let json = await resp.json();
     if (resp.ok) {
      for (let i = 0; i < chapterData.attributes.data.length; i++){
        urlList.push(json.baseUrl +"/data/" + chapterData.attributes.hash + "/" + chapterData.attributes.data[i]);
      }
      console.log("Created url list for: " + chapterData.id);
      console.log("Url list length is: " + urlList.length);
    } else {
      console.log("Failed to get baseURL for: " + chapterData.ID);
    }
    return urlList;
  }

  async function getMangaData(){
     //https://api.mangadex.org/manga/036fce64-6de7-4668-b7ba-66596d32e059
     let resp = await fetch("https://api.mangadex.org/manga/" + document.URL.split("/")[4]);
     console.log("https://api.mangadex.org/manga/" + document.URL.split("/")[4]);
     if (resp.ok) {
      let json = await resp.json();
      console.log("Got manga metadata for: " + json.data.attributes.title.en + "[" + json.data.id + "]");
      return json.data
    } else {
      console.log("Failed to get metadata for manga: " + document.URL.split("/")[4]);
    }
    return null;
  }
  async function getUser(userID){
    console.log("getting user: " + userID);
    let resp = await fetch("https://api.mangadex.org/user/" + userID);
    if (resp.ok) {
      let user = await resp.json();
      return user.data;
    } else {
      console.log("Failed to get metadata for user: " + userID);
    }
    return null;
  }

  async function getScanlationGroupName(groupID){
    console.log("getting group: " + groupID);
    let resp = await fetch("https://api.mangadex.org/group/" + groupID);
    if (resp.ok) {
      let group = await resp.json();
      return group.data.attributes.name != null ? [group.data.attributes.name] : [];
    } else {
      console.log("Failed to get metadata for user: " + userID);
    }
    return [];
  }

  function normalizeAltNames(alts){
    let altNames = [];
    alts.forEach((alt)=>{
      altNames.push(alt.en.normalize())
    });
    return altNames;
  }

  function getTags(tags){
    let themeList = [];
    let genreList = [];
    let formatList = [];
    tags.forEach((tag)=>{
      switch(tag.attributes.group){
        case"theme":
        themeList.push(tag.attributes.name.en.normalize());
        break;
        case"genre":
        genreList.push(tag.attributes.name.en.normalize());
        break;
        case"theme":
        formatList.push(tag.attributes.name.en.normalize());
        break;
      }
    });
    return {"theme":themeList,"genre":genreList,"formatList":formatList}
  }

  async function createZipFile(mangaData,urlList,chapterData){
        //Fetch page-urls and download them
        let id = chapterData.id;
        let tagsMap = getTags(mangaData.attributes.tags);
        //
        let uploaderID = "";
        let groupID = "";

        chapterData.relationships.forEach((relationship) => {if (relationship.type == "user") {uploaderID = relationship.id;}});
        chapterData.relationships.forEach((relationship) => {if (relationship.type == "scanlation_group") {groupID = relationship.id;}});

        let uploader = await getUser(uploaderID);
        let group = await getScanlationGroupName(groupID);
        let link = 'https://mangadex.org/chapter/' + mangaData.id;

        const chapterInfo = {
          manga: mangaData.attributes.title.en,
          altnames: normalizeAltNames(mangaData.attributes.altTitles),
          link: 'https://mangadex.org/chapter/' + mangaData.id,
          chapter: chapterData.attributes.chapter,
          volume: chapterData.attributes.volume || null,
          title: chapterData.attributes.title || null,
          groups: group.join(),
          genres: tagsMap.genre,
            //get user from chapterdata https://api.mangadex.org/user/ id
            uploader: uploader ,
            posted: chapterData.attributes.publishAt,
            language: language_iso[chapterData.attributes.translatedLanguage],
            translated: chapterData.attributes.translatedLanguage,
            images: urlList
          };

          //Fetch all pages using JSZip
          let zip = new JSZip();
          let zipFilename =
          chapterInfo.manga +
          "[" + chapterInfo.language + "]" +
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
            textFile += 'Title: ' + (chapterInfo.title != null ?  chapterInfo.title : 'Unknown')+ '\n';
            textFile += 'Groups: ' + chapterInfo.groups + '\n';
            textFile += 'Genres: ' + chapterInfo.genres.join(', ') + '\n';
            textFile += 'Uploader: ' + (chapterInfo.uploader != null ? chapterInfo.uploader.attributes.username + ' (ID: ' + chapterInfo.uploader.id + ')\n' : "");
            textFile += 'Posted: ' + chapterInfo.posted + '\n';
            textFile += 'Language: ' + chapterInfo.language + (chapterInfo.translated ? ' (TL) \n' : '\n');
            textFile += 'Length: ' + chapterInfo.images.length + '\n\n';
            chapterInfo.images.forEach((image, i) => {
              textFile += 'Image ' + (i +1) + ': ' + image + '\n';
            });
            textFile += '\n\nDownloaded at ' + (new Date()) + '\n';
            textFile += 'Generated by MangaDex Downloader. https://github.com/NO-ob/mangadex-scripts/';

            zip.file('info.txt', textFile.replace(/\n/gi, '\r\n'));
          } else if (localStorage.getItem("chapter-info") == '2') {
            zip.file('info.json', JSON.stringify(chapterInfo, null, 4));
          }
          console.log("Starting chapter download");
          let page_urls = urlList;
          let interval = setInterval(() => {
            if (active_downloads < (localStorage.getItem("parallel-downloads") || 3) && page_urls.length > 0) {
              let to_download = page_urls.shift();
              let current_page = page_count - page_urls.length;
              let page_filename =
              (chapterInfo.manga +
                (chapterInfo.language == "English" ? "" : "[" + language_iso[chapterInfo.language] + "]") +
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
                  setProgress(chapterData.id, -1);
                }
              });
            } else if (active_downloads === 0 && page_urls.length === 0) {
              clearInterval(interval);
              zip.generateAsync({ type: "blob" }).then((zipFile) => {
                saveAs(zipFile, zipFilename);
                setProgress(chapterData.id, -1);
              });
            }
          }, 500);
        }

    //Set progress of download for id
    function setProgress(id, progress) {
      console.log(id);
      if (progress !== -1) {
        document.getElementById('progress-in-' + id).style.width = progress + '%';
      } else {
        document.getElementById('progress-out-' + id).remove();
      }
    }

    /*
    function getAPIKey(){
        var URL = "https://api.mangadex.org/auth/login";
        GM_xmlhttpRequest ( {
            method:         "POST",
            url:            URL,
            responseType:   "text/*",
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            data : JSON.stringify({'username' : '', 'password':''}),
            onload:         function(response) {printKey(response.responseText);}
        });
    }
    function printKey(responseText){
        let resp = JSON.parse(responseText);
        console.log(resp.token.session);
        console.log(resp.token.refresh);
    }


    */
  })();
