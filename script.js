console.log('Lets write javascript')
//global variable
let currentSong = new Audio();
let folder;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    
    songs = [];
    for(let i =0; i<as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="assets/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}  </div>
                                <div> Akanksha </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img fill="white" src="assets/playsong.svg" alt="">
                            </div>
                        </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=> {
        e.addEventListener("click", element=> {
        console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    
}



const playMusic = (track, pause = false)=> {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause) {                        //done to play song bydeault
        currentSong.play()
        play.src = "assets/pausesong.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = ""; // clear previous cards
    Array.from(anchors).forEach(async e=> {
        if(e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[1]
            console.log(folder)

            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML  += `<div data-folder="${folder}" class="card">
                        <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
                                  <path d="M15.9351 12.6258C15.6807 13.8374 14.327 14.7077 11.6198 16.4481C8.67528 18.3411 7.20303 19.2876 6.01052 18.9229C5.60662 18.7994 5.23463 18.5823 4.92227 18.2876C4 17.4178 4 15.6118 4 12C4 8.38816 4 6.58224 4.92227 5.71235C5.23463 5.41773 5.60662 5.20057 6.01052 5.07707C7.20304 4.71243 8.67528 5.6589 11.6198 7.55186C14.327 9.29233 15.6807 10.1626 15.9351 11.3742C16.0216 11.7865 16.0216 12.2135 15.9351 12.6258Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                  <path d="M20 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                </svg>                           
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        </div>`
        }
    })

    // Load the playlist whenever card is clicked
    setTimeout(() => { // Wait for cards to be added to the DOM
        Array.from(document.getElementsByClassName("card")).forEach(e => { 
            e.addEventListener("click", async item => {
                console.log("Fetching Songs")
                await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    }, 500); // Adjust timeout as necessary
}



async function main() {

    // get the list of all the songs
    await getSongs("songs/pop")
    playMusic(songs[0], true)

   // display all the albums on the page
   displayAlbums()


    //Attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused) {
            currentSong.play()
            play.src = "assets/pausesong.svg"
        }
        else {
            currentSong.pause()
            play.src = "assets/playsong.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

     // Add an event listener to seekbar to drag the circle left or right
     document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100      //update duration
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

     // Add an event listener for close button
     document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")       //replace in url
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
    
    //change the color of range bar to green
    const volumeRange = document.getElementById('volumeRange');
    volumeRange.addEventListener('input', function () {
        const value = (volumeRange.value - volumeRange.min) / (volumeRange.max - volumeRange.min) * 100;
        volumeRange.style.setProperty('--value', `${value}%`);
    });

// Initialize the range color on page load
volumeRange.dispatchEvent(new Event('input'));




}

main() 

