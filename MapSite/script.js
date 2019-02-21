// Set the parameters
    // The Geojson data you have in your folder
        const geoJsonURL = "data/geoData.geojson";

    // Initial center of the map in terms of longitude and latitude
        const geoCenter = [42.15, -83.7436];

    // Determine initial range of area shown on map (zoom closer when the number is higher)
        const zoomLevel = 11;

    // Start and End year of the dataset
        const baseStartYear = '1992-01-01';
        const baseEndYear = '2019-01-01';

    //Markers & Clusters
        // The color of the markers, used in function customizeMarker()
            const markColor = '#4E91BE';
        // Determine the threshold of distance that cluster multiple markers, used in Function initialMarkerClusters()
            const maxClusterRadius = 120;
        // Specify the color of the marker cluster in css under the class name, used in Function initialMarkerClusters()
            const clusterColorClass = 'marker-cluster-color';

    // Check line 170-174 to customize the information on tooltip for your data


function formatDate(date) {
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return monthNames[monthIndex] + ' ' + year;
  }


// Slider
    $( function() {
        // config opaque slider
            $( "#slider-opaque" ).slider({
                range: false,
                min: 0,
                max: 1,
                step: 0.1,
                value: 1,
                slide: function( event, ui ) {
                    let opaque = ui.value;

                    $( "#opacity" ).val( opaque );
                    a2_1916_02.setOpacity(opaque);
                }
            });

        // initial display
            $( "#opacity" ).val("1");


        // config time range slider
            $( "#slider-range" ).slider({
                range: true,
                min: new Date(baseStartYear).getTime(),
                max: new Date(baseEndYear).getTime(),
                values: [ new Date(baseStartYear).getTime(), new Date(baseEndYear).getTime() ],
                step: 86400000,

                // Every time slider is slided, the map should be refreshed
                    slide: function( event, ui ) {
                        var newGeoJson = {
                            "type" : "Feature Collection",
                            "features": []
                        };
                        let startYear = ui.values[ 0 ];
                        let endYear = ui.values[ 1 ];

                        $( "#amount" ).val( formatDate(new Date(startYear)) + " - " + formatDate(new Date(endYear)) );

                        $.getJSON(geoJsonURL, function(data){
                            let GEOJSON  = data;
                            for (let i = 0; i < GEOJSON["features"].length; i++){
                                if (GEOJSON["features"][i]["properties"]["Date"] >= startYear && GEOJSON["features"][i]["properties"]["Date"] <= endYear) {  // will change "id" to "year"
                                    newGeoJson["features"].push(GEOJSON["features"][i])
                                }
                            }
                            renderPinsFromJson(something_markers,newGeoJson);
                        });
                    }
            });
        //initial display
            $( "#amount" ).val(
                 $( "#slider-range" ).slider( "values", 0 ) + " - " + $( "#slider-range" ).slider( "values", 1 )
            );
    });


// RENDER THE MAP
    //Using map from OpenStreetMap
        var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        var map = L.map('map', {
            layers: [OpenStreetMap_BlackAndWhite]
        });

    // Initial zoom and center in the map
        map.setView(geoCenter, zoomLevel);

    // Set markers & clusters on the map
        var something_markers = initialMarkerClusters();

    // Get the initial Markers
        renderPinsFromURL(something_markers, geoJsonURL);





// Functions to be used above
    // Implement the customized Icon
        function customizeMarker(){
            const markerNarrativeHtmlStyles = `
                                          background-color: ${markColor};
                                          width: 1.2rem;
                                          height: 1.2rem;
                                          display: block;
                                          top: -1.2rem;
                                          position: relative;
                                          border-radius: 3rem 3rem 0;
                                          transform: rotate(45deg);
                                          border: 0.5px solid #FFFFFF
                                      `
            var icon = L.divIcon({
                                      className: "my-custom-pin",
                                      iconAnchor: [10, 5],
                                      labelAnchor: [0, 0],
                                      popupAnchor: [0, -18],
                                      html: `<span style="${markerNarrativeHtmlStyles}" />`
                                    })
            return icon;
        };



    // Set the cluster of markers
        function initialMarkerClusters(){
            let groupToReturn = new L.markerClusterGroup({
                                    spiderfyOnMaxZoom: true,
                                    showCoverageOnHover: true,
                                    zoomToBoundsOnClick: true,
                                    maxClusterRadius: `${maxClusterRadius}`,
                                    singleMarkerMode: false,
                                    iconCreateFunction: function(cluster){
                                        count = 0;
                                        cluster.getAllChildMarkers().forEach(function(child){
                                            count =count + parseInt(child.feature.properties.Count);
                                        });
                                        return L.divIcon({
                                            className:`marker-cluster ${clusterColorClass}`,
                                            iconSize: new L.Point(40,40),
                                            html: `<div><span >` + count + '</span></div>'
                                        });
                                    }
                                })
            return groupToReturn;
        };



    // When you have your Geojson file in your folder, use this function is　handy
        function renderPinsFromURL(markers, geoJsonURL){
            $.getJSON(geoJsonURL, function(data){
                renderPinsFromJson(markers, data);
            })
        }



    // Render Markers on the map based on the geojson data
        function renderPinsFromJson(markers, geoJson){
            var customizedIcon = customizeMarker();
            var geojson = L.geoJson(
                                geoJson,
                                {   // Information shown in tooltip
                                        onEachFeature: function(feature,layer){
                                            layer.bindPopup(
                                                "<b>Address:  </b>" + feature.properties.address + "<br>" +
                                                "<b>No. of Students:  </b>" + feature.properties.Count);
                                        },
                                    pointToLayer: function (feature, latlng) {
                                        return L.marker(latlng, {icon: customizedIcon});
                                    }
                            });
            markers.clearLayers();
            markers.addLayer(geojson);
            map.addLayer(markers);
        };
