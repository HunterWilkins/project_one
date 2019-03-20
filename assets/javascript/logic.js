$(document).ready(function () {

    // Holds the list of concerts
    var concertList = [];
    var artistIds = [];

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
        var place = autocomplete.getPlace();
        var cityState;
        
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

        getConcerts(cityState[0].trim(), cityState[1].trim(), 0);
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
                artistIds = [];

                // Clear the UI
                $("#concert-info").empty();
            }

            // Keep track of which index we are on
            iConcert = concertList.length;

            // Get the new concert list from the response
            newConcertList = response._embedded.events;

            // Append new data to the UI
            newConcertList.forEach(getITunesId);

            // Append the new data to the list of concerts
            concertList = concertList.concat(newConcertList);
        });
    }

    function addConcertToUI(concert) {
        // Create a div to hold all elements
        var concertDiv = $("<div>");
        concertDiv.addClass("concert-div");
        concertDiv.attr("data-index", iConcert);
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
            var queryUrl = "http://musicbrainz.org/ws/2/artist/" + musicBrainzId + "?inc=url-rels&fmt=json"
            $.get(queryUrl).then(function (response) {
                // Search each URL for the iTunes url
                for (var i = 0; i < response.relations.length; i++) {
                    if(response.relations[i].url.resource.includes("itunes.apple.com")) {
                        var url = response.relations[i].url.resource;
                        var id = url.substring(url.indexOf("/id") + 3);
                        if(artistIds.indexOf(id) < 0) {
                            artistIds.push(id);
                            addConcertToUI(concertInfo);
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
                    var response = JSON.parse(response);
                    if(response.resultCount > 0) {
                        if(response.results[0].artistName === artistName) {
                            var id = response.results[0].artistId.toString();
                            if(artistIds.indexOf(id) < 0) {
                                artistIds.push(id);
                                addConcertToUI(concertInfo);
                            }
                        }
                    }
                });
            }
        } catch(err) {
            artistName = undefined;
        }
    }
})
