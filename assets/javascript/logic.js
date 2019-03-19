$(document).ready(function () {

    // Holds the list of concerts
    var concertList = [];

    // Search button click event
    $("#search-button").on("click", function(event) {
        searchLocation();
    })

    // Enter key pressed in search box
    $(document).keyup(function (e) {
        if ($("#search-box").is(":focus") && (e.keyCode == 13)) {
            searchLocation();
        }
    });

    function searchLocation() {
        var cityState = $("#search-box").val().split(",");
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

                // Clear the UI
                $("#concert-info").empty();
            }

            // Keep track of which index we are on
            iConcert = concertList.length;

            // Get the new concert list from the response
            newConcertList = response._embedded.events;

            // Append new data to the UI
            newConcertList.forEach(function (concert) {
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
            });

            // Append the new data to the list of concerts
            concertList = concertList.concat(newConcertList);
        })
    }
})
