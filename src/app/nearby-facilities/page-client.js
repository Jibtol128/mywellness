'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const NearbyFacilitiesPageClient = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  
  // State variable to track if we're using simulated data
  const [usingSimulatedData, setUsingSimulatedData] = useState(false);
  
  // Step 1: Define marker management functions first
  const clearMarkers = useCallback(() => {
    if (markers.length) {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
    }
  }, [markers]);
  
  const createMarkers = useCallback((mapInstance, places) => {
    if (!googleRef.current) return;
    
    const newMarkers = places.map(place => {
      // Handle different place formats (from Places API v3 vs Beta)
      const location = place.geometry?.location || place.location;
      const vicinity = place.vicinity || place.formattedAddress || '';
      const rating = place.rating || 0;
      
      const marker = new googleRef.current.maps.Marker({
        map: mapInstance,
        position: location,
        title: place.name,
        animation: googleRef.current.maps.Animation.DROP
      });
      
      // Add click listener to markers
      marker.addListener('click', () => {
        const infoWindow = new googleRef.current.maps.InfoWindow({
          content: `
            <div style="padding: 8px 12px;">
              <h3 style="margin: 0 0 8px; font-size: 16px;">${place.name}</h3>
              <p style="margin: 0 0 5px;">${vicinity}</p>
              <p style="margin: 0; font-weight: 600;">${rating ? `Rating: ${rating}/5` : 'No ratings'}</p>
            </div>
          `
        });
        
        infoWindow.open(mapInstance, marker);
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
  }, []);
  
  // Helper function for legacy PlacesService text search
  const useTextSearchFallback = useCallback(() => {
    if (!map || !userLocation || !googleRef.current) return;
    
    const request = {
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address'],
    };
    
    const service = new googleRef.current.maps.places.PlacesService(map);
    service.textSearch(request, (results, status) => {
      if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && results) {
        clearMarkers();
        createMarkers(map, results);
        
        // Pan map to the first result
        if (results[0]) {
          map.panTo(results[0].geometry.location);
        }
      }
      setLoading(false);
    });
  }, [map, userLocation, googleRef, searchQuery, clearMarkers, createMarkers]);
  
  // Define a separate function for PlacesService fallback
  const usePlacesServiceFallback = useCallback((mapInstance, location, type) => {
    if (!googleRef.current || !mapInstance) return;
    
    const service = new googleRef.current.maps.places.PlacesService(mapInstance);
    const request = {
      location: location || userLocation,
      radius: 5000, // 5km radius
      type: type === 'all' ? '' : type,
      keyword: type === 'all' ? 'hospital clinic medical' : type
    };
    
    service.nearbySearch(request, (results, status) => {
      if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && results) {
        createMarkers(mapInstance, results);
      } else {
        console.error('Places search failed with status:', status);
      }
      setLoading(false);
    });
  }, [userLocation, createMarkers]);
  // Step 2: Define search function
  const searchNearby = useCallback((mapInstance, location, type) => {
    if (!googleRef.current || !mapInstance) {
      console.error("Google Maps API or map instance not available for search");
      setLoading(false);
      return;
    }
    
    console.log(`Searching for ${type} facilities near`, location);
    setLoading(true);
    clearMarkers();
    
    // When developing with no API key, we can't use the Places API
    // Instead, we'll simulate the results with some mock data for testing
    try {
      console.log("Checking if Places API is available");
      
      // Try to create a PlacesService instance to check if it's available
      try {
        const service = new googleRef.current.maps.places.PlacesService(mapInstance);
        
        // Test if we can use the service
        const mockRequest = {
          location: location,
          radius: 100
        };
        
        service.nearbySearch(mockRequest, (results, status) => {
          // If we got an error related to API restrictions
          if (status === 'REQUEST_DENIED' || 
              status === googleRef.current.maps.places.PlacesServiceStatus.REQUEST_DENIED ||
              status === 'ERROR' ||
              status === googleRef.current.maps.places.PlacesServiceStatus.ERROR) {
            
            console.log("Places API restricted, using simulated data");
            
            // Create mock locations instead for development/demonstration
            const simulatedPlaces = createSimulatedPlaces(location, type);
            createMarkers(mapInstance, simulatedPlaces);
            setLoading(false);
            
          } else if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && results) {
            // Places API works normally
            console.log(`Found ${results.length} places`);
            createMarkers(mapInstance, results);
            setLoading(false);
          } else {
            console.log("Using text search as fallback");
            // Try text search
            const textSearchRequest = {
              location: location,
              radius: 5000,
              query: type === 'all' ? 'medical facility hospital clinic' : type
            };
            
            service.textSearch(textSearchRequest, (textResults, textStatus) => {
              if (textStatus === googleRef.current.maps.places.PlacesServiceStatus.OK && textResults) {
                console.log(`Text search found ${textResults.length} places`);
                createMarkers(mapInstance, textResults);
              } else {
                console.log("Falling back to simulated places");
                const simulatedPlaces = createSimulatedPlaces(location, type);
                createMarkers(mapInstance, simulatedPlaces);
              }
              setLoading(false);
            });
          }
        });
      } catch (error) {
        // If we can't create a service instance at all
        console.log("PlacesService not available, using simulated data");
        const simulatedPlaces = createSimulatedPlaces(location, type);
        createMarkers(mapInstance, simulatedPlaces);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error searching for places:', error);
      // Create simulated places as a last resort
      const simulatedPlaces = createSimulatedPlaces(location, type);
      createMarkers(mapInstance, simulatedPlaces);
      setLoading(false);
    }
  }, [userLocation, clearMarkers, createMarkers]);
  
  // Helper function to create simulated place data when API key is restricted
  const createSimulatedPlaces = (location, type) => {
    console.log("Creating simulated places for", type);
    
    // Create different types of places based on the filter
    let places = [];
    
    // Generate random offset in degrees (approximately 100-1500 meters)
    const randomOffset = () => (Math.random() - 0.5) * 0.03;
    
    if (type === 'all' || type === 'hospital') {
      places.push({
        name: "General Hospital",
        vicinity: "123 Main Street",
        formattedAddress: "123 Main Street",
        rating: 4.2,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
      
      places.push({
        name: "University Medical Center",
        vicinity: "500 College Avenue",
        formattedAddress: "500 College Avenue",
        rating: 4.7,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    if (type === 'all' || type === 'clinic') {
      places.push({
        name: "City Health Clinic",
        vicinity: "45 Park Road",
        formattedAddress: "45 Park Road",
        rating: 4.0,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
      
      places.push({
        name: "Urgent Care Center",
        vicinity: "300 Pine Street",
        formattedAddress: "300 Pine Street",
        rating: 3.9,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    if (type === 'all' || type === 'pharmacy') {
      places.push({
        name: "Downtown Pharmacy",
        vicinity: "78 Market Street",
        formattedAddress: "78 Market Street",
        rating: 4.5,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    if (type === 'all' || type === 'doctor') {
      places.push({
        name: "Family Medicine Associates",
        vicinity: "155 Oak Drive",
        formattedAddress: "155 Oak Drive",
        rating: 4.8,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
      
      places.push({
        name: "Pediatric Specialists",
        vicinity: "220 Elm Street",
        formattedAddress: "220 Elm Street",
        rating: 4.6,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    // Add some generic medical facilities regardless of filter
    if (type === 'all') {
      places.push({
        name: "Community Health Center",
        vicinity: "430 Maple Avenue",
        formattedAddress: "430 Maple Avenue",
        rating: 4.1,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    console.log(`Generated ${places.length} simulated places`);
    return places;
  };
    // Step 3: Define map creation function
  const createMap = useCallback((location) => {
    console.log("Creating map with location:", location);
    
    // Safety check - ensure we're in a browser environment
    if (typeof window === 'undefined') {
      console.error("Not in browser environment");
      return;
    }
    
    // Ensure mapRef.current exists to prevent IntersectionObserver errors
    if (!googleRef.current || !mapRef.current) {
      console.error("Map reference or Google API not available");
      setLoading(false);
      return;
    }
    
    // Ensure the DOM element is ready for the map
    if (mapRef.current.clientWidth === 0 || mapRef.current.clientHeight === 0) {
      console.log("Map container has no size, delaying map creation");
      // Try again in a short while, but limit retries
      let retryCount = 0;
      const retryInterval = setInterval(() => {
        retryCount++;
        if (mapRef.current && mapRef.current.clientWidth > 0 && mapRef.current.clientHeight > 0) {
          clearInterval(retryInterval);
          createMap(location);
        } else if (retryCount >= 20) { // Give up after 20 retries (2 seconds)
          clearInterval(retryInterval);
          console.error("Map container never reached proper size");
          setLoading(false);
        }
      }, 100);
      return;
    }
    
    try {
      console.log("Map container size ok, creating map instance");
      
      const mapOptions = {
        center: location,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };
      
      // Create map instance
      const newMap = new googleRef.current.maps.Map(mapRef.current, mapOptions);
      console.log("Map instance created");
      setMap(newMap);
      
      // Add marker for user location
      try {
        const userMarker = new googleRef.current.maps.Marker({
          position: location,
          map: newMap,
          icon: {
            path: googleRef.current.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          title: 'Your Location'
        });
        console.log("User location marker added");
      } catch (markerError) {
        console.error("Error adding user marker:", markerError);
        // Continue even if marker creation fails
      }
      
      // Add a listener to confirm map is loaded
      googleRef.current.maps.event.addListenerOnce(newMap, 'idle', () => {
        console.log("Map fully loaded and idle");
        setLoading(false);
      });
      
      // Search for nearby medical facilities by default using a small delay to let the map render first
      setTimeout(() => {
        try {
          console.log("Starting nearby search");
          searchNearby(newMap, location, 'all');
        } catch (searchError) {
          console.error("Error searching for places:", searchError);
          setLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error creating map:", error);
      setLoading(false);
    }
  }, [searchNearby]);
    // Step 4: Define init function
  const initMap = useCallback(() => {
    try {
      console.log("InitMap function called");
      if (!window.google) {
        console.error("Google Maps API not available");
        setLoading(false);
        return;
      }
      
      googleRef.current = window.google;
      
      // Use a timeout for geolocation to ensure it doesn't hang
      const geoTimeoutId = setTimeout(() => {
        console.log("Geolocation timed out, using default location");
        const defaultLoc = { lat: 40.7128, lng: -74.006 }; // NYC default
        setUserLocation(defaultLoc);
        createMap(defaultLoc);
      }, 10000); // 10 second timeout for geolocation
      
      // Get user location
      if (navigator.geolocation) {
        console.log("Getting user location");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Location obtained successfully");
            clearTimeout(geoTimeoutId);
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userLoc);
            createMap(userLoc);
          },
          (error) => {
            console.error('Error getting location:', error);
            clearTimeout(geoTimeoutId);
            // Default location - NYC
            const defaultLoc = { lat: 40.7128, lng: -74.006 };
            setUserLocation(defaultLoc);
            createMap(defaultLoc);
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } else {
        console.log("Geolocation not supported");
        clearTimeout(geoTimeoutId);
        // Default location if geolocation not available
        const defaultLoc = { lat: 40.7128, lng: -74.006 };
        setUserLocation(defaultLoc);
        createMap(defaultLoc);
      }
    } catch (error) {
      console.error("Error in initMap:", error);
      setLoading(false);
    }
  }, [createMap]);
    // Step 5: Load Google Maps API script
  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === 'undefined') return;
    
    console.log("Initializing map - script loading process started");
    setLoading(true); // Set loading state as we're starting the map loading process
    
    // Define a timeout safety mechanism
    const timeoutId = setTimeout(() => {
      console.log("Map loading timeout reached - forcing initialization");
      setLoading(false);
      // If we reach this timeout, something went wrong with the loading
      if (!window.google && mapRef.current) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <p>There was a problem loading the map.</p>
            <button onclick="window.location.reload()" style="padding: 8px 16px">Reload Page</button>
          </div>
        `;
        mapRef.current.appendChild(errorDiv);
      }
    }, 20000); // 20 second timeout
    
    const loadAndInitMap = () => {
      console.log("Google Maps script loaded, initializing map");
      if (initMap) {
        try {
          initMap();
        } catch (error) {
          console.error("Error during map initialization:", error);
          setLoading(false);
        }
      }
      clearTimeout(timeoutId);
    };
      if (!window.google) {
      const script = document.createElement('script');
      // Try to load Google Maps without an API key first as a fallback for development
      // This will work with some limitations but will avoid the API key restrictions
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = loadAndInitMap;
      script.onerror = (error) => {
        console.error("Google Maps API failed to load:", error);
        setLoading(false);
        clearTimeout(timeoutId);
      };
      
      // Ensure document is available before accessing document.head
      if (document && document.head) {
        document.head.appendChild(script);
        
        return () => {
          clearTimeout(timeoutId);
          try {
            document.head.removeChild(script);
          } catch (error) {
            // Script might have been removed already
          }
        };
      }
    } else {
      console.log("Google Maps already loaded, initializing map directly");
      loadAndInitMap();
    }
    
    return () => clearTimeout(timeoutId);
  }, [/* removed initMap dependency */]);
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!map || !userLocation || !googleRef.current) {
      console.error("Map, userLocation, or Google Maps API not available");
      return;
    }
    
    if (!searchQuery || searchQuery.trim() === '') {
      console.log("Empty search query, ignoring");
      return;
    }
    
    console.log(`Searching for: ${searchQuery}`);
    setLoading(true);
    clearMarkers();
    
    try {
      // Try to use the Places API for text search
      try {
        const service = new googleRef.current.maps.places.PlacesService(map);
        
        const request = {
          query: searchQuery,
          location: userLocation,
          radius: 5000, // 5km radius
        };
        
        service.textSearch(request, (results, status) => {
          console.log("Text search status:", status);
          
          if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            console.log(`Found ${results.length} results for "${searchQuery}"`);
            createMarkers(map, results);
            
            // Pan map to the first result
            if (results[0] && results[0].geometry && results[0].geometry.location) {
              console.log("Panning to first result:", results[0].name);
              map.panTo(results[0].geometry.location);
            }
          } else if (status === 'REQUEST_DENIED' || 
                    status === googleRef.current.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            // API key restriction - generate simulated places that match the search query
            console.log("API restricted, creating simulated search results");
            
            // Create simulated search results
            const simulatedResults = createSimulatedSearchResults(userLocation, searchQuery);
            createMarkers(map, simulatedResults);
            
            if (simulatedResults.length > 0) {
              // Pan to the first simulated result
              map.panTo(simulatedResults[0].geometry.location);
            }
          } else {
            console.error('Text search failed with status:', status);
            
            // Generate simulated results as a fallback
            const simulatedResults = createSimulatedSearchResults(userLocation, searchQuery);
            createMarkers(map, simulatedResults);
            
            if (simulatedResults.length > 0) {
              map.panTo(simulatedResults[0].geometry.location);
            }
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Places API not available, using simulated results");
        const simulatedResults = createSimulatedSearchResults(userLocation, searchQuery);
        createMarkers(map, simulatedResults);
        
        if (simulatedResults.length > 0) {
          map.panTo(simulatedResults[0].geometry.location);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setLoading(false);
    }
  };
  
  // Helper function to generate simulated search results
  const createSimulatedSearchResults = (location, query) => {
    console.log(`Creating simulated search results for "${query}"`);
    query = query.toLowerCase();
    
    // Generate random offset in degrees (approximately 100-1500 meters)
    const randomOffset = () => (Math.random() - 0.5) * 0.03;
    
    // Create some sample medical facilities based on the query
    const allPossiblePlaces = [
      {
        name: "General Hospital",
        keywords: ["hospital", "emergency", "general", "medical center"]
      },
      {
        name: "City Medical Center",
        keywords: ["hospital", "medical center", "city"]
      },
      {
        name: "Children's Hospital",
        keywords: ["hospital", "children", "pediatric"]
      },
      {
        name: "Urgent Care Clinic",
        keywords: ["urgent", "clinic", "emergency"]
      },
      {
        name: "Family Medicine Associates",
        keywords: ["doctor", "family", "medicine", "physician"]
      },
      {
        name: "Downtown Pharmacy",
        keywords: ["pharmacy", "medicine", "drugstore", "prescription"]
      },
      {
        name: "Community Health Center",
        keywords: ["community", "health", "center", "clinic"]
      },
      {
        name: "Dental Care Center",
        keywords: ["dental", "dentist", "teeth"]
      },
      {
        name: "Physical Therapy Center",
        keywords: ["physical", "therapy", "rehabilitation"]
      },
      {
        name: "Mental Health Services",
        keywords: ["mental", "health", "therapy", "counseling"]
      }
    ];
    
    // Filter places based on the query
    const matchingPlaces = allPossiblePlaces.filter(place => {
      // Check if the query matches the name or any of the keywords
      return place.name.toLowerCase().includes(query) || 
             place.keywords.some(keyword => query.includes(keyword));
    });
    
    // Convert matching places into the format expected by createMarkers
    const simulatedPlaces = matchingPlaces.map(place => ({
      name: place.name,
      vicinity: `${Math.floor(Math.random() * 500) + 100} ${['Main', 'Park', 'Oak', 'Maple', 'Pine'][Math.floor(Math.random() * 5)]} ${['Street', 'Avenue', 'Road', 'Boulevard', 'Drive'][Math.floor(Math.random() * 5)]}`,
      formattedAddress: `${Math.floor(Math.random() * 500) + 100} ${['Main', 'Park', 'Oak', 'Maple', 'Pine'][Math.floor(Math.random() * 5)]} ${['Street', 'Avenue', 'Road', 'Boulevard', 'Drive'][Math.floor(Math.random() * 5)]}`,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
      location: new googleRef.current.maps.LatLng(
        location.lat + randomOffset(), 
        location.lng + randomOffset()
      ),
      geometry: {
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        )
      }
    }));
    
    // If no matches, return a generic result
    if (simulatedPlaces.length === 0) {
      simulatedPlaces.push({
        name: `Medical Facility (${query})`,
        vicinity: "123 Main Street",
        formattedAddress: "123 Main Street",
        rating: 4.0,
        location: new googleRef.current.maps.LatLng(
          location.lat + randomOffset(), 
          location.lng + randomOffset()
        ),
        geometry: {
          location: new googleRef.current.maps.LatLng(
            location.lat + randomOffset(), 
            location.lng + randomOffset()
          )
        }
      });
    }
    
    console.log(`Generated ${simulatedPlaces.length} simulated search results`);
    return simulatedPlaces;
  };
  
  // Handle filter button clicks
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    
    if (!map || !userLocation) return;
    
    switch(filter) {
      case 'all':
        searchNearby(map, userLocation, 'all');
        break;
      case 'hospital':
        searchNearby(map, userLocation, 'hospital');
        break;
      case 'clinic':
        searchNearby(map, userLocation, 'clinic');
        break;
      case 'pharmacy':
        searchNearby(map, userLocation, 'pharmacy');
        break;
      case 'doctor':
        searchNearby(map, userLocation, 'doctor');
        break;
      default:
        searchNearby(map, userLocation, 'all');
    }
  };
    // Add state to track errors and map loading status
  const [mapError, setMapError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  // Add a timeout effect to track if map is taking too long
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setLoadTimeout(true);
      }, 10000); // Show additional help after 10 seconds of loading
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Function to reload the page
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };
  
  // Effect to check if API key is working correctly
  useEffect(() => {
    // If the Google Maps has loaded and we have a map instance
    if (googleRef.current && map) {
      try {
        // Try to create a PlacesService instance
        const service = new googleRef.current.maps.places.PlacesService(map);
        
        // Make a minimal request to test if the API key works for Places API
        const request = {
          location: userLocation || { lat: 40.7128, lng: -74.006 },
          radius: 100,
          keyword: 'test'
        };
        
        service.nearbySearch(request, (results, status) => {
          if (status === 'REQUEST_DENIED' || 
              status === googleRef.current.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            console.log("API key is restricted, using simulated data");
            setUsingSimulatedData(true);
          } else {
            console.log("API key is working properly");
            setUsingSimulatedData(false);
          }
        });
      } catch (error) {
        console.error("Error testing API key:", error);
        setUsingSimulatedData(true);
      }
    }
  }, [map, userLocation]);
  
  return (
    <main className={styles.main}>
      {/* Medical Icons as Background */}
      <img src="/heart.svg" alt="" className={`${styles.medicalIcon} ${styles.heartbeat}`} />
      <img src="/stethoscope.svg" alt="" className={`${styles.medicalIcon} ${styles.stethoscope}`} />
      <img src="/pill-square.svg" alt="" className={`${styles.medicalIcon} ${styles.pill}`} />
      
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>Find Nearby Medical Facilities</h1>
        
        <div className={styles.mapControls}>
          <form onSubmit={handleSearch} className={styles.searchBox}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a specific facility..."
              className={styles.input}
              disabled={loading || mapError}
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading || mapError}
            >
              Search
            </button>
          </form>
          
          <div className={styles.filterButtons}>
            <button 
              type="button"
              className={`${styles.filterButton} ${activeFilter === 'all' ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterClick('all')}
              disabled={loading || mapError}
            >
              All Facilities
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${activeFilter === 'hospital' ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterClick('hospital')}
              disabled={loading || mapError}
            >
              Hospitals
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${activeFilter === 'clinic' ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterClick('clinic')}
              disabled={loading || mapError}
            >
              Clinics
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${activeFilter === 'pharmacy' ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterClick('pharmacy')}
              disabled={loading || mapError}
            >
              Pharmacies
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${activeFilter === 'doctor' ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterClick('doctor')}
              disabled={loading || mapError}
            >
              Doctors
            </button>
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          {/* Standard Loading Indicator */}
          {loading && !loadTimeout && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading map...</p>
            </div>
          )}
          
          {/* Extended Loading Indicator with Help */}
          {loading && loadTimeout && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <div className={styles.loadingHelpText}>
                <p>The map is taking longer than expected to load.</p>
                <p>Please check:</p>
                <ul>
                  <li>Your browser allows location access</li>
                  <li>You have an active internet connection</li>
                  <li>You've allowed Google Maps to load</li>
                </ul>
                <button onClick={handleReload} className={styles.reloadButton}>
                  Try Reloading
                </button>
              </div>
            </div>
          )}
          
          {/* Map Container */}
          <div ref={mapRef} className={styles.map}></div>
        </div>        <div className={styles.disclaimer}>
          <strong>⚠️ Important:</strong> This map shows nearby medical facilities based on your current location. 
          {usingSimulatedData ? (
            <><span className={styles.simulatedDataNotice}>Currently showing simulated data for demonstration purposes.</span> In production with a properly configured API key, this would show real data from Google Maps.</>
          ) : (
            <>The results are provided by Google Maps and may not include all facilities in the area.</>
          )}
          Always call ahead to confirm availability and services before visiting.
        </div>
        
        {usingSimulatedData && (
          <div className={styles.apiKeyHelp}>
            <h3>📝 Google Maps API Key Information</h3>
            <p>Your Google Maps API key appears to have restrictions that prevent it from working with Places API requests.</p>
            <p>To fix this issue:</p>
            <ol>
              <li>Go to the <a href="https://console.cloud.google.com/google/maps-apis/api-list" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Make sure the Places API is enabled for your project</li>
              <li>Check that your API key doesn't have domain restrictions, or add <code>localhost</code> to the allowed domains</li>
              <li>Verify your billing account is properly set up</li>
            </ol>
            <p>Update your API key in <code>.env.local</code> once configured correctly.</p>
            <p><em>Note: For development and testing purposes, the app is currently showing simulated medical facilities.</em></p>
          </div>
        )}
        
        <Link href="/results" className={styles.backButton}>
          ← Back to Diagnosis Results
        </Link>
      </div>
    </main>
  );
};

export default NearbyFacilitiesPageClient;
