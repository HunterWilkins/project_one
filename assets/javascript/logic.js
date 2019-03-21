$(document).ready(function () {
    $(document).foundation();

    // Holds the list of concerts
    var concertList = [];
    var newConcertsNum = 0;
    var page = 0;

    // Initialize the autocomplete city search
    var autocompleteOpt = {
        types: ['(cities)'],
        componentRestrictions: {country: "us"}
    };
    var autocomplete = new google.maps.places.Autocomplete($("#search-box")[0], autocompleteOpt);
    google.maps.event.addListener(autocomplete, 'place_changed', searchLocation);

    // Search button click event
    $("#search-button").on("click", function(event) {
        $("#concertDiv").attr("style","display:initial");
        searchLocation();
    })

    function searchLocation() {
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

        getConcerts(cityState[0].trim(), cityState[1].trim(), page);

        // Ensure we have at least 10, but don't get more than 5 pages
        // while(newConcertsNum < 10 && page < 5) {
        //     getConcerts(cityState[0].trim(), cityState[1].trim(), page);
        //     page++;
        // }
        // newConcertsNum = 0;
    }

    // Get a list of concerts performing in the provided city
    function getConcerts(city, stateCode, page) {
        var apiKey = "JviGs3zVAQltfcvyy3z0DWiOA7vrRa8d";
        var queryUrl = "https://app.ticketmaster.com/discovery/v2/events?apikey=" + apiKey +
            "&city=" + city +
            "&stateCode=" + stateCode +
            "&page=" + page +
            "&sort=date%2Casc&classificationId=KZFzniwnSyZfZ7v7nJ";

        $.get(queryUrl).then(function (response) {
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

    function addConcertToModal (index) {
        var concert = concertList[index];
        
        // Create a div to hold all elements
        var concertInfoDiv = $("<div>");
        concertInfoDiv.addClass("concert-info-div");

        // Heading for modal
        var title = $("<h4>Concert Information</h4>");
        concertInfoDiv.append(title);

        // Relevant info needed:
        // Create an img
        var imgArtist = $("<img>");
        imgArtist.addClass("artist-img");

        // Find the image url with 4:3 ratio
        for(var i = 0; i < concert.images.length; i++) {
            if(concert.images[i].ratio === "4_3") {
                imgArtist.attr("src", concert.images[i].url);
                console.log(concert.images[i].url);
                concertInfoDiv.append(imgArtist);
                break;
            }
        }

        // Concert Name
        var concertName = concert.name;
        var p = $("<p>");
        p.text(concertName);

        // Concert Date
        var concertDate = concert.dates.start.localDate;
        var concertTime = concert.dates.start.localTime;
        var concertTimezone = concert.dates.timezone;
        p.append("<br>Concert Date: ",concertDate);
        p.append("<br>Concert Time: ",concertTime);
        p.append("<br>Timezone: ",concertTimezone);

        // Ticket sale start & end date
        var ticketSaleStart = concert.sales.public.startDateTime;   
        var ticketSaleEnd = concert.sales.public.endDateTime;
        p.append("<br>Ticket Sale Start Date: ",ticketSaleStart);
        p.append("<br>Ticket Sale End Date: ",ticketSaleEnd);

        concertInfoDiv.append(p);

        // Link to ticketmaster for tickets
        var buyTickets = concert.url;
        var purchaseTicket = $("<a href='"+buyTickets+"'>")
        var buyButton = $("<button class='button'>Purchase Tickets</button>");
        purchaseTicket.append(buyButton);

        concertInfoDiv.append(purchaseTicket);
        $("#concertInfoModal").prepend(concertInfoDiv);
        $("#concertInfoModal").append("<hr>");
    }

    function addConcertToUI(concert, artistId) {
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
        var iTunesUrl, musicBrainzId;
        var artistName = concertInfo.name;

        // Check if there is iTunes info in the concert info
        try {
            iTunesUrl = concertInfo._embedded.attractions[0].externalLinks.itunes[0].url;
            var ArtistId = iTunesUrl.substring(iTunesUrl.indexOf("/id") + 1);
        } catch(err) {
            iTunesUrl = undefined;
        }

        try {
            musicBrainzId = concertInfo._embedded.attractions[0].externalLinks.musicbrainz[0].id;
            // Get the artist name from MusicBrainz
            var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/http://musicbrainz.org/ws/2/artist/" + musicBrainzId + "?inc=url-rels&fmt=json"
            $.get(queryUrl).then(function(response) {
                // response = JSON.parse(response);
                // Search each URL for the iTunes url
                for (var i = 0; i < response.relations.length; i++) {
                    if(response.relations[i].url.resource.includes("itunes.apple.com")) {
                        var url = response.relations[i].url.resource

                        // Check that this is not a duplicate
                        if (concertList.map(function(e) { return e.name; }).indexOf(concertInfo.name) < 0) {
                            // Append the new data to the list of concerts
                            var id = url.substring(url.indexOf("/id") + 3);
                            newConcertsNum++;
                            concertList.push(concertInfo);
                            addConcertToUI(concertInfo, id);
                        }
                    }
                }
            });

            // iTunes link not found, use artist name from MusicBrainz to search iTunes
            artistName = response.name;
        } catch(err) {
            musicBrainzId = undefined;
        }

        try {
            // Search iTunes for an exact match
            if(artistName !== undefined) {
                var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=1"
                $.get(queryUrl, function(response) {
                    response = JSON.parse(response);
                    if(response.resultCount > 0) {
                        if(response.results[0].artistName === artistName) {
                            // Check that this is not a duplicate
                            if (concertList.map(function(e) { return e.name; }).indexOf(concertInfo.name) < 0) {
                                // Append the new data to the list of concerts
                                var id = response.results[0].artistId.toString();
                                newConcertsNum++;
                                concertList.push(concertInfo);
                                addConcertToUI(concertInfo, id);
                            }
                        }
                    }
                });
            }
        } catch(err) {
            artistName = undefined;
        }
    }

    $("#concert-info").on("click", ".concert-div", function(event){
        $("#concertInfoModal").empty();
        getTracks($(this).attr("data-artistId"));
        addConcertToModal($(this).attr("data-index"));
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
                $("#concertInfoModal").append(newAlbumRow1,albumLink);

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
                    $("#concertInfoModal").append(newAlbumRow2);
                });
            });
        });
    }
})
