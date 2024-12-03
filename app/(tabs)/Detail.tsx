import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "expo-router";
import { fetchImages, initializeDatabase } from "../database";

type PhotoInfo = {
  uri: string;
  latitude: string;
  longitude: string;
  timestamp: string;
};

const { width, height } = Dimensions.get("window");
const itemSize = width / 3;

const Detail = () => {
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoInfo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoInfo | null>(null);
  const navigation = useNavigation();

  const loadSavedPhotos = useCallback(async () => {
    try {
      const db = await initializeDatabase();
      const results = await fetchImages(db);
      setCapturedPhotos(results);
    } catch (error) {
      console.log("Failed to load photos:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSavedPhotos();
    });
    return unsubscribe;
  }, [navigation, loadSavedPhotos]);

  const openPhoto = (photo: PhotoInfo) => {
    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const renderPhoto = ({ item }: { item: PhotoInfo }) => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => openPhoto(item)}>
        <Image style={styles.photo} source={{ uri: item.uri }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {capturedPhotos.length > 0 ? (
        <FlatList
          data={capturedPhotos}
          renderItem={renderPhoto} 
          keyExtractor={(item, index) => index.toString()}
          numColumns={3} 
        />
      ) : (
        <Text style={styles.noPhotosText}>No photos have been captured yet</Text>
      )}
      {selectedPhoto && (
        <Modal
          visible={selectedPhoto !== null}
          transparent={false}
          animationType="fade"
          onRequestClose={closePhoto}
        >
          <SafeAreaView style={styles.fullScreenContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
              <Text style={styles.closeButtonText}>x</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.fullScreenPhoto}
              resizeMode="contain"
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    width: itemSize,
    height: itemSize,
    padding: 2,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  noPhotosText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenPhoto: {
    width: width,
    height: height,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
    fontSize: 36,
  },
});
