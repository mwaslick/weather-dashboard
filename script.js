// API Key variable
var APIkey = "2d1818e7de0de3e491482a3a5a527e0a";

// Current date in moment.js
var currentDate = moment().format('l');

// Gets the searches array from the local storage
var searches = localStorage.getItem('searchHistory');
if (searches){
    searches = JSON.parse(searches);
} else {
    searches = [];
}

// Adds the search history array to the list of search history on the page
for (s=0; s < searches.length; s++) {
    var searchLi= $("<li>");
    searchLi.attr("class", "list-group-item list-group-item-action")
    searchLi.text(searches[s])
    $("#search-history").prepend(searchLi)
}

// If the search history list is clicked on, the weather data for the city in the corresponding li element will be displayed
$("#search-history li").on("click", function(event) {
    event.preventDefault();
        var historyCity =  $(this).text()
        console.log(historyCity);
        $("#city-input").val(historyCity);
        $("#submitBtn").click();
})

//Function that gets the weather data from open weather API, and appends it to the page
function getWeather() {
    var cityInput = $("#city-input").val().trim()
    console.log(cityInput)
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + APIkey 
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response)
        var cityHeader = $("<h2>")
        cityHeader.text(response.name.trim() + " (" + currentDate + ")")

        var cityImg = $("<img>")
        var imgUrl = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
        cityImg.attr("src", imgUrl)
        cityImg.attr("alt", response.weather[0].description)

        var cityWeather = $("<h3>")
        cityWeather.text(response.weather[0].main)

        var cityTemp = $("<p>")
        var tempF = (response.main.temp - 273.15) * 1.80 + 32
        cityTemp.html("<b>Temperature:</b> " + tempF.toFixed(2) + "°F")

        var cityHumidity = $("<p>")
        cityHumidity.html("<b>Humidity:</b> " + response.main.humidity)
        
        var cityWind = $("<p>")
        cityWind.html("<b>Wind Speed:</b> " + response.wind.speed)


        // Gets the latitude and longitude from the first response and plugs them into another API call for the UV index
        var cityLat = response.coord.lat;
        var cityLong = response.coord.lon;
        
        var coordUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLong + "&appid=" + APIkey

        $.ajax({
            url: coordUrl,
            method: "GET"
        }).then(function(response) {
            console.log(response)
            var UVIndex= response.value;
            var cityUV = $("<p>")
            var cityUVSpan = $("<span>")
            cityUVSpan.html("<b>UV Index:</b> " + UVIndex);
            // Changes the color of the UV index span background based on the severity of the UV index
            if (UVIndex < 3) {
                cityUVSpan.attr("class", "low")
            } else if (UVIndex >= 3 && UVIndex < 6) {
                cityUVSpan.attr("class", "moderate")
            } else if (UVIndex >= 6 && UVIndex < 8) {
                cityUVSpan.attr("class", "high")
            } else if (UVIndex >=8 && UVIndex < 11) {
                cityUVSpan.attr("class", "very-high")
            } else if (UVIndex >= 11) {
                cityUVSpan.attr("class", "extreme")
            }
            cityUV.append(cityUVSpan)
            $("#weatherInfo").append(cityUV)
        })

       // Gets the data for the 5 day weather forecast from the API
        var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityInput + "&appid=" + APIkey

        $.ajax({
            url: forecastUrl,
            method: "GET"
        }).then(function(response) {
            console.log(response)

           // Makes a div for each of the 5 days of the upcoming weather forecast at the same time and attaches the necessary information to each div
            var forecastDiv = $("#forecastRow")
            forecastDiv.html("")
            for (j=6; j < response.list.length; j = j+8) {
                console.log(response.list[j])

                var forecastDay = $("<div>")
                forecastDay.attr("class", "col-2 forecast")

                var forecastHeader= $("<h3>")
                forecastHeader.text(moment.unix(response.list[j].dt).format("l"))

                var forecastImg = $("<img>")
                var fimgUrl = "https://openweathermap.org/img/wn/" + response.list[j].weather[0].icon + "@2x.png"
                forecastImg.attr("src", fimgUrl)
                forecastImg.attr("alt", response.list[j].weather[0].description)

                var forecastTemp = (response.list[j].main.temp - 273.15) * 1.80 + 32
                var tempP = $("<p>")
                tempP.html("<b>Temp:</b> " + forecastTemp.toFixed(2) + " °F")

                var forecastHum = (response.list[j].main.humidity)
                var humidityP= $("<p>")
                humidityP.html("<b>Humidity: </b>" + forecastHum)
                
                // Appends the individual forecast divs to the forecast section of the webpage
                forecastDay.append(forecastHeader)
                forecastDay.append(forecastImg);
                forecastDay.append(tempP)
                forecastDay.append(humidityP)

                forecastDiv.append(forecastDay)
    
                }
            
        })


     // Appends forecast header text
     $("#forecastHeader").text("5-Day Forecast")

        // Clears html of weather title and info
      $("#weatherTitle").html("");
      $("#weatherInfo").html("");
      
    
        // Appends all the current weather information for the searched city
       $("#weatherTitle").append(cityHeader)
       $("#weatherInfo").append(cityImg)
       $("#weatherInfo").append(cityWeather)
       $("#weatherInfo").append(cityTemp)
       $("#weatherInfo").append(cityHumidity)
       $("#weatherInfo").append(cityWind)


    })

// If the city does not already exist in the array of search history, it is pushed into the search history array
if (searches.indexOf(cityInput) === -1) {
        searches.push(cityInput);
        location.reload();
    }

// Stringifies the search history
    localStorage.setItem('searchHistory', JSON.stringify(searches))
    
}


// Click function for the submit button that calls the getWeather function
$("#submitBtn").on("click", function(event) {
    event.preventDefault();
    getWeather();
}
)

