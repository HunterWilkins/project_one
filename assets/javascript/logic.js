$(document).ready(function () {

    // Holds the list of concerts
    var concertList = [];

    // Get a list of concerts performing in the provided city
    function getConcerts(city, stateCode, page) {
        var apiKey = "JviGs3zVAQltfcvyy3z0DWiOA7vrRa8d";
        var queryUrl = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + apiKey
                     + "&city=" + city
                     + "&stateCode=" + stateCode
                     + "&page=" + page
                     + "&sort=date%2Casc&classificationName=music";

        $.get(queryUrl).then(function(response) {
            // Clear the old info if this is the first page
            if(page === "0") {
                // Clear the data
                concertList = [];

                // TODO: Clear the UI
            }

            // Keep track of which index we are on
            iConcert = concertList.length;

            // Get the new concert list from the response
            newConcertList = response._embedded.events;

            // Append new data to the UI
            newConcertList.forEach(function(concert) {
                // Create a div to hold all elements
                var concertDiv = $("<div>");
                concertDiv.addClass("concert-div");
                concertDiv.attr("data-index", iConcert);

                // Create an img
                var img = $("<img>");
                img.addClass("concert-img");
                img.attr("src", concert.images[1]);
                concertDiv.append(img);

                // Create a div to hold text that overlays the image
                var textDiv = $("<div>");
                textDiv.addClass("concert-text-div");
                concertDiv.append(textDiv);

                // Create a p for the artist name
                var artistP = $("<p>");
                artistP.addClass("concert-text-artist");
                artistP.text(concert.name);
                textDiv.append(artistP);

                // Create a p for the date
                var dateP = $("<p>");
                dateP.addClass("concert-text-date");
                dateP.text(concert.dates.start.localDate);
                textDiv.append(dateP);

                // TODO: Append to the concert list container
            });

            // Append the new data to the list of concerts
            concertList = concertList.concat(newConcertList);
        })
    }


})