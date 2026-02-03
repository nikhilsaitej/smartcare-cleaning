import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Search, Navigation, Plus, Home, Briefcase, 
  MoreVertical, Check, X, Loader2, ChevronRight, Edit2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@googlemaps/js-api-loader";

export interface SavedAddress {
  id: string;
  label: string;
  type: "home" | "work" | "other";
  fullAddress: string;
  houseNo: string;
  buildingName: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: SavedAddress) => void;
  savedAddresses: SavedAddress[];
  onSaveAddress: (address: SavedAddress) => void;
  onDeleteAddress: (id: string) => void;
}

const STORAGE_KEY = "smartcare_addresses";

export function useAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  const saveAddress = (address: SavedAddress) => {
    setAddresses(prev => {
      const existing = prev.findIndex(a => a.id === address.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = address;
        return updated;
      }
      return [...prev, address];
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return { addresses, saveAddress, deleteAddress };
}

export default function AddressModal({
  open,
  onOpenChange,
  onAddressSelect,
  savedAddresses,
  onSaveAddress,
  onDeleteAddress,
}: AddressModalProps) {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "search" | "form">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.length > 0 ? savedAddresses[0].id : null
  );
  
  // Google Maps state
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const geocoder = useRef<any>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<SavedAddress>>({
    type: "home",
    label: "Home",
    houseNo: "",
    buildingName: "",
    street: "",
    area: "",
    landmark: "",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: (window as any).ENV?.GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => {
      setGoogleLoaded(true);
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      geocoder.current = new (window as any).google.maps.Geocoder();
      // Dummy element for PlacesService
      const dummy = document.createElement("div");
      placesService.current = new (window as any).google.maps.places.PlacesService(dummy);
    }).catch(e => {
      console.error("Google Maps failed to load", e);
    });
  }, []);

  useEffect(() => {
    if (view === "search" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [view]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 3 || !googleLoaded) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    autocompleteService.current.getPlacePredictions({
      input: query,
      componentRestrictions: { country: "in" },
      types: ["geocode", "establishment"]
    }, (predictions: any, status: any) => {
      setIsSearching(false);
      if (status === (window as any).google.maps.places.AutocompleteStatus.OK && predictions) {
        setSearchResults(predictions.map((p: any) => ({
          id: p.place_id,
          name: p.structured_formatting.main_text,
          address: p.structured_formatting.secondary_text
        })));
      }
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({ 
        title: "Location not supported", 
        description: "Your browser doesn't support geolocation.", 
        variant: "destructive" 
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (googleLoaded && geocoder.current) {
          geocoder.current.geocode({ location: latlng }, (results: any, status: any) => {
            setIsLocating(false);
            if (status === "OK" && results[0]) {
              const addressComponents = results[0].address_components;
              const getComp = (type: string) => addressComponents.find((c: any) => c.types.includes(type))?.long_name || "";

              setFormData(prev => ({
                ...prev,
                lat: latlng.lat,
                lng: latlng.lng,
                area: getComp("sublocality") || getComp("neighborhood"),
                street: getComp("route"),
                city: getComp("locality"),
                state: getComp("administrative_area_level_1"),
                pincode: getComp("postal_code"),
              }));
              setView("form");
              toast({ title: "Location detected", description: "Please fill in the remaining details." });
            }
          });
        }
      },
      (error) => {
        toast({ 
          title: "Location error", 
          description: "Unable to get your location. Please enter manually.", 
          variant: "destructive" 
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectSearchResult = (result: any) => {
    if (!googleLoaded || !placesService.current) return;

    placesService.current.getDetails({ placeId: result.id }, (place: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
        const addressComponents = place.address_components;
        const getComp = (type: string) => addressComponents.find((c: any) => c.types.includes(type))?.long_name || "";

        setFormData(prev => ({
          ...prev,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          area: getComp("sublocality") || getComp("neighborhood"),
          street: getComp("route"),
          city: getComp("locality"),
          state: getComp("administrative_area_level_1"),
          pincode: getComp("postal_code"),
        }));
        setView("form");
      }
    });
  };

  const handleSaveAddress = () => {
    if (!formData.houseNo || !formData.area || !formData.pincode) {
      toast({ 
        title: "Missing Details", 
        description: "Please fill in all required fields.", 
        variant: "destructive" 
      });
      return;
    }

    const fullAddress = [
      formData.houseNo,
      formData.buildingName,
      formData.street,
      formData.area,
      formData.landmark ? `Near ${formData.landmark}` : "",
      formData.city,
      formData.state,
      formData.pincode
    ].filter(Boolean).join(", ");

    const newAddress: SavedAddress = {
      id: editingId || `addr_${Date.now()}`,
      label: formData.label || (formData.type === "home" ? "Home" : formData.type === "work" ? "Work" : "Other"),
      type: formData.type as "home" | "work" | "other",
      fullAddress,
      houseNo: formData.houseNo || "",
      buildingName: formData.buildingName || "",
      street: formData.street || "",
      area: formData.area || "",
      landmark: formData.landmark || "",
      city: formData.city || "Vijayawada",
      state: formData.state || "Andhra Pradesh",
      pincode: formData.pincode || "",
      lat: formData.lat,
      lng: formData.lng,
    };

    onSaveAddress(newAddress);
    setSelectedAddressId(newAddress.id);
    resetForm();
    setView("list");
    toast({ title: "Address Saved", description: "Your address has been saved successfully." });
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingId(address.id);
    setFormData({
      type: address.type,
      label: address.label,
      houseNo: address.houseNo,
      buildingName: address.buildingName,
      street: address.street,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      lat: address.lat,
      lng: address.lng,
    });
    setView("form");
  };

  const handleDeleteAddress = (id: string) => {
    onDeleteAddress(id);
    if (selectedAddressId === id) {
      setSelectedAddressId(savedAddresses.length > 1 ? savedAddresses[0].id : null);
    }
    toast({ title: "Address Deleted", description: "Address has been removed." });
  };

  const handleProceed = () => {
    const selected = savedAddresses.find(a => a.id === selectedAddressId);
    if (selected) {
      onAddressSelect(selected);
      onOpenChange(false);
    } else {
      toast({ 
        title: "Select Address", 
        description: "Please select or add an address.", 
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: "home",
      label: "Home",
      houseNo: "",
      buildingName: "",
      street: "",
      area: "",
      landmark: "",
      city: "Vijayawada",
      state: "Andhra Pradesh",
      pincode: "",
    });
    setEditingId(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleBack = () => {
    if (view === "form") {
      setView(savedAddresses.length > 0 ? "list" : "search");
    } else if (view === "search") {
      setView("list");
    }
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          {/* List View */}
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <DialogHeader className="p-5 border-b">
                <DialogTitle className="text-xl">Saved address</DialogTitle>
              </DialogHeader>

              <div className="p-5">
                <button
                  onClick={() => setView("search")}
                  className="flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Add another address
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] px-5">
                {savedAddresses.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No saved addresses</p>
                    <p className="text-sm">Add your first address to continue</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 mb-3 cursor-pointer transition-all ${
                          selectedAddressId === address.id 
                            ? "border-violet-500 bg-violet-50/50" 
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {address.type === "home" && <Home className="h-4 w-4 text-gray-500" />}
                            {address.type === "work" && <Briefcase className="h-4 w-4 text-gray-500" />}
                            <span className="font-semibold text-gray-900">{address.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{address.fullAddress}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 rounded" onClick={e => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAddress(address)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              <div className="p-5 border-t bg-white">
                <Button
                  onClick={handleProceed}
                  disabled={!selectedAddressId}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold rounded-lg disabled:opacity-50"
                >
                  Proceed
                </Button>
              </div>
            </motion.div>
          )}

          {/* Search View */}
          {view === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <DialogHeader className="p-5 border-b">
                <div className="flex items-center gap-3">
                  {savedAddresses.length > 0 && (
                    <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <DialogTitle className="text-xl">Add New Address</DialogTitle>
                </div>
              </DialogHeader>

              <div className="p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search for your location/society/apartment"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center gap-3 w-full p-4 mt-4 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                  <span className="font-semibold">Use current location</span>
                </button>

                <Separator className="my-4" />

                {/* Search Results */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl text-left transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{result.name}</p>
                        <p className="text-sm text-gray-500">{result.address}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Enter Manually Option */}
                <button
                  onClick={() => setView("form")}
                  className="flex items-center justify-between w-full p-4 mt-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="font-medium text-gray-700">Enter address manually</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-3 border-t bg-gray-50 text-center">
                <p className="text-xs text-gray-400">powered by <span className="font-medium">Google</span></p>
              </div>
            </motion.div>
          )}

          {/* Form View */}
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <DialogHeader className="p-5 border-b">
                <div className="flex items-center gap-3">
                  <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded">
                    <X className="h-5 w-5" />
                  </button>
                  <DialogTitle className="text-xl">
                    {editingId ? "Edit Address" : "Complete Address Details"}
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[60vh]">
                {/* Address Type */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Save as</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "home", label: "Home", icon: Home },
                      { value: "work", label: "Work", icon: Briefcase },
                      { value: "other", label: "Other", icon: MapPin },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFormData(prev => ({ ...prev, type: value as any, label }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.type === value 
                            ? "border-violet-500 bg-violet-50 text-violet-700" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Label for Other */}
                {formData.type === "other" && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Label Name</Label>
                    <Input
                      placeholder="e.g., Friend's Place, Gym"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="h-11 bg-gray-50"
                    />
                  </div>
                )}

                <Separator />

                {/* House/Flat No */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    House / Flat No. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., 409, Flat 2B"
                    value={formData.houseNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
                    className="h-11 bg-gray-50"
                  />
                </div>

                {/* Building Name */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Building / Apartment Name</Label>
                  <Input
                    placeholder="e.g., Green Space Enclave"
                    value={formData.buildingName}
                    onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                    className="h-11 bg-gray-50"
                  />
                </div>

                {/* Street */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Street / Road</Label>
                  <Input
                    placeholder="e.g., Srinivasanagar Road"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className="h-11 bg-gray-50"
                  />
                </div>

                {/* Area */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Area / Colony <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Srinivasa Nagar Colony"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="h-11 bg-gray-50"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Landmark (Optional)</Label>
                  <Input
                    placeholder="e.g., Near SBI Bank, Opposite Park"
                    value={formData.landmark}
                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    className="h-11 bg-gray-50"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="h-11 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="h-11 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., 520007"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="h-11 bg-gray-50"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="p-5 border-t bg-white">
                <Button
                  onClick={handleSaveAddress}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold rounded-lg"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
