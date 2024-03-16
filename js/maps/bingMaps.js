// bingMaps.js
import { BING_MAPS_KEY } from '../key.js'; 

// Bing Mapsスクリプトのロード
const script = document.createElement('script');
script.src = `https://www.bing.com/api/maps/mapcontrol?callback=GetMap&key=${BING_MAPS_KEY}`;
script.async = true;
script.defer = true;
document.body.appendChild(script);

let map;
let pinIndex = 1;

function GetMap() {
    map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(35.6895, 139.6917), // Location center position
        mapTypeId: Microsoft.Maps.MapTypeId.load, // Type: [load, aerial, canvasDark, canvasLight, birdseye, grayscale, streetside]
        zoom: 12  // Zoom: 1=zoomOut, 20=zoomUp [1~20]
    });

    // Load the Autosuggest module
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        const options = {
            maxResults: 5,
            map: map
        };
        const manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#job-location', '#suggestion-container', selectedSuggestion);

            
    });
}

function selectedSuggestion(suggestionResult) {
    document.getElementById('job-location').value = suggestionResult.formattedSuggestion; 
}



let pinLocations = []; // Array to hold all pin locations
let searchManager;

document.addEventListener('NewJobAdded', function(e) {
    geocodeAddressManually(e.detail);
});


function geocodeAddressManually(jobData) {
    const bingMapsKey = BING_MAPS_KEY;
    const encodedAddress = encodeURIComponent(jobData.location);
    const geocodeRequestUrl = `http://dev.virtualearth.net/REST/v1/Locations?q=${encodedAddress}&key=${BING_MAPS_KEY}`;

    fetch(geocodeRequestUrl)
        .then(response => response.json())
        .then(data => {
            if (data &&
                data.resourceSets &&
                data.resourceSets.length > 0 &&
                data.resourceSets[0].resources &&
                data.resourceSets[0].resources.length > 0) {
                const resource = data.resourceSets[0].resources[0];
                const pinLocation = new Microsoft.Maps.Location(resource.point.coordinates[0], resource.point.coordinates[1]);
                pinLocations.push(pinLocation);

                // Create and display the infobox
                createInfobox(pinLocation, jobData.title, jobData.description);
               
            } else {
                console.error('Geocode did not return any results:', data);
            }
        })
        .catch(error => {
            console.error('Geocode request failed', error);
        });
}

function createInfobox(location, title, description) {
    let descriptionWithPin = '<img src="/img/placeholder.png" align="left" style="margin-right:5px;"/>' + description;

    //Infobox:html
    let infoboxTemplate = '<div class="customInfobox"><div class="title">{title}</div>{description}</div>';
    //Infobox
    let infobox = new Microsoft.Maps.Infobox(location, {
        htmlContent: infoboxTemplate.replace('{title}', title).replace('{description}', descriptionWithPin)
    });
    infobox.setMap(map); //Add infobox to Map

    const bounds = Microsoft.Maps.LocationRect.fromLocations(pinLocations);
        
    // Set the map view to the bounding rectangle
    map.setView({ bounds: bounds });
}

window.GetMap = GetMap;
