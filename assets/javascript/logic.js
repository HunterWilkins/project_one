$(document).ready(function () {
    $(document).foundation();

    // Holds the list of concerts
    var concertList = [];

    // Keep track of total items
    var page = 0;
    var iConcert = 0;
    var city, state;

    // Keep track of new items added for each request
    var newPageRequests = 0;
    var iNewConcert = 0;
    var iNewConcertAdded = 0;

    // Initialize the autocomplete city search
    var autocompleteOpt = {
        types: ['(cities)'],
        componentRestrictions: {country: "us"}
    };
    var autocomplete = new google.maps.places.Autocomplete($("#search-box")[0], autocompleteOpt);
    google.maps.event.addListener(autocomplete, 'place_changed', searchLocation);

    // Search button click event
    $("#search-button").on("click", function(event) {
        searchLocation();
    })

    function searchLocation() {
        $("#concertDiv").attr("style","display:initial");
        var place = autocomplete.getPlace();
        var cityState;
        page = 0;
        
        if(place.formatted_address !== undefined) {
            // Use the Google Places formatted info
            cityState = place.formatted_address.split(",");
        } else if($("#search-box").val().indexOf(",") > 0) {
            // Split by comma
            cityState = $("#search-box").val().split(",");
        } else {
            // Split by space
            cityState = $("#search-box").val().split(" ");
        }

        city = cityState[0].trim();
        state = cityState[1].trim();
        getConcerts(city, state, page);
    }

    // Get a list of concerts performing in the provided city
    function getConcerts(city, stateCode, page) {
        iNewConcert = 0
        var apiKey = "JviGs3zVAQltfcvyy3z0DWiOA7vrRa8d";
        var queryUrl = "https://app.ticketmaster.com/discovery/v2/events?apikey=" + apiKey +
            "&city=" + city +
            "&stateCode=" + stateCode +
            "&page=" + page +
            "&sort=date%2Casc&classificationId=KZFzniwnSyZfZ7v7nJ";

        $.get(queryUrl).then(function (response) {
            console.log(response);
            // Clear the old info if this is the first page
            if (page === 0) {
                // Clear the data
                concertList = [];

                // Clear the UI
                $("#concert-info").empty();
            }

            // Keep track of which index we are on
            iConcert = concertList.length;

            // Get the new concert list from the response
            newConcertList = response._embedded.events;

            // Append new data to the UI
            newConcertList.forEach(getITunesId);
        });
    }

    function addConcertToUI(concert, artistId) {
        // Store the data
        concertList.push(concert);
        iNewConcertAdded++;

        // Create a div to hold all elements
        var concertDiv = $("<div>");
        concertDiv.addClass("concert-div");
        concertDiv.attr("data-index", iConcert);
        concertDiv.attr("data-artistId", artistId);
        iConcert++;

        // Create an img
        var img = $("<img data-open='concertInfoModal'>");
        img.addClass("concert-img");

        // Find the image url with 4:3 ratio
        for(var i = 0; i < concert.images.length; i++) {
            if(concert.images[i].ratio === "4_3") {
                img.attr("src", concert.images[i].url);
                concertDiv.append(img);
                break;
            }
        }

        // Create a div to hold text that overlays the image
        var textDiv = $("<div>");
        textDiv.addClass("concert-text-div");
        concertDiv.append(textDiv);

        // Create a p for the artist name
        var artistP = $("<p>");
        artistP.addClass("concert-text-artist");

        // Shorten name if too long
        var displayName = concert.name;
        if(displayName.length > 35) {
            displayName = displayName.substring(0, 32) + "...";
        }
        artistP.text(displayName);
        textDiv.append(artistP);

        // Create a p for the date
        var dateP = $("<p>");
        dateP.addClass("concert-text-date");
        dateP.text(concert.dates.start.localDate);
        textDiv.append(dateP);

        // Append to the concert list container
        $("#concert-info").append(concertDiv);
    }

    function getITunesId(concertInfo) {
        // Attempt to get artist ID from Ticketmaster
        var id = getIdFromTicketmaster(concertInfo);

        if (id === undefined) {
            // Attempt to get artist ID from MusicBrainz
            getIdFromMusicbrainz(concertInfo);
        }
    }

    function getIdFromTicketmaster(concertInfo) {
        try {
            var url = concertInfo._embedded.attractions[0].externalLinks.itunes[0].url;
            return url.substring(url.indexOf("/id") + 3);
        } catch(err) {
            return undefined;
        }
    }

    function getIdFromMusicbrainz(concertInfo) {
        try {
            // Get the MusicBrainz ID
            var musicBrainzId = concertInfo._embedded.attractions[0].externalLinks.musicbrainz[0].id;
            
            // Query MusicBrainz URL for info
            var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/http://musicbrainz.org/ws/2/artist/"
                         + musicBrainzId + "?inc=url-rels&fmt=json"
            $.get(queryUrl).then(function(response) {
                // Search each URL for the iTunes url
                for (var i = 0; i < response.relations.length; i++) {
                    if(response.relations[i].url.resource.includes("itunes.apple.com")) {
                        // Get the iTunes artist ID
                        var url = response.relations[i].url.resource;
                        return url.substring(url.indexOf("/id") + 3);
                    }
                }

                // iTunes artist ID was not found, return the name from MusicBrainz
                return searchITunesByName(response.name);
            });
        } catch(err) {
            return undefined;
        }
    }

    function searchITunesByName(artistName) {
        try {
            var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term="
                            + artistName + "&limit=1"
            $.get(queryUrl, function(response) {
                response = JSON.parse(response);
                
                // Ensure the names match
                if(response.results[0].artistName === artistName) {
                    return response.results[0].artistId.toString();
                }
            });
        } catch(err) {
            return undefined;
        }
    }

    function getITunesIdOld(concertInfo) {
        var iTunesUrl, musicBrainzId;
        var artistName = concertInfo.name;

        // Check if there is iTunes info in the concert info
        try {
            // Get the iTunes artist ID
            iTunesUrl = concertInfo._embedded.attractions[0].externalLinks.itunes[0].url;
            var id = iTunesUrl.substring(iTunesUrl.indexOf("/id") + 3);

            // Add info if not a duplicate
            checkForDupliate(concertInfo, id);
            checkAddMore();
            return;
        } catch(err) {
            iTunesUrl = undefined;
        }

        try {
            musicBrainzId = concertInfo._embedded.attractions[0].externalLinks.musicbrainz[0].id;
            // Get the artist name from MusicBrainz
            var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/http://musicbrainz.org/ws/2/artist/" + musicBrainzId + "?inc=url-rels&fmt=json"
            $.get(queryUrl).then(function(response) {
                // Search each URL for the iTunes url
                for (var i = 0; i < response.relations.length; i++) {
                    if(response.relations[i].url.resource.includes("itunes.apple.com")) {
                        // Get the iTunes artist ID
                        var url = response.relations[i].url.resource;
                        var id = url.substring(url.indexOf("/id") + 3);

                        // Add info if not a duplicate
                        checkForDupliate(concertInfo, id);
                        checkAddMore();
                        return;
                    }
                }

                // iTunes link not found, use artist name from MusicBrainz to search iTunes
                artistName = response.name;
            });
        } catch(err) {
            musicBrainzId = undefined;
        }

        try {
            // Search iTunes for an exact match
            if(artistName !== undefined) {
                var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=1"
                $.get(queryUrl, function(response) {
                    response = JSON.parse(response);
                    iNewConcert++;

                    if(response.resultCount > 0) {
                        // Ensure the names match
                        if(response.results[0].artistName === artistName) {
                            var id = response.results[0].artistId.toString();
                            // Add info if not a duplicate
                            checkForDupliate(concertInfo, id);
                            return;
                        }
                    }

                    checkAddMore();
                });
            }
        } catch(err) {
            artistName = undefined;
        }
    }

    function checkForDupliate(concertInfo, id) {
        iNewConcert++;

        if (concertList.map(function(e) { return e.name; }).indexOf(concertInfo.name) < 0) {
            // Append the new data to the list of concerts
            addConcertToUI(concertInfo, id);
            checkAddMore();
        }
    }

    function checkAddMore() {
        console.log(iNewConcert + " | " + iNewConcertAdded + " | " + newPageRequests);
debugger;
        // Check if more results should be added
        if (iNewConcert >= 20 && iNewConcertAdded < 10 && newPageRequests < 5) {
            // Gone through entire new list, less than 10 were added, and haven't made more than 5 page requests
            newPageRequests++;
            page++;
            getConcerts(city, state, page);
        } else if (iNewConcert >= 20 && (iNewConcertAdded >= 10 || newPageRequests >= 5)) {
            // Gone through entire new list, exceeded concerts added or page requests
            iNewConcertAdded = 0;
            newPageRequests = 0;
        }
    }

    $("#concert-info").on("click", ".concert-div", function(event){
        getTracks($(this).attr("data-artistId"));
    })

    function getTracks(artistID) {
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=1", function (response) {
            var updatedArtist = JSON.parse(response).results;  
            // Grab artist AMG ID in order to find their top 5 albums & 5 most recent songs
            var AMGId = updatedArtist[0].amgArtistId;  
                
            // Look up artist by their AMG artist ID and get artist’s most recent album
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=album&limit=1&sort=recent", function (recent) {
                var artistName = updatedArtist[0].artistName;
                var recentAlbum = JSON.parse(recent).results;
                var albumArtwork = recentAlbum[1].artworkUrl100;
                var albumTitle = recentAlbum[1].collectionName;
                var albumPrice = recentAlbum[1].collectionPrice;
                var albumAdvisoryRating = recentAlbum[1].contentAdvisoryRating;
                var albumReleaseDate = recentAlbum[1].releaseDate;
                var albumSongPreviewsLink = recentAlbum[1].collectionViewUrl;
                
                // Create functions to hold album playlist
                $("#playlist").empty();
                var newAlbumRow1 = $("<div class='row newAlbumRow'>");
                var newAlbumCol1 = $("<div class='albumArtCol small-3 medium-3 large-3 columns'>");
                var albumImg = $("<img src='"+albumArtwork+"' alt=\""+artistName+"\" style=\"display:block;margin:auto;margin-top:10%;\">");
                newAlbumCol1.append(albumImg);

                var newAlbumCol2 = $("<div class='albumInfo small-9 medium-9 large-9 columns'>");
                var title = $("<h5>"+albumTitle+"</h5>");
                var albumInfo = $("<p style='font-size: 14px;'>"+artistName+"<br><i>Rating: "+albumAdvisoryRating+"<br>Album Release Date: "+albumReleaseDate+"<br>Price: $"+albumPrice+"<br></i></p>");
                newAlbumCol2.append(title,albumInfo);
                
                var albumLink = $("<a href='"+albumSongPreviewsLink+"' class='button'>Preview the album</a>");
                newAlbumRow1.append(newAlbumCol1,newAlbumCol2);
                $("#playlist").append(newAlbumRow1,albumLink);

                var newAlbumRow2 = $("<div class='row newAlbumRow'>");
                var newTracksCol = $("<div class='twelve columns'>");
                var para = $("<p>Check out the artist's 10 most recent tracks below!</p>")
                var TrackList = $("<ol id='tracks'>");
                newTracksCol.append(para,TrackList);

                // Get top recent songs by artist *AKA* prediction for songs sang at concert
                $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=song&limit=20&sort=recent", function(tracks) {
                    var recentTracks = JSON.parse(tracks).results;
                    var songs = [];
                    var previewLinks = [];
                    // console.log(recentTracks);

                    for (var m=1; m<recentTracks.length; m++) {
                        var songName = recentTracks[m].trackName;
                        var songPreview = recentTracks[m].trackViewUrl;
                        if (songs.length < 10 && songs.indexOf(songName) < 0) {
                            songs.push(songName);
                            previewLinks.push(songPreview);

                            // Link 10 most recent songs to HTML
                            var link = $("<a href='"+previewLinks+"'></a>");
                            var item = $("<li>"+songName+"</li>");
                            link.append(item);
                            TrackList.append(link);
                        }
                    }
                    // console.log(songs);
                    // console.log(previewLinks);

                    newAlbumRow2.append(newTracksCol);
                    $("#playlist").append(newAlbumRow2);
                });
            });
        });
    }
})
