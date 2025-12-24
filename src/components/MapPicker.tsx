import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Loader2 } from "lucide-react";
import type { Location } from "@/types/issue";

interface MapPickerProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
  readonly?: boolean;
  className?: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (can be customized to your campus location)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

export const MapPicker = ({ location, onLocationChange, readonly = false, className }: MapPickerProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (readonly || !e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Get address from coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        const address = status === "OK" && results?.[0] ? results[0].formatted_address : undefined;
        onLocationChange({ lat, lng, address });
      });
    },
    [onLocationChange, readonly]
  );

  if (loadError) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-border bg-muted ${className}`}>
        <div className="text-center p-8">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load map. Please check your Google Maps API key.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-border bg-muted ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border ${className}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location || defaultCenter}
        zoom={location ? 16 : 14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {location && (
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>

      {!readonly && !location && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="rounded-lg bg-card px-4 py-2 shadow-lg">
            <p className="text-sm font-medium text-foreground">Click to pin location</p>
          </div>
        </div>
      )}
    </div>
  );
};
