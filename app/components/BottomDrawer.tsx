import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import LocationMap from "./MapView";
import { deleteImage, fetchImages, initializeDatabase } from "../database";

type PhotoInfo = {
  id: number;
  uri: string;
  latitude: string;
  longitude: string;
  timestamp: string;
};
const BottomDrawer = ({
  openBottomSheet,
  selectedPhoto,
  closePhoto
}: {
  openBottomSheet: () => void;
  selectedPhoto: PhotoInfo | null;
  closePhoto: ()=> void
}) => {
  const slide = useRef(new Animated.Value(300)).current;

  const slideUp = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    Animated.timing(slide, {
      toValue: 300,
      duration: 500,
      useNativeDriver: true,
    }).start(() => openBottomSheet());
  };

  const handleDelete = async () => {
    const db = await initializeDatabase();
    if (selectedPhoto?.id !== undefined) {
      await deleteImage(db, selectedPhoto.id);
    }
    await fetchImages(db)
    slideDown()
    closePhoto()
  };

  useEffect(() => {
    slideUp();
  }, []);
  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={styles.backdrop} onPress={slideDown}>
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY: slide }] }]}
        >
          <View style={styles.tab} />
          <Text style={styles.headertext}>Image Details</Text>
          <View style={styles.mapContainer}>
            {selectedPhoto && (
              <LocationMap
                latitude={parseFloat(selectedPhoto.latitude)}
                longitude={parseFloat(selectedPhoto.longitude)}
              />
            )}
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete image</Text>
            <AntDesign name="delete" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default BottomDrawer;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    // zIndex: 5,
  },
  bottomSheet: {
    width: "100%",
    height: "40%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    // zIndex: 5,
  },
  deleteButton: {
    width: "50%",
    height: "10%",
    backgroundColor: "red",
    justifyContent: "center",
    flexDirection: "row",
    gap: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
  },
  deleteText: {
    color: "white",
    fontSize: 15,
    alignSelf: "center",
  },
  headertext: {
    fontSize: 20,
    textAlign: "center",
  },
  mapContainer: {
    backgroundColor: "black",
    width: "100%",
    height: "60%",
    marginTop: 10,
  },
  tab: {
    backgroundColor: "gray",
    width: "30%",
    height: 5,
    margin: 10,
    alignSelf: "center",
  },
});
