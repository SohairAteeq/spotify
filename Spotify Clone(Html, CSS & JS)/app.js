let currentSong = new Audio();
let albumName;
console.log(currentSong);

async function songfetch(albumName) {
    // Updated path to be relative
    let song = await fetch("./songs/");
    let response = await song.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let a = div.getElementsByTagName("a");
    var href = [];
    for (let i = 0; i < a.length; i++) {
        if (a[i].href.endsWith(".mp3")) {
            href.push(a[i].href);
        }
    }
    return href;
}

let pauseButton = document.querySelector("#pause img");

let playMusic = (track, pause = false) => {
    // Updated path to be relative
    currentSong.src = "./songs/" + track;
    if (!pause) {
        currentSong.play();
        pauseButton.src = "./images/play.svg";  // Updated path to be relative
    }

    console.log(track);
    document.querySelector(".songdesc .songouterdesc").innerHTML = `<span class="songinnerdesc">${track}</span>`;
    document.querySelector(".songdesc img").src = "./images/music.svg";  // Updated path to be relative
    volumeSlider.addEventListener('input', () => {
        console.log(volumeSlider, currentSong.volume);
        currentSong.volume = volumeSlider.value / 100;

        if (currentSong.volume == 0) {
            document.querySelector("#volumesvg").src = "./images/mute.svg";  // Updated path to be relative
        } else {
            document.querySelector("#volumesvg").src = "./images/volumefull.svg";  // Updated path to be relative
        }
    });

    const currentTimeDiv = document.getElementById('currentTime');

    currentSong.addEventListener('timeupdate', () => {
        const currentTime = currentSong.currentTime;
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        currentTimeDiv.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        let durationDiv = document.getElementById("durationTime");
        let duration = currentSong.duration;
        let durationSeconds = Math.floor(duration % 60);
        let duratinMinutes = Math.floor(duration / 60);
        durationDiv.innerHTML = `${duratinMinutes}:${durationSeconds < 10 ? 0 : ""}${durationSeconds}`;
        document.getElementById("circle").style.left = (currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("loadeddata", () => {
        let durationDiv = document.getElementById("durationTime");
        let duration = currentSong.duration;
        let durationSeconds = Math.floor(duration % 60);
        let duratinMinutes = Math.floor(duration / 60);
        durationDiv.innerHTML = `${duratinMinutes}:${durationSeconds < 10 ? 0 : ""}${durationSeconds}`;
    });

    const seekbar = document.querySelector('.parentseekbar');
    const progress = document.querySelector('.seekbar');
    const circle = document.querySelector('#circle');
    let isDragging = false;

    circle.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const seekbarRect = seekbar.getBoundingClientRect();
            const circleWidth = circle.offsetWidth;
            const newPosition = e.clientX - seekbarRect.left - circleWidth / 2;

            const maxPosition = seekbarRect.width - circleWidth;
            circle.style.left = Math.max(0, Math.min(newPosition, maxPosition)) + '%';

            const newTime = (newPosition / seekbarRect.width) * currentSong.duration;
            currentSong.currentTime = newTime;
        }
    });

    circle.addEventListener('mouseup', () => {
        isDragging = false;
    });

    seekbar.addEventListener('click', (e) => {
        if (!isDragging) {
            const seekbarRect = seekbar.getBoundingClientRect();
            const clickPosition = e.clientX - seekbarRect.left;
            const newTime = (clickPosition / seekbarRect.width) * currentSong.duration;
            currentSong.currentTime = newTime;

            const circleWidth = circle.offsetWidth;
            const newCirclePosition = (newTime / currentSong.duration) * seekbarRect.width - circleWidth / 2;
            circle.style.left = `${newCirclePosition}px`;
        }
    });
};

async function main() {
    let songsHref = await songfetch();
    console.log(songsHref);

    let songname = songsHref.map((url) => {
        let name = url.split("/");
        cleanedName = name.pop();
        cleanedName = cleanedName.replaceAll("%20", " ");
        return cleanedName;
    });

    playMusic(songname[0], true);

    console.log(songname);
    songname.forEach((e) => {
        let div = document.createElement("div");
        div.setAttribute("className", "songcard");
        div.innerHTML = `<div class="songcard">
                            <img src="./images/music.svg" alt="music">  <!-- Updated path -->
                            <div class="author">${e}</div>
                            <div>Play<img src="./images/play.svg" alt="play"></div> <!-- Updated path -->
                        </div>`;
        let parentsongcard = document.getElementsByClassName("songcardparent")[0];
        parentsongcard.appendChild(div);
    });

    Array.from(document.querySelectorAll(".songcard")).forEach((song) => {
        song.addEventListener("click", () => {
            console.log(song.querySelector(".author").innerHTML);
            playMusic(song.querySelector(".author").innerHTML);
            pauseButton.src = "./images/pause.svg";  // Updated path

            document.querySelector(".songdesc img").src = "./images/music.svg";  // Updated path
            document.querySelector(".songdesc .songouterdesc").innerHTML = `<span class="songinnerdesc">${song.querySelector(".author").innerHTML.trim()}</span>`;
        });
    });

    currentSong.addEventListener("ended", () => {
        pauseButton.src = "./images/play.svg";  // Updated path
    });

    pauseButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            pauseButton.src = "./images/pause.svg";  // Updated path
        } else {
            currentSong.pause();
            pauseButton.src = "./images/play.svg";  // Updated path
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".sidediv").style.left = "0%";
    });

    document.querySelector("#cross").addEventListener("click", () => {
        document.querySelector(".sidediv").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songname.indexOf(currentSong.src.split("/").slice(4)[0].replaceAll('%20', " "));
        if (index == 0) {
            index = 0;
        } else if (index > 0) {
            index = index - 1;
        }

        playMusic(songname[index]);
        pauseButton.src = currentSong.paused ? "./images/play.svg" : "./images/pause.svg";  // Updated path
    });

    next.addEventListener("click", () => {
        let index = songname.indexOf(currentSong.src.split("/").slice(4)[0].replaceAll('%20', " "));
        if (index == songname.length - 1) {
            index = index;
        } else if (index < songname.length - 1) {
            index = index + 1;
        }
        playMusic(songname[index]);
        pauseButton.src = currentSong.paused ? "./images/play.svg" : "./images/pause.svg";  // Updated path
    });

    Array.from(document.getElementsByClassName("album")).forEach(album => {
        album.addEventListener("click", () => {
            console.log(album.dataset.folder);
            albumName = album.dataset.folder;
        });
    });
}

main();
