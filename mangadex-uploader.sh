#!/bin/bash

#Load arguments
while getopts "v:c:t::g:m:l::f:u::p::" opt; do
	case $opt in
		v)
			volume=$OPTARG;
			;;
		c)
			chapter=$OPTARG;
			;;
		t)
			title=$OPTARG;
			;;
		g)
			group=$OPTARG;
			;;
		m)
			manga=$OPTARG;
			;;
		l)
			language=$OPTARG;
			;;
		f)
			file=$OPTARG;
			;;
		u)
			username=$OPTARG;
			;;
		p)
			password=$OPTARG;
			;;
	esac
done

#Correct language
if ! [[ "$language" =~ ^[0-9]+$ ]]; then
	language="1";
fi

#Verify input
if [[ "$volume" =~ ^[0-9]+$ ]] && [[ "$chapter" =~ ^[0-9]+([.][0-9]+)?$ ]] && [[ "$group" =~ ^[0-9]+$ ]] && [[ "$manga" =~ ^[0-9]+$ ]] && ! [ -z "$file" ]; then
	#Show info	
	echo "Uploading the following chapter:";
	echo "Manga: $manga";
	echo "Group: $group";
	echo "v${volume}c${chapter} - $title";
	echo "Language: $language";
	echo "File: $file";

	#Get confirmation
	echo "";
	read -p "Continue (y/n)? " CONT
	if [ "$CONT" = "y" ] || [ "$CONT" = "Y" ]; then
		#Upload
		echo "Uploading...";
		curl -X POST "https://mangadex.com/ajax/actions.ajax.php?function=chapter_upload" \
			-b "./mangadex-cookies" \
			-H "X-Requested-With: XMLHttpRequest" \
			-e "https://mangadex.com/upload/$manga" \
			-F "manga_id=$manga" \
			-F "chapter_name=$title" \
			-F "volume_number=$volume" \
			-F "chapter_number=$chapter" \
			-F "group_id=$group" \
			-F "lang_id=$language" \
			-F "file=@$file"
	else
		echo "Aborted!";
	fi
else
	if ! [ -z "$username" ] && ! [ -z "$password" ]; then
		#Log in
		echo "Logging in...";
		curl -X POST "https://mangadex.com/ajax/actions.ajax.php?function=login" \
			-c "./mangadex-cookies" \
			-H "X-Requested-With: XMLHttpRequest" \
			-e "https://mangadex.com/login" \
			-F "login_username=$username" \
			-F "login_password=$password"
	else
		echo "MangaDex Uploader v0.1 by icelord";
		echo "";
		echo "Usage: mangadex.sh ARGUMENTS";
		echo "";
		echo "Login: Creates a cookie-jar-file";
		echo "	-u: Username (eg: 'test')";
		echo "	-p: Password (eg: 'test')";
		echo "";
		echo "Upload: Uploads a chapter; Make sure to login first!";
		echo "	-m: Manga (eg: 412) {required}";
		echo "	-g: Group (eg: 657) {required}";
		echo "	-v: Volume (eg: 1) {required}";
		echo "	-c: Chapter (eg: 1.1) {required}";
		echo "	-t: Title (eg: 'Title123')";
		echo "	-l: Language (eg: 1) (default: english)";
		echo "	-f: File (eg: './ch1.zip') {required}";
		echo "";
		echo "Examples":
		echo "Login: mangadex -u test -p test";
		echo "Upload: mangadex -m 412 -g 657 -v 1 -c 1 -t \"First\"";
		exit 1;
	fi
fi

