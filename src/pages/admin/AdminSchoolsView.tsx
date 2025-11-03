import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminSchoolsView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<any[]>([]);
  const [mapboxToken, setMapboxToken] = useState("");

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    const { data } = await supabase
      .from("memberships")
      .select(`
        *,
        profiles(full_name, email),
        form_categories(name)
      `)
      .eq("status", "approved");
    
    if (data) {
      setSchools(data);
    }
  };

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

    // Note: Map markers require lat/lng data which is not yet in the database

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const filteredSchools = schools.filter(
    (school) =>
      school.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.gnacops_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schools View</h1>
        <p className="text-muted-foreground">All registered and approved schools</p>
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
                placeholder="Search by name, GNACOPS ID, or region..."
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
              <h3 className="font-semibold">
                Schools ({filteredSchools.length})
              </h3>
              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {filteredSchools.map((school) => (
                  <Card key={school.id} className="p-4 hover-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{school.profiles?.full_name || "N/A"}</h3>
                        <p className="text-sm text-muted-foreground">GNACOPS ID: {school.gnacops_id}</p>
                        <p className="text-sm text-muted-foreground">Email: {school.profiles?.email || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">Region: {school.region || "N/A"}</p>
                      </div>
                      <Badge>{school.form_categories?.name || "N/A"}</Badge>
                    </div>
                  </Card>
                ))}
                {filteredSchools.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No schools found</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSchoolsView;
