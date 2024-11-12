import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Checkbox, Divider } from 'react-native-paper';

const NewPoint = () => {
    const [name, setName] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [content, setContent] = useState('');
    const [timeStart, setTimeStart] = useState<any>(null);
    const [timeEnd, setTimeEnd] = useState<any>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isReady, setIsReady] = useState(false)

    const onChangeStartDate = (event: any, selectedDate: any) => {
        setShowStartPicker(false);
        if (selectedDate) {
            // Check if start date is greater than end date
            if (timeEnd && selectedDate > timeEnd) {
                Alert.alert("Error", "The start date cannot be later than the end date.");
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
                Alert.alert("Error", "The end date cannot be earlier than the start date.");
            } else {
                setTimeEnd(selectedDate);
            }
        }
    };

    useEffect(() => {
       if (name!=''&&longitude!=''&&latitude!=''&&content!=''&&timeEnd!=null&&timeStart!=null) {
         setIsReady(true)
       }
    }, [name,longitude,latitude,content,timeEnd,timeStart])
    return (
        <View style={styles.container}>
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


            {/* Date pickers for time */}
            <Text style={{ fontWeight: 'bold' }}>Start Date</Text>
            <Button mode="outlined" onPress={() => setShowStartPicker(true)}>
                {timeStart ? timeStart.toLocaleDateString() : "Select Start Date"}
            </Button>
            {showStartPicker && (
                <DateTimePicker
                    value={timeStart || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeStartDate}
                />
            )}

            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>End Date</Text>
            <Button mode="outlined" onPress={() => setShowEndPicker(true)}>
                {timeEnd ? timeEnd.toLocaleDateString() : "Select End Date"}
            </Button>
            {showEndPicker && (
                <DateTimePicker
                    value={timeEnd || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeEndDate}
                />
            )}
            {
        isReady && (
          <View style={styles.addBar}>
            <TouchableOpacity style={styles.addBtn} >
              <Text style={{ color: '#ffffff' }} >Save</Text>
            </TouchableOpacity>

          </View>
        )
      }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        height: "100%"
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 15,
    }, addBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginRight: 20,
      },
      addBtn: {
        backgroundColor: '#5E8C31',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: 20,
        borderRadius: 8,
      },
});


export default NewPoint