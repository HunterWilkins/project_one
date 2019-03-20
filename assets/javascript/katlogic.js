$(document).ready(function () {
    var getTracks = function() {
        // Search by Artist
        var artistName = "Ariana Grande"; //Change to link up to Eric's code
        // Obtain their artist ID
        $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/search?term=" + artistName + "&limit=10", function (res) {
            var artistResult = JSON.parse(res).results;
            // console.log(artistResult); 
            
            //Grab the artist ID
            var artistID = artistResult[0].artistId;
            
            $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?id="+artistID+"&entity=album&limit=1", function (response) {
                var updatedArtist = JSON.parse(response).results;  
                // Grab artist AMG ID in order to find their top 5 albums & 5 most recent songs
                var AMGId = updatedArtist[0].amgArtistId;  
                
                // Look up artist by their AMG artist ID and get artist’s most recent album
                $.get("https://cors-ut-bootcamp.herokuapp.com/https://itunes.apple.com/lookup?amgArtistId="+AMGId+"&entity=album&limit=1&sort=recent", function (recent) {
                    var recentAlbum = JSON.parse(recent).results;
                    // console.log(recentAlbum); 

                    var albumArtwork = recentAlbum[1].artworkUrl100;
                    // console.log("Album Cover: "+albumArtwork); 

                    var albumTitle = recentAlbum[1].collectionName;
                    // console.log("Album Title: "+albumTitle); 

                    var albumPrice = recentAlbum[1].collectionPrice;
                    // console.log("Price: $"+albumPrice); 
                    
                    var albumAdvisoryRating = recentAlbum[1].contentAdvisoryRating;
                    // console.log("Rating: "+albumAdvisoryRating); 
                    
                    var albumReleaseDate = recentAlbum[1].releaseDate;
                    // console.log("Release Date: "+albumReleaseDate); 
                    
                    var albumSongPreviewsLink = recentAlbum[1].collectionViewUrl;
                    // console.log("Link for button to Apple Itunes site: "+albumSongPreviewsLink); 
                    
                    var albumTrackCount = recentAlbum[1].trackCount; 
                    // console.log("Track Count: "+albumTrackCount); 
                    
                    // Create functions to hold album playlist
                    $("#playlist").empty();
                    var newAlbumRow1 = $("<div class='row newAlbumRow'>");
                    var newAlbumCol1 = $("<div class='albumArtCol small-3 medium-3 large-3 columns'>");
                    var albumImg = $("<img src='"+albumArtwork+"' alt=\""+artistName+"\" style=\"display:block;margin:auto;margin-top:10%;\">");
                    newAlbumCol1.append(albumImg);

                    var newAlbumCol2 = $("<div class='albumInfo small-9 medium-9 large-9 columns'>");
                    var title = $("<h5>"+albumTitle+"</h5>");
                    var albumInfo = $("<p style='font-size: 14px;'><i>Rating: "+albumAdvisoryRating+"<br>Album Release Date: "+albumReleaseDate+"<br>Price: $"+albumPrice+"<br></i></p>");
                    var albumLink = $("<a href='"+albumSongPreviewsLink+"' class='button'>Preview the album</a>");
                    newAlbumCol2.append(title,albumInfo,albumLink);

                    newAlbumRow1.append(newAlbumCol1,newAlbumCol2);
                    $("#playlist").append(newAlbumRow1);

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
                        console.log(recentTracks);

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
                        console.log(songs);
                        console.log(previewLinks);

                        newAlbumRow2.append(newTracksCol);
                        $("#playlist").append(newAlbumRow2);
                    })
                })

            })

        });
    }   

    getTracks();

});