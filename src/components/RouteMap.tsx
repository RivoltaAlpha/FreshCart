import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
    coords: [number, number][];
}

const RouteMap: React.FC<RouteMapProps> = ({ coords }) => {
    const latlngs: LatLngExpression[] = coords.map(([lng, lat]) => [lat, lng]);
    const start: LatLngExpression = latlngs[0];
    const end: LatLngExpression = latlngs[latlngs.length - 1];
    return (
        <MapContainer center={start} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }} scrollWheelZoom={true}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <Polyline positions={latlngs} color="blue" />
            <Marker position={start}>
                <Popup>Start</Popup>
            </Marker>
            <Marker position={end}>
                <Popup>End</Popup>
            </Marker>
        </MapContainer>
    );
};

export default RouteMap;
