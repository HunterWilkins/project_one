$(document).ready(function () {
    // $(document).foundation();

    // Holds the list of concerts
    var concertList = [];
    var artistIds = [];

    // Keep track of total items
    var page = 0;
    var iConcert = 0;
    var city, state;
    var moreResults;

    // Keep track of new items added for each request
    var newPageRequests = 0;
    var iNewConcert = 0;
    var iNewConcertAdded = 0;

    // Queue to hold requests to MusicBrainz
    var mbQueue = async.queue(function(task, callback) {
        setTimeout(callback, 150);
    }, 1);

    // Initialize the autocomplete city search
    // var autocompleteOpt = {
    //     types: ['(cities)'],
    //     componentRestrictions: {country: "us"}
    // };
    // var autocomplete = new google.maps.places.Autocomplete($("#search-box")[0], autocompleteOpt);
    // google.maps.event.addListener(autocomplete, 'place_changed', searchLocation);

    // Search button click event
    $("#search-button").on("click", function(event) {
        const activatedStyle = {
            "max-width" : "100%",
            "border-bottom-right-radius": "0",
            "border-bottom-left-radius": "0",
            "border-bottom": "none",
            "margin-bottom" : "0"
        }
        $(".search-box").css(activatedStyle);
        searchLocation();
    });

    // Load more if scrolled to bottom
    var throttleTimer = null;
    $("#concert-info").off('scroll', ScrollHandler).on('scroll', ScrollHandler);

    function ScrollHandler(e) {
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(function () {
            if (($("#concert-info").scrollTop() + $("#concert-info").innerHeight() > $("#concert-info")[0].scrollHeight - 100) && moreResults) {
                newPageRequests = 0;
                iNewConcertAdded = 0;
                page++;
                getConcerts(city, state, page);
            }
        }, 100);
    }

    function searchLocation() {
        $("#concertDiv").attr("style","display:initial");
        // var place = autocomplete.getPlace();
        // var cityState;
        city = $("#search-box").val().split(",")[0];
        state = $("#search-box").val().split(",")[1];
        page = 0;
        
        // if(place.formatted_address !== undefined) {
        //     // Use the Google Places formatted info
        //     cityState = place.formatted_address.split(",");
        // } else if($("#search-box").val().indexOf(",") > 0) {
        //     // Split by comma
        //     cityState = $("#search-box").val().split(",");
        // } else {
        //     // Split by space
        //     cityState = $("#search-box").val().split(" ");
        // }

        // city = cityState[0].trim();
        // state = cityState[1].trim();
        getConcerts(city, state, page);
    }

    // Get a list of concerts performing in the provided city
    function getConcerts(city, stateCode, page) {
        iNewConcert = 0;

        var apiKey = "JviGs3zVAQltfcvyy3z0DWiOA7vrRa8d";
        var queryUrl = "https://app.ticketmaster.com/discovery/v2/events?apikey=" + apiKey +
            "&city=" + city +
            "&stateCode=" + stateCode +
            "&page=" + page +
            "&sort=date%2Casc&classificationId=KZFzniwnSyZfZ7v7nJ";

        $.get(queryUrl).then(function(response) {
            // Clear the old info if this is the first page
            if (page === 0) {
                // Clear the data
                concertList = [];
                artistIds = [];

                // Clear the UI
                $("#concert-info").empty();
            }

            // Keep track of which index we are on
            iConcert = concertList.length;

            // Get the new concert list from the response
            try {
                var newConcertList = response._embedded.events;
            } catch(err) {
                if (page === 0) {
                    // No results for the city entered
                    $("#concert-info").append($("<h4>").text("No results found for " + city + ", " + state));
                }
                return;
            }

            moreResults = newConcertList.length >= 20;

            // Get or find the iTunes artist ID for each event
            newConcertList.forEach(getITunesArtistId);
            return;
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
        imgArtist.attr("style","padding:10px 0");

        // Find the image url with 4:3 ratio
        for(var i = 0; i < concert.images.length; i++) {
            if(concert.images[i].ratio === "4_3") {
                imgArtist.attr("src", concert.images[i].url);
                // console.log(concert.images[i].url);
                concertInfoDiv.append(imgArtist);
                break;
            }
        }

        // Link to ticketmaster for tickets
        var buyTickets = concert.url;
        var purchaseTicket = $("<a target='_blank' href='"+buyTickets+"' class = 'button'>Purchase Tickets</a>")
        
        //===Turned purchaseTicket into its own button without creating a separate button ==== -Hunter
        // var buyButton = $("<button class='button'>Purchase Tickets</button>");
        // purchaseTicket.append(buyButton);

        concertInfoDiv.append("<br>",purchaseTicket);



        // Concert Name
        var concertName = concert.name;
        var h5 = $("<h5>");
        h5.text(concertName);
        
        // Concert Date
        var p = $("<p>");
        var concertDate = concert.dates.start.localDate;
        var prettyConcertDate = moment(concertDate).format("MMMM Do YYYY");
        var concertTime = concert.dates.start.localTime;
        var prettyConcertTime = moment(concertTime,"hh:mm:ss").format("hh:mm a");
        if (concertDate !== undefined) {
            p.append("Concert Date: ",prettyConcertDate);
        }
        if (concertTime !== undefined) {
            p.append("<br>Concert Time: ",prettyConcertTime);
        }
        
        // Ticket sale end date
        var ticketSaleEnd = concert.sales.public.endDateTime;
        var prettyTicketSaleEnd = moment(ticketSaleEnd).format("MMMM Do YYYY, h:mm a");
        if (ticketSaleEnd !== undefined) {
            p.append("<br>Deadline To Buy Tickets Online: ",prettyTicketSaleEnd);
        }
        concertInfoDiv.append(h5,p);
        $("#concertMusicDiv").prepend(concertInfoDiv);
        $("#concertMusicDiv").append("<hr>");
    }

    function addConcertToUI(concert, artistId) {
        if(concertList.length === 0) {
            // Remove the "No Concerts Found" message
            $("#concert-info").empty();
        }

        // Store the data
        concertList.push(concert);
        iNewConcertAdded++;

        // Create a div to hold all elements
        var concertDiv = $("<div>");
        concertDiv.addClass("concert-div");
        concertDiv.attr("data-index", iConcert);
        concertDiv.attr("data-artistId", artistId);
        concertDiv.attr("data-open", "concertInfoModal");
        iConcert++;

        // Create an img
        var img = $("<img>");
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
        // Prettying up date
        var momentDate = moment(concert.dates.start.localDate).format("MMMM DD, YYYY");
        dateP.text(momentDate);
        textDiv.append(dateP);

        // Append to the concert list container
        $("#concert-info").append(concertDiv);
    }

    function getITunesArtistId(concertInfo) {
        try {
            // Get the iTunes artist ID from Ticketmaster
            var url = concertInfo._embedded.attractions[0].externalLinks.itunes[0].url;
            var id = url.substring(url.indexOf("/id") + 3);
            checkForDupliate(concertInfo, id);
            return;
        } catch(err) {
            // No iTunes ID, continue searching below
        }

        try {
            // Get the MusicBrainz ID from Ticketmaster
            var musicBrainzId = concertInfo._embedded.attractions[0].externalLinks.musicbrainz[0].id;
        } catch(err) {
            // No MusicBrainz ID, search by concert name
            searchITunesByName(concertInfo, concertInfo.name);
            return;
        }

        mbQueue.push({}, function() {
            // Query MusicBrainz URL for info
            var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/http://musicbrainz.org/ws/2/artist/"
                        + musicBrainzId + "?inc=url-rels&fmt=json"
            $.get(queryUrl).then(function(response) {
                try {
                    // Search each URL for the iTunes url
                    for (var i = 0; i < response.relations.length; i++) {
                        if(response.relations[i].url.resource.includes("itunes.apple.com")) {
                            // Get the iTunes artist ID
                            var url = response.relations[i].url.resource;
                            var id = url.substring(url.indexOf("/id") + 3);
                            checkForDupliate(concertInfo, id);
                            return;
                        }
                    }
                } catch(err) {
                // No URLs for this artist
                }

                // iTunes artist ID was not found, search by MusicBrainz artist name
                searchITunesByName(concertInfo, response.name);
                return;
            });
        });
    }

    function searchITunesByName(concertInfo, artistName) {
        var queryUrl = "https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term="
                        + artistName + "&limit=1"
        $.get(queryUrl, function(response) {
            try {
                response = JSON.parse(response);
                
                // Ensure the names match
                if(response.results[0].artistName === artistName) {
                    var id = response.results[0].artistId.toString();
                    checkForDupliate(concertInfo, id);
                    return;
                }
            } catch(err) {
                // No results for iTunes search of artist name
            }
            
            checkAddMore();
            return;
        });
    }

    function checkForDupliate(concertInfo, id) {
        if (artistIds.indexOf(id) < 0) {
            // Append the new data to the list of concerts
            artistIds.push(id);
            addConcertToUI(concertInfo, id);
        }
        checkAddMore();
    }

    function checkAddMore() {
        iNewConcert++;

        // Check if more results should be added
        if(moreResults) {
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
        } else {
            // Ticketmaster returned fewer results than requested
            iNewConcert = 0;
            iNewConcertAdded = 0;
            newPageRequests = 0;

            if (page === 0 && concertList.length === 0) {
                // No results for the city entered
                $("#concert-info").append($("<h4>").text("No results found for " + city + ", " + state));
            }
        }
    }

    $("#concert-info").on("click", ".concert-div", function(event){
        $("#concertMusicDiv").empty();
        getTracks($(this).attr("data-artistId"));
        addConcertToModal($(this).attr("data-index"));
        // Toggle Modal Visibility
        $("#concertInfoModal").css("display", "flex");
    })

    function getTracks(artistID) {
        // Look up artist by their AMG artist ID and get artist’s most recent album
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=1&sort=recent", function (recent) {
            var recentAlbum = JSON.parse(recent).results;
            var artistName = recentAlbum[0].artistName;
            //console.log(recentAlbum);
            if (recentAlbum !== "[]") {
                var albumArtwork = recentAlbum[1].artworkUrl100;
                var albumTitle = recentAlbum[1].collectionName;
                var albumPrice = recentAlbum[1].collectionPrice;
                var albumAdvisoryRating = recentAlbum[1].contentAdvisoryRating;
                var albumReleaseDate = recentAlbum[1].releaseDate;
                var prettyAlbumReleaseDate = moment(albumReleaseDate).format('MMMM Do YYYY, h:mm a');
                var albumSongPreviewsLink = recentAlbum[1].collectionViewUrl;
                
                // Create functions to hold album playlist
                var newAlbumRow1 = $("<div class='row newAlbumRow'>");
                var newAlbumCol1 = $("<div class='albumArtCol small-3 medium-3 large-3 columns'>");
                var albumImg = $("<img src='"+albumArtwork+"' alt=\""+artistName+"\" style=\"display:block;\">");
                newAlbumCol1.append(albumImg);

                var newAlbumCol2 = $("<div class='albumInfo small-9 medium-9 large-9 columns' style='padding-left:0'>");
                var title = $("<h5>"+albumTitle+"</h5>");
                var albumInfo = $("<p style='font-size: 14px;'>"+artistName+"</p>");
                if (albumAdvisoryRating !== undefined) {
                    albumInfo.append("<br><i>Rating: "+albumAdvisoryRating+"</i>");
                } 
                if (albumReleaseDate !== undefined) {
                    albumInfo.append("<br><i>Album Release Date: "+prettyAlbumReleaseDate+"</i>");
                } 
                if (albumPrice !== undefined) {
                    albumInfo.append("<br>Price: $"+albumPrice+"<br></i>");
                } 
                newAlbumCol2.append(title,albumInfo);
                
                var albumLink = $("<a target='_blank' href='"+albumSongPreviewsLink+"' class='button'>Preview the album</a>");
                newAlbumRow1.append(newAlbumCol1,newAlbumCol2);
                $("#concertMusicDiv").append(newAlbumRow1,albumLink);

                var newAlbumRow2 = $("<div class='row newAlbumRow'>");
                var newTracksCol = $("<div class='twelve columns'>");
                var para = $("<p>Check out the artist's 10 most recent tracks below!</p>")
                var TrackList = $("<ol id='tracks'>");
                newTracksCol.append(para,TrackList);

                // Get top recent songs by artist *AKA* prediction for songs sang at concert
                $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=song&limit=20&sort=recent", function(tracks) {
                    var recentTracks = JSON.parse(tracks).results;
                    var songs = [];
                    var darkRow = true;
                    // console.log(recentTracks);

                    for (var m=1; m<recentTracks.length; m++) {
                        var songName = recentTracks[m].trackName;
                        var songPreview = recentTracks[m].trackViewUrl;
                        if (songs.length < 10 && songs.indexOf(songName) < 0) {
                            songs.push(songName);

                            // Link 10 most recent songs to HTML
                            var link = $("<a  target='_blank' href='"+songPreview+"'></a>");
                            if(darkRow) {
                                var item = $("<li class = 'other-song'>"+songName+"</li>");
                            } else {
                                var item = $("<li>"+songName+"</li>");
                            }
                            darkRow = !darkRow;
                            link.append(item);
                            TrackList.append(link);
                        }
                    }
                    // console.log(songs);
                    // console.log(previewLinks);

                    newAlbumRow2.append(newTracksCol);
                    $("#concertMusicDiv").append(newAlbumRow2);
                });
            } else {
                $("#concertMusicDiv").text("No album preview available");
            }
        });
    }

    $("body #concertInfoModal").on("click", ":not(#concertMusicDiv, #concertMusicDiv *)", function() {
        $("#concertInfoModal").css("display", "none");
    })
})
