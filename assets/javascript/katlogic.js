$(document).ready(function () {
    var getTracks = function() {
        // Search by Artist
        var artistName = "Britney Spears"; //Change to link up to Eric's code
        // Obtain their artist ID
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=10", function (res) {
            var artistResult = JSON.parse(res).results;
            console.log(artistResult); 
            
            //Grab the artist ID
            var artistID = artistResult[0].artistId;
            
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=1", function (response) {
                var updatedArtist = JSON.parse(response).results;  
                // Grab artist AMG ID in order to find their top 5 albums & 5 most recent songs
                var AMGId = updatedArtist[0].amgArtistId;  
                
                // Look up artist by their AMG artist ID and get artist’s most recent album
                $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=album&limit=1&sort=recent", function (recent) {
                    var recentAlbum = JSON.parse(recent).results;
                    console.log(recentAlbum); 

                    var albumArtwork = recentAlbum[1].artworkUrl100;
                    console.log("Album Cover: "+albumArtwork); 

                    var albumTitle = recentAlbum[1].collectionName;
                    console.log("Album Title: "+albumTitle); 

                    var albumPrice = recentAlbum[1].collectionPrice;
                    console.log("Price: $"+albumPrice); 
                    
                    var albumAdvisoryRating = recentAlbum[1].contentAdvisoryRating;
                    console.log("Rating: "+albumAdvisoryRating); 
                    
                    var albumReleaseDate = recentAlbum[1].releaseDate;
                    console.log("Release Date: "+albumReleaseDate); 
                    
                    var albumSongPreviewsLink = recentAlbum[1].collectionViewUrl;
                    console.log("Link for button to Apple Itunes site: "+albumSongPreviewsLink); 
                    
                    var albumTrackCount = recentAlbum[1].trackCount; 
                    console.log("Track Count: "+albumTrackCount); 

                    // $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=song&limit="+albumTrackCount+"&sort=recent", function(tracks) {
                    //     var albumTracks = JSON.parse(tracks).results;
                    //     console.log(albumTracks); 

                    // })

                    // Create functions to hold album playlist
                    $("#playlist").empty();
                    var newAlbum = $("<div>");
            
                    var albumImg = $("<img src='"+albumArtwork+"' alt='"+artistName+" class='album-image' style='margin:10px'>");
                    var title = $("<span style='font-size: 24px;'><b>"+albumTitle+"</b></span>");
                    var rating = $("<p>Rating: "+albumAdvisoryRating+"</p>");
                    var releaseDate = $("<p>Album Release Date: "+albumReleaseDate+"</p>");
                    var price = $("<p>Price: $"+albumPrice+"</p>");
                    var albumLink = $("<a href='"+albumSongPreviewsLink+"' class='button'>Preview the album</a>");
            
                    newAlbum.append(albumImg,title,rating,releaseDate,price,albumLink);
                    $("#playlist").append(newAlbum);
                })

                // Look up an album by its UPC, including the tracks on that album
                // https://itunes.apple.com/lookup?upc=720642462928&entity=song

            })

        });
    }   

    getTracks();

});