import { View, Text, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { Button, Checkbox, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const Information = () => {
  const [timeStart, setTimeStart] = useState<any>(null);
  const [timeEnd, setTimeEnd] = useState<any>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const statusOptions = ["Pending","Success", "Failure"];
  const typeOptions = ["Deduction", "Recharge"];
  const today = new Date();

  const handleSelect = (option:any, list:any, setList:any) => {
    setList((prev:any) => 
      prev.includes(option) ? prev.filter((item:any) => item !== option) : [...prev, option]
    );
  };

  const onChangeStartDate = (event:any, selectedDate:any) => {
    setShowStartPicker(false);
    if (selectedDate) {
      // Check if start date is greater than today
      if (selectedDate > today) {
        Alert.alert("Error", "The end date cannot be greater than today.");
      }
      // Check if start date is greater than end date
      else if (timeEnd && selectedDate > timeEnd) {
        Alert.alert("Error", "The start date cannot be later than the end date.");
      } else {
        setTimeStart(selectedDate);
      }
    }
  };

  const onChangeEndDate = (event:any, selectedDate:any) => {
    setShowEndPicker(false);
    
    if (selectedDate) {
      // Check if end date is greater than today
      if (selectedDate > today) {
        Alert.alert("Error", "The end date cannot be greater than today.");
      }
      // Check if end date is earlier than start date
      else if (timeStart && selectedDate < timeStart) {
        Alert.alert("Error", "The end date cannot be earlier than the start date.");
      } else {
        setTimeEnd(selectedDate);
      }
    }
  };

  return (
    <View style={{ padding: 5, width:'100%' }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Transaction Filter</Text>

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

      <Divider style={{ marginVertical: 10 }} />

      {/* Transaction Status */}
      <Text style={{ fontWeight: 'bold' }}>Transaction Status</Text>
      {statusOptions.map((option, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            status={selectedStatus.includes(option) ? 'checked' : 'unchecked'}
            onPress={() => handleSelect(option, selectedStatus, setSelectedStatus)}
          />
          <Text>{option}</Text>
        </View>
      ))}

      <Divider style={{ marginVertical: 10 }} />

      {/* Transaction Type */}
      <Text style={{ fontWeight: 'bold' }}>Transaction Type</Text>
      {typeOptions.map((option, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            status={selectedType.includes(option) ? 'checked' : 'unchecked'}
            onPress={() => handleSelect(option, selectedType, setSelectedType)}
          />
          <Text>{option}</Text>
        </View>
      ))}

      <Button
        mode="contained"
        style={{ marginTop: 20 }}
        onPress={() => console.log({
          timeStart,
          timeEnd,
          selectedStatus,
          selectedType,
        })}
      >
        Apply Filters
      </Button>
    </View>
  );
};

export default Information;
