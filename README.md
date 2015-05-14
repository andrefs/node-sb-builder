# sb-builder: A CLI to build soundboard websites from Youtube videos

`sb-builder` is a node.js CLI application which helps building soundboards -- webpages with buttons which play sounds when you click on them.

It will help you:

* downloading soundtracks from Youtube videos,
* extracting sound snippets,
* generating a soundboard webpage (HTML, assets folders, etc)


## Installing

    npm install sb-builder

## Initializing a soundboard

    sb-builder init <NAME>

    NAME: the name of the soundboard


`sb-builder` will create some folders:

* `./sources/` (where the original videos soundtracks will be kept),
* `./sounds/` (for the edited sound snippets) and
* `./tmp/` (a folder for temporary files).

Additionally, a `manifest.json` file will be created to store all the information about the soundboard, its sources and sound snippets.

This manifest will be updated each time you download a new soundtrack or create a new snippet, and will be later used to generate the soundboard webpage.

## Adding (downloading) a new source

    sb-builder download <URL>

    URL: the URL of a Youtube video

`sb-builder` will get the video info, and download its soundtrack.

## Create snippet

    sb-builder snip <ID>
    sb-builder snip <URL>

`sb-builder` will open an external sound editing tool to allow you to trim the sound.

    ID: The Youtube ID of the source video soundtrack
    URL: The URL of the Youtube video, including the `t` parameter:
        https://www.youtube.com/watch?v=O_HyZ5aW76c

    Options:

        -f SS, --from SS        Time location of the start of the snippet (in seconds)
        -d SS, --duration SS    Duration in seconds of the snippet
        -e TEXT                 Transcription or description of the snippet (if you don't provide it, one will be asked later)

## Generate webpage

    sb-builder render <FOLDER>

    FOLDER: the folder where to create the webpage

`sb-builder` will create the FOLDER, copy all the sounds and other assets into it, and use the manifest file to render an index.html file for the soundboard.

    Options:

        -h FILE, --header FILE      Location of an header image file to be used in the soundboard index.html



##

## Bugs and stuff

Mail me or make a Github issue request.
