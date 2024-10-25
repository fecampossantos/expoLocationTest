import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import * as Location from "expo-location";

function calculateDistanceInKmBetweenCoordinates(
  coords1: Location.LocationObjectCoords,
  coords2: Location.LocationObjectCoords
) {
  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function kmhToMinPerKm(speedKmh: number) {
  if (speedKmh === 0) return 0; // Handle division by zero
  return 60 / speedKmh;
}

function Index() {
  const [startLocation, setStartLocation] = useState<Location.LocationObject>();

  const [previousLocation, setPreviousLocation] =
    useState<Location.LocationObject>();
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject>();
  const [currentPace, setCurrentPace] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  useEffect(() => {
    (async () => {
      let locationAtStart = await Location.getCurrentPositionAsync();
      setStartLocation(locationAtStart);
      setCurrentLocation(locationAtStart);
      setPreviousLocation(locationAtStart);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const interval = setInterval(async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }
        const newLocation = await Location.getCurrentPositionAsync();
        setCurrentLocation(newLocation);
      }, 1000);

      return () => clearInterval(interval); // Clean up the interval on unmount
    })();
  }, []);

  useEffect(() => {
    if (!previousLocation || !currentLocation) return;
    (async () => {
      const distanceDelta = calculateDistanceInKmBetweenCoordinates(
        previousLocation.coords,
        currentLocation.coords
      );

      if (distanceDelta < 0.001) return;

      let speed = (currentLocation.coords.speed || 0) * 3.6;
      speed = speed >= 1 ? speed : 0;
      setCurrentSpeed(speed);
      setCurrentPace(kmhToMinPerKm(speed));

      setDistance((prevDistance) => {
        return prevDistance + distanceDelta;
      });
    })();
  }, [currentLocation]);

  return (
    <View>
      <Text>Current pace: {currentPace.toFixed(2)}''</Text>
      <Text>Distance: {distance.toFixed(2)} km</Text>
      <Text>Speed: {currentSpeed.toFixed(2)} km/h</Text>
    </View>
  );
}

export default Index;
