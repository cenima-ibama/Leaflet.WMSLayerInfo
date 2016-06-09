/**
 * Created by Igor Castilheiro on 24/03/2016.
 */
WMSLayerInfo = L.Class.extend({

    initialize: function (map, popupFunction) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        this._map = map;
        this._popupFunction = popupFunction;
        this._map.on('click', this.getFeatureInfo, this);
    },

    getFeatureInfo: function (evt) {
        // Make an AJAX request to the server and hope for the best
        this._hasPopup = false;
        this._popupContent = '';
        this._map.eachLayer(function (layer) {
                if (layer.hasOwnProperty("wmsParams")) {
                    var url = this.getFeatureInfoUrl(evt.latlng, layer),
                        showResults = L.bind(this.showGetFeatureInfo, this);
                    // showResults = L.bind(this.showGetFeatureInfo, layer.extras.title);
                    $.ajax({
                        url: url,
                        dataType: 'html',
                        success: function (data) {
                            var err = typeof data === 'string' ? null : data;
                            var result = JSON.parse(data);
                            result.title = layer.options.title;
                            showResults(err, evt.latlng, result);
                        },
                        error: function (xhr, status, error) {
                            showResults(error);
                        }
                    })
                }
            }, this
        );
    },

    getFeatureInfoUrl: function (latlng, layer) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
            size = this._map.getSize(),

            params = {
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                styles: layer.wmsParams.styles,
                transparent: layer.wmsParams.transparent,
                version: layer.wmsParams.version,
                format: layer.wmsParams.format,
                bbox: layer._map.getBounds().toBBoxString(),
                height: size.y,
                width: size.x,
                layers: layer.wmsParams.layers,
                query_layers: layer.wmsParams.layers,
                info_format: 'application/json'
            };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return layer._url + L.Util.getParamString(params, layer._url, true);
    },

    showGetFeatureInfo: function (err, latlng, content) {
        if (err) {
            console.log(err);
            return;
        } // do nothing if there's an error
        var html = '';
        if (content.features.length > 0) {
            if (this._popupFunction) {
                html = '<h3>' + content.title + '</h3>';
                html += '<table class="table table-striped">';

                for (var property in content.features[0].properties) {
                    html += '<tr>';
                    html += '<td><b>' + property + '</b></td>';
                    html += '<td>' + content.features[0].properties[property] + '</td>';
                    html += '</tr>';

                }
                html += '</table>';

                this._popupContent += html;
            } else {
                this._popupContent += this._popupFunction(content);   
            }

            if (!this._hasPopup) {
                L.popup({
                        maxWidth: 600,
                        maxHeight: 300,
                        closeButton: true,
                        closeOnClick: true
                    })
                    .setLatLng(latlng)
                    .setContent(html)
                    .openOn(this._map);

                this._hasPopup = true;
            }
            else {
                this._map._popup.setContent(this._popupContent);
            }
        }

    }

});
