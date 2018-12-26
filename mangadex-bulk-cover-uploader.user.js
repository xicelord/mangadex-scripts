// ==UserScript==
// @name         Mangadex Bulk Cover Uploader
// @namespace    https://github.com/xicelord
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Upload all the covers!
// @author       icelord
// @homepage     https://github.com/xicelord/mangadex-scripts
// @updateURL    https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-bulk-cover-uploader.user.js
// @downloadURL  https://raw.githubusercontent.com/xicelord/mangadex-scripts/master/mangadex-bulk-cover-uploader.user.js
// @match        https://mangadex.org/title/*
// @icon         https://mangadex.org/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let total_files = 0
    let finished_files = 0
    let bcu_form = `
        <div class="form-group row">
            <div class="col-lg-9">
                <span class="btn btn-secondary btn-file">
                    <span class="far fa-folder-open fa-fw " aria-hidden="true"></span> <span>Select files</span>
                    <input type="file" id="bcu-cover_files" accept=".jpg,.jpeg,.png,.gif" multiple />
                </span>
            </div>
        </div>
        <div class="form-group row">
            <div id="bcu-preview" class="col-lg-9"></div>
        </div>
        <div class="form-group">
          <div class="progress">
            <div id="bcu-progress" class="progress-bar" role="progressbar" style="width: 0%"></div>
          </div>
        </div>
        <div class="form-group row">
            <div class="col-lg-9">
                <button id="bcu-submit" class="btn btn-secondary disabled">
                    <span class="far fa-save fa-fw " aria-hidden="true"></span> <span>Upload</span>
                </span>
            </div>
        </div>`

    // Inject
    document.getElementById('manga_cover_upload_form').parentNode.innerHTML = bcu_form

    // Events
    document.getElementById('bcu-cover_files').onchange = function() {
        let files = document.querySelector('#bcu-cover_files').files

        // Reset stats
        total_files = 0
        finished_files = 0
        document.getElementById('bcu-progress').style.width = '0%'
        document.getElementById('bcu-progress').classList.remove('bg-danger')
        document.getElementById('bcu-submit').classList.remove('disabled')

        let files_filtered = []
        for (let i = 0; i < files.length; i++) {
            const match = files[i].name.match(/(\d+)/)

            if (match !== null) {
                files_filtered.push(match[1] + ': ' + files[i].name)
                total_files++
            }
        }

        document.getElementById('bcu-preview').innerText = files_filtered.join('\n')
    }

    document.getElementById('bcu-submit').onclick = async function () {
        // Disable logic
        if (document.getElementById('bcu-submit').classList.contains('disabled')) {
            return
        } else {
            document.getElementById('bcu-submit').classList.add('disabled')
        }

        let files = document.querySelector('#bcu-cover_files').files

        for (let i = 0; i < files.length; i++) {
            const match = files[i].name.match(/(\d+)/)

            if (match !== null) {
                await addCover(match[1], document.getElementById('bcu-cover_files').files[i])
            }
        }
    }

    async function addCover(volume, cover) {
        return new Promise(function (resolve, reject) {
            let formData = new FormData();
            let req = new XMLHttpRequest();

            formData.append('volume', volume)
            formData.append('old_file', cover.name)
            formData.append('file', cover)
            req.addEventListener('load', function() {
                finished_files++
                console.log(`${total_files}/${finished_files}`)
                document.getElementById('bcu-progress').style.width = ((finished_files / total_files) * 100) + '%'

                if (this.responseText.length > 0) {
                    document.getElementById('bcu-progress').classList.add('bg-danger')
                    console.log('Error at: ' + cover.name)
                    console.error(this.responseText)
                }

                resolve()
            })
            req.addEventListener('error', function() {
                reject()
            })
            req.open('POST', `https://mangadex.org/ajax/actions.ajax.php?function=manga_cover_upload&id=${document.location.href.match(/title\/(\d+)/)[1]}`)
            req.setRequestHeader('x-requested-with', 'XMLHttpRequest')
            req.send(formData);
        })
    }
})();
