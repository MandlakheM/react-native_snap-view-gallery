import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { addImage, fetchImages, initializeDatabase } from "../database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
const Camera = () => {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [zoom, setZoom] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ uri: string | null}>>(
    []
  );
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = useCallback(async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem("capturedPhotos");
      if (savedPhotos) {
        setCapturedPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.log("Failed to load photos: ", error);
    }
  }, []);

  const savedPhoto = useCallback(
    async (newPhoto: { uri: string }) => {
      try {
        const updatedPhotos = [newPhoto, ...capturedPhotos];
        await AsyncStorage.setItem(
          "capturedPhotos",
          JSON.stringify(updatedPhotos)
        );
        setCapturedPhotos(updatedPhotos);
      } catch (error) {
        console.log("Failed to save the photo: ", error);
      }
    },
    [capturedPhotos]
  );

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const takePic = useCallback(async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });

      // await savedPhoto({ uri: photo.uri });

      // console.log(photo.uri)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const db = await initializeDatabase();

      if (photo?.uri) {
        await addImage(
          db,
          photo.uri,
          new Date().toISOString(),
          latitude.toString(),
          longitude.toString()
        );
      } else {
        console.error("Photo URI is undefined");
      }
      const images = await fetchImages(db);
      console.log(images);
    }
  }, [savedPhoto]);

  if (!permission) {
    <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          snap view needs you to grant camera permissions to use this app
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        zoom={zoom}
      />
      <View style={styles.controlsContainer}>
        <View style={styles.sliderRow}>
          <Text style={styles.text}>Zoom: {zoom.toFixed(1)}x</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={handleZoomChange}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={takePic} style={styles.recordButton}>
            <View style={styles.redCircle} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraFacing}>
            {/* <Text style={styles.buttonText}>flip</Text> */}
            <MaterialIcons name="loop" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.09)",
  },
  redCircle: {
    backgroundColor: "orangered",
    width: 40,
    height: 45,
    borderRadius: 20,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "gray",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  row: {
    width: "75%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 20,
    // backgroundColor:'black',
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
  },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    marginLeft: 10,
    alignSelf: "center",
  },
  text: {
    color: "white",
  },
});
