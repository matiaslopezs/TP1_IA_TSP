<template>
    <div style="height:400px;width:100%">
        <l-map v-if="showMap" ref="map" :zoom="zoom" :options="mapOptions" style="height: 100%"
                @update:center="centerUpdate" @update:zoom="zoomUpdate" @ready="onMapReady">
            
            <l-tile-layer :url="url" :attribution="attribution" />

            <!-- PATH LINE -->
            
            <l-polyline :lat-lngs="polyPath.latlngs" :color="polyPath.color"></l-polyline>
            
            <!-- MARKS -->
            
            <l-marker v-for="(marker, index) of mapMarkers" :key="index" :lat-lng="marker.coords">
                <l-tooltip :options="{ permanent: true, interactive: false, offset: [0, 0] }">
                    <div><strong>{{index}}. {{marker.name}}</strong></div>
                </l-tooltip>
            </l-marker>

            <!-- MIDDLE POINTS -->

            <l-marker v-for="(middle, index) of mapMiddles" :key="index"
                    :lat-lng="middle.coords" :icon="midPin">
                <l-tooltip :options="{ permanent: true, interactive: false, offset: [0, -1] }">
                    <div><strong>{{middle.weight}}</strong></div>
                </l-tooltip>
            </l-marker>

        </l-map>
    </div>
</template>

<script>
import { latLng } from "leaflet";
import { LPopup, LTooltip, LPolyline } from "vue2-leaflet";

const defaultIconProps = {
    iconSize: [50, 50],
    iconAnchor: [22, 20],
};

export default {
    name: 'MapContainer',
    components: { LPopup, LTooltip, LPolyline },
    props: {
        markers: Array,
        middles: Array,
        autoFocus: Boolean
    },
    data() {
        return {
            map: null,
            showMap: true,
            // MAP OPTIONS
            midPin: L.icon({ iconUrl: 'mid_pin.png', ...defaultIconProps, }),
            zoom: 15,
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            mapOptions: { zoomSnap: 0.5, zoomControl: false },
            lastZoom: 15,
            paddingProportion: 1.0,
        }
    },
    methods: {
        onMarkersChange() {
            // Update map bounds
            const _paddingProportion = this.paddingProportion;
            console.log('this.bounds:', this.bounds);
            if (this.map) this.map.fitBounds(this.bounds, {padding: [50 * _paddingProportion, 125 * _paddingProportion]});
        },
        onMapReady() {
            this.map = this.$refs.map.mapObject;
            this.onMarkersChange();
        },
        zoomUpdate(zoom) {
            
        },
        centerUpdate(center) {
            
        },
    },
    computed: {
        mapMarkers() {
            return this.markers.map(m => { return { coords: latLng(m.lat, m.lng), name: m.name } });
        },
        mapMiddles() {
            return this.middles.map(m => { return { coords: latLng(m.lat, m.lng), weight: m.weight } })
        },
        polyPath() { 
            const latlngs = [];
            for (let marker of this.markers)
                latlngs.push([ marker.lat, marker.lng ]);
            latlngs.push([ this.markers[0].lat, this.markers[0].lng ]);
            return {
                /*latlngs: [[this.start.lat, this.start.lng], [this.end.lat, this.end.lng]],*/
                latlngs,
                color: 'black'
            }
        },
        bounds() {
            const latVar = -0.005;
            let maxLat = this.markers[0].lat, 
                maxLng = this.markers[0].lng, 
                minLat = this.markers[0].lat, 
                minLng = this.markers[0].lng;
            for (let marker of this.markers) {
                if (marker.lat > maxLat) maxLat = marker.lat;
                if (marker.lat < minLat) minLat = marker.lat;
                if (marker.lng > maxLng) maxLng = marker.lng;
                if (marker.lng < maxLng) maxLng = marker.lng;
            }
            return new L.LatLngBounds([
                [
                    maxLat + latVar,
                    maxLng
                ], 
                [
                    minLat + latVar,
                    minLng
                ]
            ]);
        }
    },
    watch: {
        
    },
}
</script>