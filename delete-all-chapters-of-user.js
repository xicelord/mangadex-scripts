//Get current user
var userToNuke = $('a[href*="/user/"].dropdown-toggle').get(0).href;
//List of chapters to nuke
var to_nuke = [];

//Ask which user should be nuked
userToNuke = window.prompt("Which user do you want to nuke the chapters of?", userToNuke);

//Loop through all chapters
$('a[href*="/chapter/"').each(function (chapter) {
    let uploader = $(this).closest('tr').find('a[href*="/user/"]')[0].href;

    //Check if uploaded by this user
    if (uploader === userToNuke) {
        //Get current chapter-id
        let chapterId = $(this).get(0).href.match(/(\d+)/)[0];

        to_nuke.push(chapterId);
    }
});

function nukeNext() {
    if (to_nuke.length > 0) {
        $.ajax({
            url: "/ajax/actions.ajax.php?function=chapter_delete&id=" + to_nuke[to_nuke.length -1],
            success: function(data) {
                console.log("Nuked: " + to_nuke[to_nuke.length -1]);
                to_nuke.pop();
                setTimeout(function() { nukeNext(); }, 1000);
            },
            error: function() {
                alert("Something went wrong! Refresh the page and try again!");
            },
            cache: false,
            contentType: false,
            processData: false
        });
    }
}


if (to_nuke.length > 0) {
	//Ask user if he's sure
	let nukeAmount = window.prompt('You are about to nuke ' + to_nuke.length + ' chapters. Enter ' + to_nuke.length + ' to confirm');

	if (nukeAmount == to_nuke.length) {
		//Start nuking
		nukeNext();
	} else {
		console.log('The wrong amount was entered. Aborted.');
	}
} else {
	console.log('No chapters were found');
}
