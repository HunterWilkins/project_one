$(document).ready(function () {
    var getTracks = function() {
        // Search by Artist
        var artistName = "Britney Spears"; //Change to link up to Eric's code
        // Obtain their artist ID
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=10", function (res) {
            var artistResult = JSON.parse(res).results;
            
            //Grab the artist ID
            var artistID = artistResult[0].artistId;
            
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=1", function (response) {
                var updatedArtist = JSON.parse(response).results;  
                // Grab artist AMG ID in order to find their top 5 albums & 5 most recent songs
                var AMGId = updatedArtist[0].amgArtistId;  
                console.log(AMGId); 
                
                // Look up artist by their AMG artist ID and get artist’s most recent album
                $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=album&limit=1&sort=recent", function (recent) {
                    var recentAlbum = JSON.parse(recent).results;
                    console.log(recentAlbum); 

                })
                
                
                // https://itunes.apple.com/lookup?amgArtistId=468749,5723&entity=song&limit=5&sort=recent
                // Look up multiple artists by their AMG artist IDs and get each artist’s top 5 albums
                // https://itunes.apple.com/lookup?amgArtistId=468749,5723&entity=album&limit=5
                // Look up an album by its UPC, including the tracks on that album
                // https://itunes.apple.com/lookup?upc=720642462928&entity=song

            })

        });
    }   
	// // Create functions to hold album playlist
	// var latestAlbum = function() {

    // }
    getTracks();

});