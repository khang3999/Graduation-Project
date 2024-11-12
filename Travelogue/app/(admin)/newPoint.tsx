import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import IconA from "react-native-vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Button, Checkbox, Divider, RadioButton } from "react-native-paper";
import Toast from "react-native-toast-message-custom";
import { RowComponent } from "@/components";

const NewPoint = () => {
  const festivalTypeOptions = [
    {
      id: "festival",
      label: "Lễ hội",
      type: "festival",
    },
    {
      id: "landmark",
      label: "Danh lam",
      type: "landmark",
    },
  ];
  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [content, setContent] = useState("");
  const [timeStart, setTimeStart] = useState<any>(null);
  const [timeEnd, setTimeEnd] = useState<any>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [defaultImages, setDefaultImages] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("festival");

  const onChangeStartDate = (event: any, selectedDate: any) => {
    setShowStartPicker(false);
    if (selectedDate) {
      // Check if start date is greater than end date
      if (timeEnd && selectedDate > timeEnd) {
        Alert.alert(
          "Error",
          "The start date cannot be later than the end date."
        );
      } else {
        setTimeStart(selectedDate);
      }
    }
  };

  const onChangeEndDate = (event: any, selectedDate: any) => {
    setShowEndPicker(false);

    if (selectedDate) {
      // Check if end date is earlier than start date
      if (timeStart && selectedDate < timeStart) {
        Alert.alert(
          "Error",
          "The end date cannot be earlier than the start date."
        );
      } else {
        setTimeEnd(selectedDate);
      }
    }
  };

  useEffect(() => {
    if (
      name != "" &&
      longitude != "" &&
      latitude != "" &&
      content != "" &&
      timeEnd != null &&
      timeStart != null
    ) {
      setIsReady(true);
    }
  }, [name, longitude, latitude, content, timeEnd, timeStart]);

  //Xóa ảnh
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...defaultImages];
    updatedImages.splice(index, 1);
    setDefaultImages(updatedImages);
  };
  //Upload anh
  const handleChooseImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((item) => item.uri);
      setDefaultImages([...selectedUris, ...defaultImages]);
    }
  };

  return (
    <View style={styles.container}>
    <ScrollView  >
      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Longitude</Text>
      <TextInput
        placeholder="Enter longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Latitude</Text>
      <TextInput
        placeholder="Enter latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Content</Text>
      <TextInput
        placeholder="Enter content"
        value={content}
        numberOfLines={4}
        onChangeText={setContent}
        style={styles.input}
      />
      <Text style={styles.label}>Select Type</Text>
      <RadioButton.Group
        onValueChange={(newValue) => setSelectedOption(newValue)}
        value={selectedOption}
      >
        {festivalTypeOptions.map((option) => (
          <View key={option.id} style={styles.radioItem}>
            <RadioButton value={option.type} />
            <Text style={styles.radioLabel}>{option.label}</Text>
          </View>
        ))}
      </RadioButton.Group>

      <Text style={styles.label}>Thêm ảnh</Text>
      {defaultImages ? (
        <View>
          <RowComponent>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={() => {
                  handleChooseImages();
                }}
              >
                <Image
                  source={require("../../assets/images/addImage.png")}
                  style={[styles.festivalImage, { marginRight: 10 }]}
                />
              </TouchableOpacity>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ maxHeight: 130 }}
              >
                {defaultImages.map((imageUri, index) => (
                  <View key={index}>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.festivalImage,
                        {
                          width: 100,
                          height: 100,
                          marginRight: 5,
                          resizeMode: "cover",
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <IconA name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </RowComponent>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            handleChooseImages();
          }}
        >
          <Image
            source={require("../../assets/images/addImage.png")}
            style={[styles.festivalImage]}
          />
        </TouchableOpacity>
      )}

      {/* Date pickers for time */}
      <Text style={{ fontWeight: "bold" }}>Start Date</Text>
      <Button mode="outlined" onPress={() => setShowStartPicker(true)}>
        {timeStart ? timeStart.toLocaleDateString() : "Select Start Date"}
      </Button>
      {showStartPicker && (
        <DateTimePicker
          value={timeStart || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeStartDate}
        />
      )}

      <Text style={{ fontWeight: "bold", marginTop: 10 }}>End Date</Text>
      <Button mode="outlined" onPress={() => setShowEndPicker(true)}>
        {timeEnd ? timeEnd.toLocaleDateString() : "Select End Date"}
      </Button>
      {showEndPicker && (
        <DateTimePicker
          value={timeEnd || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeEndDate}
        />
      )}
      {isReady && (
        <View style={styles.addBar}>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={{ color: "#ffffff" }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    height: "100%",
  },
  festivalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 15,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  addBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginRight: 20,
  },
  addBtn: {
    backgroundColor: "#5E8C31",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 20,
    borderRadius: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default NewPoint;
