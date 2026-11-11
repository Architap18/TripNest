import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 1) {
      map.setView(
        [locations[0].lat, locations[0].lon],
        13
      );
    } else if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map((item) => [item.lat, item.lon])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [locations, map]);

  return null;
}

function ItineraryMap({ items, destination }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const findLocations = async () => {
      setLoading(true);
      setLocations([]);

      const results = [];

      for (const item of items) {
        if (!item.location) continue;

        try {
          const query = `${item.location}, ${destination}`;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
          );

          const data = await response.json();

          if (data.length > 0) {
            results.push({
              ...item,
              lat: Number(data[0].lat),
              lon: Number(data[0].lon),
            });
          }
        } catch (error) {
          console.error("Could not find location:", item.location);
        }

        // Respect the public geocoding service's rate limit.
        await new Promise((resolve) => setTimeout(resolve, 1100));

        if (cancelled) return;
      }

      if (!cancelled) {
        setLocations(results);
        setLoading(false);
      }
    };

    findLocations();

    return () => {
      cancelled = true;
    };
  }, [items, destination]);

  return (
    <section className="itinerary-map-section">
      <div className="itinerary-map-heading">
        <div>
          <h2>Explore your route</h2>
          <p>See your planned activities on the map.</p>
        </div>
        <span>{locations.length} locations</span>
      </div>

      {loading && (
        <p className="map-loading">Finding your activity locations...</p>
      )}

      {locations.length > 0 ? (
        <MapContainer
          center={[locations[0].lat, locations[0].lon]}
          zoom={12}
          scrollWheelZoom={true}
          className="itinerary-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBounds locations={locations} />

          {locations.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lon]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>{item.title}</strong>
                <br />
                {item.location}
                <br />
                {new Date(item.dateTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        !loading && (
          <div className="map-empty">
            <p>No mappable activities yet.</p>
            <span>Add activities with a location to see them here.</span>
          </div>
        )
      )}
    </section>
  );
}

export default ItineraryMap;