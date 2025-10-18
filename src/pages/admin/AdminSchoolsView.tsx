import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

// Mock school data - this will come from your backend later
const mockSchools = [
  { id: 1, name: "Bright Future Academy", gnacopsId: "GNC/PM/01/0001", digitalAddress: "GA-123-4567", lat: 5.6037, lng: -0.1870, type: "Institutional" },
  { id: 2, name: "Knowledge Hub School", gnacopsId: "GNC/PM/01/0002", digitalAddress: "GA-234-5678", lat: 5.6137, lng: -0.1970, type: "Institutional" },
  { id: 3, name: "Excellence Academy", gnacopsId: "GNC/PM/02/0001", digitalAddress: "AK-345-6789", lat: 6.6666, lng: -1.6163, type: "Proprietor" },
];

const AdminSchoolsView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapboxToken, setMapboxToken] = useState("");

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-1.2, 7.9], // Center of Ghana
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    // Add markers for schools
    mockSchools.forEach((school) => {
      const marker = new mapboxgl.Marker({ color: "#7C3AED" })
        .setLngLat([school.lng, school.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${school.name}</h3>
                <p style="font-size: 12px; color: #666;">ID: ${school.gnacopsId}</p>
                <p style="font-size: 12px; color: #666;">Type: ${school.type}</p>
                <p style="font-size: 12px; color: #666;">Address: ${school.digitalAddress}</p>
              </div>`
            )
        )
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const filteredSchools = mockSchools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.gnacopsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.digitalAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schools View</h1>
        <p className="text-muted-foreground">Interactive map of all registered schools</p>
      </div>

      {!mapboxToken ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To display the schools map, please enter your Mapbox public access token. 
                  You can get one for free at{" "}
                  <a 
                    href="https://account.mapbox.com/access-tokens/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="max-w-xl"
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Search Bar */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by school name, GNACOPS ID, or digital address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="p-0 overflow-hidden">
                <div ref={mapContainer} className="w-full h-[600px]" />
              </Card>
            </div>

            {/* Schools List */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">
                  Schools ({filteredSchools.length})
                </h3>
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                  {filteredSchools.map((school) => (
                    <div
                      key={school.id}
                      className="p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => {
                        map.current?.flyTo({
                          center: [school.lng, school.lat],
                          zoom: 14,
                          duration: 1500,
                        });
                      }}
                    >
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{school.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {school.gnacopsId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {school.digitalAddress}
                          </p>
                          <p className="text-xs text-accent mt-1">{school.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSchoolsView;
