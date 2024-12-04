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
import {
  fetchImages,
  fetchImagesByDate,
  initializeDatabase,
} from "../database";
import BottomDrawer from "../components/BottomDrawer";
import { Picker } from "@react-native-picker/picker";

type PhotoInfo = {
  id: number;
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
  const [bottomSheet, setBottomSheet] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const navigation = useNavigation();

  const loadSavedPhotos = useCallback(async () => {
    try {
      const db = await initializeDatabase();
      const results = await fetchImages(db);
      setCapturedPhotos(results);
    } catch (error) {
      console.log("Failed to load photos:", error);
    }
  }, [capturedPhotos]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSavedPhotos();
    });
    return unsubscribe;
  }, [navigation, loadSavedPhotos]);

  const handleSearch = async () => {
    if (!selectedMonth || !selectedDay) {
      alert("Please select both month and day!");
      return;
    }
    try {
      const db = await initializeDatabase();
      const filteredPhotos = await fetchImagesByDate(
        db,
        selectedMonth,
        selectedDay
      );
      setCapturedPhotos(filteredPhotos);
    } catch (error) {
      console.error("Failed to filter photos:", error);
    }
  };

  const openPhoto = (photo: PhotoInfo) => {
    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const openBottomSheet = () => {
    setBottomSheet(!bottomSheet);
  };

  const renderPhoto = ({ item }: { item: PhotoInfo }) => {
    return (
      <>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            openPhoto(item);
          }}
        >
          <Image style={styles.photo} source={{ uri: item.uri }} />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          <Picker.Item label="Month" value="" />
          {[...Array(12).keys()].map((month) => (
            <Picker.Item
              key={month + 1}
              label={`${month + 1}`}
              value={(month + 1).toString().padStart(2, "0")}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedDay}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDay(itemValue)}
        >
          <Picker.Item label="Day" value="" />
          {[...Array(31).keys()].map((day) => (
            <Picker.Item
              key={day + 1}
              label={`day + 1`}
              value={(day + 1).toString().padStart(2, "0")}
            />
          ))}
        </Picker>
        <TouchableOpacity
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 5,
            margin: 10,
          }}
          onPress={handleSearch}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Search</Text>
        </TouchableOpacity>
      </View>
      {capturedPhotos ? (
        <FlatList
          data={capturedPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      ) : (
        <Text style={styles.noPhotosText}>
          No photos have been captured yet
        </Text>
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
            <TouchableOpacity onPress={openBottomSheet}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {bottomSheet && (
              <BottomDrawer
                openBottomSheet={openBottomSheet}
                selectedPhoto={selectedPhoto}
                closePhoto={closePhoto}
              />
            )}
          </SafeAreaView>
        </Modal>
      )}
      {/* {bottomSheet && <BottomDrawer />} */}
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
    marginTop: 100,
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
  picker: { height: 60, width: 150 },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 10,
  },
});
