# Homemade Streaming

## TODO

![alt text][work]

- Add and configure html5 player to handle video/audio/subtitles

- Add possibility for audio and subtitles for each 'file'

- Add users

- Add a real landing page

- Add some design

- Compress videos uploaded in 1080p in 480p and 720p automatically for slow connections

## Project Description

### Introduction
As of today we have a few solution for our video entertainment, Netflix, Youtube, PopcornTime, etc, but some of these are either impractical or not free to use. This was the basis for this project. This will be a project made for simplicity of use.

### How it works
So here are the basic concepts for this project. When uploading a video online for multiple language, currently what you would have to do is mix the audio with the video feed and then add to this the subtitles, all of this in one language only for the audio and the subtitles and then upload it to your website, usually by the means of direct upload, meaning you cannot stop your computor during this long upload. But here's the thing, the HTML5 video player can be used to handle audio, video and subtitles seperatly, so why not make use of this to lighten up fixes on audio sync or subtitle mistakes ? As for the upload torrenting has existed for years now, yet no one seems to use it to upload these videos to their website. Sure you could use ftp too but with torrenting you can do the same and it is that much simpler to install and configure.

![alt text][nobody]

# More content to add once features are done

![alt text][noidea]

## Deploying this streaming platform on your server

As of now, no testing has been done on production but I have plans to include this soon and this is how it will work.

- setup a public ftp directory on your server (handling for AWS and other features will be added later)

- add the directory location to your environment as FTPDIR

- configure the mup.json file with the necessary information (mup will be added soon too)

- mup deploy

and your done

![alt text][woah]

I will finish this !

![alt text][trustme]

### That's all folks !
##LICENSES

[work]: https://media.giphy.com/media/KG6pYkcqwMqCA/giphy.gif "Wait what ?"
[nobody]: http://i2.kym-cdn.com/photos/images/original/000/284/529/e65.gif "Ain't nobody got time for that !"
[woah]: http://i.imgur.com/L8EOQdS.gif "So Glorious !"
[noidea]: http://i.imgur.com/k47DZtn.gif "How does this work again ?"
[trustme]: http://s.pikabu.ru/images/big_size_comm/2013-06_2/13705836615514.gif "Trust me"
