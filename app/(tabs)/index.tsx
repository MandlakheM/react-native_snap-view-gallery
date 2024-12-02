import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Camera = () => {
  const [facing, setFacing] = useState<"back" | "front">("front");
  const [zoom, setZoom] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ uri: string }>>(
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
      await savedPhoto({ uri: photo.uri });
    }
  }, [savedPhoto]);

  if (!permission) {
    <View />;
  }

  if (!permission?.granted) {
    return (
      <View>
        <Text>
          snap view needs you to grant camera permissions to use this app
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>grant permission</Text>
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
      <View style={styles.controllsContainer}>
        <TouchableOpacity onPress={toggleCameraFacing}>
          <Text>flip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePic} style={styles.recordButton}>
          <View style={styles.redCircle} />
        </TouchableOpacity>
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
  controllsContainer: {
    justifyContent: "center",
    alignContent: "center",
    width: "100%",
    // backgroundColor: "red"
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
    top: -25,
  },
});
