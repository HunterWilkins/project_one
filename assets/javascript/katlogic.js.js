$(document).ready(function () {
    // Search by Artist
    var artistName = "Britney Spears"; //Change to link up to Eric's code
    $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=10", function (res) {
        var artistResult = JSON.parse(res).results;
        console.log(artistResult);

        //Grab the artist ID
        var artistID = artistResult[0].artistId;
        console.log(artistID);

        // Search Artist Album
        // First replace the querylink with updated artistID
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=5", function (response) {
            var updatedArtist = JSON.parse(response).results;    
            console.log(updatedArtist);


        })

        // Create divs for 


    });

});