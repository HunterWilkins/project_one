$(document).ready(function () {

    // Holds the list of concerts
    var concertList = [];

    // $("#").on("click", function(event) {
    //     var cityState = $("#").val().split();
    //     getConcerts(cityState[0], cityState[1], 0);
    // })

    $(document).keyup(function (e) {
        if ($(".text-box").is(":focus") && (e.keyCode == 13)) {
            var cityState = $(".text-box").val().split(",");
            getConcerts(cityState[0].trim(), cityState[1].trim(), 0);
            
        }
    });

    // Get a list of concerts performing in the provided city
    function getConcerts(city, stateCode, page) {
        var apiKey = "JviGs3zVAQltfcvyy3z0DWiOA7vrRa8d";
        var queryUrl = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + apiKey
                     + "&city=" + city
                     + "&stateCode=" + stateCode
                     + "&page=" + page
                     + "&sort=date%2Casc&classificationName=music&classificationID=KZFzniwnSyZfZ7v7nJ";

        $.get(queryUrl).then(function(response) {
            // Clear the old info if this is the first page
            if(page === "0") {
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
            newConcertList.forEach(function(concert) {
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

<<<<<<< HEAD
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
                        $(".results-box").append(concertDiv);
                    });

                    // Append the new data to the list of concerts
                    concertList = concertList.concat(newConcertList);
                })
            }

            //maybe write a function here 
            var artistName = "Britney Spears";
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term="+artistName+"&limit=25", function (res) {
             
            
               console.log(JSON.parse(res));
=======
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

                // Append to the concert list container
                $("#concert-info").append(concertDiv);
              
              //function getArtistinfo
            var queryURL = "https://itunes.apple.com/search?term=jack+johnson&limit=25";
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=artistfirstname+artistlastnme&limit=25", function (res) {
                    console.log(JSON.parse(res));
                    //search by artist
                    // "search?term=firstname+lastname&limit=25"
                    //search by album
                    // "notsurehowtosearchbyalbum"
                    $.get(queryURL).then(function (response) {
                            // Clear the old info if this is the first page
                            if (page === "0") {
                                // Clear the data
                                concertList = [];
                            }
>>>>>>> origin

               var artistResult = JSON.parse(res).results;
               console.log(artistResult);
                //search by artist
                // "search?term=firstname+lastname&limit=25"
                //search by album
                // "notsurehowtosearchbyalbum"
                // $.get(queryURL).then(function (response) {
                //         // Clear the old info if this is the first page
                //         if (page === "0") {
                //             // Clear the data
                //             concertList = [];
                        
                //         }





                // });
            });



})