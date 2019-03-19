$(document).ready(function () {

     //search by artist
            // "search?term=firstname+lastname&limit=25"
            var artistName = "Britney Spears";
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term="+artistName+"&limit=25", function (res) {
               var artistResult = JSON.parse(res).results;
               console.log(artistResult);
            })
                //search by album
                // "notsurehowtosearchbyalbum"3
                // $.get(queryURL).then(function (response) {
                //         // Clear the old info if this is the first page
                //         if (page === "0") {
                //             // Clear the data
                //             concertList = [];
                        
                //         }





                // });
});