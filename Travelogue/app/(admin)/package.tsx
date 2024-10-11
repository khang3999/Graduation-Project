// import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
// import React, { useState } from 'react';

// interface Package {
//   id: string;
//   price: string;
//   minAccumulated: string;
//   factor: string;
// }

// // Danh sách ban đầu
// const initialPackages: Package[] = [
//   { id: '1', price: '10000', minAccumulated: '123000', factor: '1' },
//   { id: '2', price: '20000', minAccumulated: '456000', factor: '2' },
//   { id: '3', price: '30000', minAccumulated: '789000', factor: '3' },
//   { id: '4', price: '40000', minAccumulated: '912000', factor: '4' },
// ];

// // Component hiển thị từng mục (item)
// const addItem = ({ item }: { item: Package }) => {
//   return (
//     <View>
//       <Text style={styles.category}>Pack {item.id}</Text>
//       {/* Price */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Price</Text>
//         <TextInput style={styles.input} value={item.price} editable={false} />
//       </View>
//       {/* Min Accumulated */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Min Accumulated</Text>
//         <TextInput style={styles.input} value={item.minAccumulated} editable={false} />
//       </View>
//       {/* Factor */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Factor</Text>
//         <TextInput style={styles.input} value={item.factor} editable={false} />
//       </View>
//       {/* Buttons */}
//       <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
//         <TouchableOpacity style={styles.approveBtn}>
//           <Text style={styles.approveText}>Save</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.line} />
//     </View>
//   );
// };

// // Component chính
// const PackageComponent = () => {
//   // Quản lý state của các package
//   const [packages, setPackages] = useState<Package[]>(initialPackages);

//   // Hàm thêm package mới
//   const handleAddPackage = () => {
//     const newId = (packages.length + 1).toString();
//     const newPackage = { id: newId, price: '0', minAccumulated: '0', factor: '1' };
//     setPackages([...packages, newPackage]); // Thêm gói mới vào danh sách
//   };

//   return (
//     <View>
//       {/* Nút Add */}
//       <View style={styles.addBar}>
//         <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
//           <Text style={{ color: '#ffffff' }}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Danh sách các gói */}
//       <View style={{ marginVertical: 30, marginBottom: 100 }}>
//         {packages.length > 0 ? (
//           <FlatList
//             data={packages}
//             keyExtractor={(item) => item.id}
//             renderItem={addItem}
//           />
//         ) : (
//           <Text>No package</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   addBar: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 20,
//     marginRight: 20,
//   },
//   addBtn: {
//     backgroundColor: '#5E8C31',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginLeft: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   line: {
//     height: 1,
//     backgroundColor: '#d3d3d3',
//     marginHorizontal: 20,
//     marginVertical: 30,
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   category: {
//     fontSize: 18,
//     fontStyle: 'italic',
//     marginLeft: 20,
//     fontWeight: '500',
//   },
//   title: {
//     fontSize: 14,
//     padding: 20,
//     marginLeft: 25,
//     flex: 3,
//     color: '#444444',
//   },
//   input: {
//     height: 35,
//     borderColor: 'gray',
//     borderWidth: 1,
//     paddingHorizontal: 20,
//     marginHorizontal: 20,
//     borderRadius: 10,
//     flex: 2,
//   },
//   approveBtn: {
//     backgroundColor: '#2986cc',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     width: 100,
//     marginTop: 10,
//     justifyContent: 'center',
//   },
//   approveText: {
//     color: '#ffffff',
//     textAlign: 'center',
//     fontSize: 20,
//   },
// });

// export default PackageComponent;

// // Cach 2
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
// import React, { useState } from 'react';

// interface Package {
//   id: string;
//   price: string;
//   minAccumulated: string;
//   factor: string;
// }

// // Danh sách ban đầu
// const initialPackages: Package[] = [
//   { id: '1', price: '10000', minAccumulated: '123000', factor: '1' },
//   { id: '2', price: '20000', minAccumulated: '456000', factor: '2' },
//   { id: '3', price: '30000', minAccumulated: '789000', factor: '3' },
//   { id: '4', price: '40000', minAccumulated: '912000', factor: '4' },
// ];

// const PackageComponent = () => {
//   const [packages, setPackages] = useState<Package[]>(initialPackages);
//   const [newPackage, setNewPackage] = useState<Package | null>(null);

//   const handleAddPackage = () => {
//     const newId = (packages.length + 1).toString();
//     const newPackageData = { id: newId, price: '0', minAccumulated: '0', factor: '1' };
//     setNewPackage(newPackageData);
//   };

//   const handleSavePackage = () => {
//     if (newPackage) {
//       setPackages([...packages, newPackage]);
//       setNewPackage(null);
//     }
//   };

//   const renderItem = (item: Package) => {
//     return (
//       <View key={item.id}>
//         <Text style={styles.category}>Pack {item.id}</Text>
//         {/* Price */}
//         <View style={styles.item}>
//           <Text style={styles.title}>Price</Text>
//           <TextInput style={styles.input} value={item.price} editable={false} />
//         </View>
//         {/* Min Accumulated */}
//         <View style={styles.item}>
//           <Text style={styles.title}>Min Accumulated</Text>
//           <TextInput style={styles.input} value={item.minAccumulated} editable={false} />
//         </View>
//         {/* Factor */}
//         <View style={styles.item}>
//           <Text style={styles.title}>Factor</Text>
//           <TextInput style={styles.input} value={item.factor} editable={false} />
//         </View>
//         <View style={styles.line} />
//       </View>
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.addBar}>
//         <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
//           <Text style={{ color: '#ffffff' }}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Cuộn qua danh sách */}
//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={styles.scrollContainer}>
//         {packages.map((pkg) => renderItem(pkg))}

//         {/* Gói tạm thời */}
//         {newPackage && (
//           <View>
//             <Text style={styles.category}>New Pack {newPackage.id}</Text>
//             {/* Price */}
//             <View style={styles.item}>
//               <Text style={styles.title}>Price</Text>
//               <TextInput
//                 style={styles.input}
//                 value={newPackage.price}
//                 onChangeText={(text) =>
//                   setNewPackage({ ...newPackage, price: text })
//                 }
//               />
//             </View>
//             {/* Min Accumulated */}
//             <View style={styles.item}>
//               <Text style={styles.title}>Min Accumulated</Text>
//               <TextInput
//                 style={styles.input}
//                 value={newPackage.minAccumulated}
//                 onChangeText={(text) =>
//                   setNewPackage({ ...newPackage, minAccumulated: text })
//                 }
//               />
//             </View>
//             {/* Factor */}
//             <View style={styles.item}>
//               <Text style={styles.title}>Factor</Text>
//               <TextInput
//                 style={styles.input}
//                 value={newPackage.factor}
//                 onChangeText={(text) =>
//                   setNewPackage({ ...newPackage, factor: text })
//                 }
//               />
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* Nút Save cố định */}
//       {newPackage && (
//         <View style={styles.saveContainer}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleSavePackage}>
//             <Text style={styles.approveText}>Save</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   scrollContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   addBar: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 20,
//     marginRight: 20,
//   },
//   addBtn: {
//     backgroundColor: '#5E8C31',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginLeft: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   line: {
//     height: 1,
//     backgroundColor: '#d3d3d3',
//     marginHorizontal: 20,
//     marginVertical: 30,
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   category: {
//     fontSize: 18,
//     fontStyle: 'italic',
//     marginLeft: 20,
//     fontWeight: '500',
//   },
//   title: {
//     fontSize: 14,
//     padding: 20,
//     marginLeft: 25,
//     flex: 3,
//     color: '#444444',
//   },
//   input: {
//     height: 35,
//     borderColor: 'gray',
//     borderWidth: 1,
//     paddingHorizontal: 20,
//     marginHorizontal: 20,
//     borderRadius: 10,
//     flex: 2,
//   },
//   approveBtn: {
//     backgroundColor: '#2986cc',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     width: 100,
//     justifyContent: 'center',
//   },
//   approveText: {
//     color: '#ffffff',
//     textAlign: 'center',
//     fontSize: 20,
//   },
//   saveContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// Cach 3
// export default PackageComponent;
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { useNavigation } from '@react-navigation/native';

// interface Package {
//   id: string;
//   price: string;
//   minAccumulated: string;
//   factor: string;
//   isSaved: boolean; // Biến để xác định gói đã được lưu hay chưa
// }

// // Danh sách ban đầu
// const initialPackages: Package[] = [
//   { id: '1', price: '10000', minAccumulated: '123000', factor: '1', isSaved: true },
//   { id: '2', price: '20000', minAccumulated: '456000', factor: '2', isSaved: true },
//   { id: '3', price: '30000', minAccumulated: '789000', factor: '3', isSaved: true },
//   { id: '4', price: '40000', minAccumulated: '912000', factor: '4', isSaved: true },
// ];

// const PackageComponent = () => {
//   const [packages, setPackages] = useState<Package[]>(initialPackages);
//   const [newPackages, setNewPackages] = useState<Package[]>([]);
//   const navigation = useNavigation();

//   // Khi di chuyển sang màn hình khác, xóa các gói chưa được lưu
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('blur', () => {
//       setNewPackages([]); // Xóa tất cả các gói chưa lưu
//     });

//     return unsubscribe;
//   }, [navigation]);

//   // Hàm thêm gói mới
//   const handleAddPackage = () => {
//     const newId = (packages.length + newPackages.length + 1).toString();
//     const newPackageData = {
//       id: newId,
//       price: '0',
//       minAccumulated: '0',
//       factor: '1',
//       isSaved: false,
//     };
//     setNewPackages([...newPackages, newPackageData]);
//   };

//   // Hàm lưu gói
//   const handleSavePackage = (pkg: Package) => {
//     pkg.isSaved = true; // Đánh dấu là đã lưu
//     setPackages([...packages, pkg]);
//     setNewPackages(newPackages.filter((p) => p.id !== pkg.id)); // Xóa khỏi danh sách gói mới
//   };

//   // Hàm xóa gói
//   const handleDeletePackage = (pkg: Package) => {
//     if (!pkg.isSaved) {
//       // Xóa gói mới nếu chưa được lưu
//       setNewPackages(newPackages.filter((p) => p.id !== pkg.id));
//     } else {
//       // Xóa gói đã lưu
//       setPackages(packages.filter((p) => p.id !== pkg.id));
//     }
//   };

//   // Hàm render từng gói
//   const renderPackage = (pkg: Package) => (
//     <View key={pkg.id}>
//       <Text style={styles.category}>Pack {pkg.id}</Text>
//       {/* Price */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Price</Text>
//         <TextInput
//           style={styles.input}
//           value={pkg.price}
//           onChangeText={(text) => {
//             pkg.price = text;
//             if (!pkg.isSaved) setNewPackages([...newPackages]);
//           }}
//         />
//       </View>
//       {/* Min Accumulated */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Min Accumulated</Text>
//         <TextInput
//           style={styles.input}
//           value={pkg.minAccumulated}
//           onChangeText={(text) => {
//             pkg.minAccumulated = text;
//             if (!pkg.isSaved) setNewPackages([...newPackages]);
//           }}
//         />
//       </View>
//       {/* Factor */}
//       <View style={styles.item}>
//         <Text style={styles.title}>Factor</Text>
//         <TextInput
//           style={styles.input}
//           value={pkg.factor}
//           onChangeText={(text) => {
//             pkg.factor = text;
//             if (!pkg.isSaved) setNewPackages([...newPackages]);
//           }}
//         />
//       </View>

//       {/* Nút Save và Delete */}
//       <View style={styles.buttonContainer}>
//         {!pkg.isSaved && (
//           <TouchableOpacity
//             style={styles.saveBtn}
//             onPress={() => handleSavePackage(pkg)}
//           >
//             <Text style={styles.buttonText}>Save</Text>
//           </TouchableOpacity>
//         )}
//         <TouchableOpacity
//           style={styles.deleteBtn}
//           onPress={() => handleDeletePackage(pkg)}
//         >
//           <Text style={styles.buttonText}>Delete</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={styles.line} />
//     </View>
//   );

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.addBar}>
//         <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
//           <Text style={{ color: '#ffffff' }}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={styles.scrollContainer}>
//         {packages.map((pkg) => renderPackage(pkg))}
//         {newPackages.map((pkg) => renderPackage(pkg))}
//       </ScrollView>
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   scrollContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   addBar: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 20,
//     marginRight: 20,
//   },
//   addBtn: {
//     backgroundColor: '#5E8C31',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginLeft: 20,
//     borderRadius: 8,
//   },
//   line: {
//     height: 1,
//     backgroundColor: '#d3d3d3',
//     marginHorizontal: 20,
//     marginVertical: 30,
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   category: {
//     fontSize: 18,
//     fontStyle: 'italic',
//     marginLeft: 20,
//     fontWeight: '500',
//   },
//   title: {
//     fontSize: 14,
//     padding: 20,
//     marginLeft: 25,
//     flex: 3,
//     color: '#444444',
//   },
//   input: {
//     height: 35,
//     borderColor: 'gray',
//     borderWidth: 1,
//     paddingHorizontal: 20,
//     marginHorizontal: 20,
//     borderRadius: 10,
//     flex: 2,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   saveBtn: {
//     backgroundColor: '#2986cc',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   deleteBtn: {
//     backgroundColor: '#cc0000',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   buttonText: {
//     color: '#ffffff',
//     textAlign: 'center',
//     fontSize: 16,
//   },
// });

// export default PackageComponent;
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

interface Package {
  id: string;
  price: string;
  minAccumulated: string;
  factor: string;
  isSaved: boolean;
}

// Danh sách ban đầu
const initialPackages: Package[] = [
  { id: '1', price: '10000', minAccumulated: '123000', factor: '1', isSaved: true },
  { id: '2', price: '20000', minAccumulated: '456000', factor: '2', isSaved: true },
  { id: '3', price: '30000', minAccumulated: '789000', factor: '3', isSaved: true },
  { id: '4', price: '40000', minAccumulated: '912000', factor: '4', isSaved: true },
];

const PackageComponent = () => {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [newPackages, setNewPackages] = useState<Package[]>([]);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setNewPackages([]); // Xóa tất cả các gói chưa lưu
    });

    return unsubscribe;
  }, [navigation]);

  const handleAddPackage = () => {
    const newId = (packages.length + newPackages.length + 1).toString();
    const newPackageData = {
      id: newId,
      price: '0',
      minAccumulated: '0',
      factor: '1',
      isSaved: false,
    };
    setNewPackages([...newPackages, newPackageData]);
  };

  const handleSavePackage = (pkg: Package) => {
    pkg.isSaved = true;
    setPackages([...packages, pkg]);
    setNewPackages(newPackages.filter((p) => p.id !== pkg.id));
    setEditingPackageId(null);
  };

  const handleDeletePackage = (pkg: Package) => {
    if (!pkg.isSaved) {
      setNewPackages(newPackages.filter((p) => p.id !== pkg.id));
    } else {
      setPackages(packages.filter((p) => p.id !== pkg.id));
    }
  };

  const renderPackage = ({ item: pkg }: { item: Package }) => (
    <View key={pkg.id}>
      <Text style={styles.category}>Pack {pkg.id}</Text>
      <View style={styles.item}>
        <Text style={styles.title}>Price</Text>
        <TextInput
          style={styles.input}
          value={pkg.price}
          onFocus={() => setEditingPackageId(pkg.id)}
          onChangeText={(text) => {
            pkg.price = text;
            if (!pkg.isSaved) setNewPackages([...newPackages]);
            else setPackages([...packages]);
          }}
        />
      </View>
      <View style={styles.item}>
        <Text style={styles.title}>Min Accumulated</Text>
        <TextInput
          style={styles.input}
          value={pkg.minAccumulated}
          onFocus={() => setEditingPackageId(pkg.id)}
          onChangeText={(text) => {
            pkg.minAccumulated = text;
            if (!pkg.isSaved) setNewPackages([...newPackages]);
            else setPackages([...packages]);
          }}
        />
      </View>
      <View style={styles.item}>
        <Text style={styles.title}>Factor</Text>
        <TextInput
          style={styles.input}
          value={pkg.factor}
          onFocus={() => setEditingPackageId(pkg.id)}
          onChangeText={(text) => {
            pkg.factor = text;
            if (!pkg.isSaved) setNewPackages([...newPackages]);
            else setPackages([...packages]);
          }}
        />
      </View>
      <View style={styles.buttonContainer}>
        {editingPackageId === pkg.id && !pkg.isSaved && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => handleSavePackage(pkg)}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeletePackage(pkg)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.line} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.addBar}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPackage}>
          <Text style={{ color: '#ffffff' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={[...packages, ...newPackages]} // Gộp cả packages đã lưu và chưa lưu
        renderItem={renderPackage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginRight: 20,
  },
  addBtn: {
    backgroundColor: '#5E8C31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 20,
    borderRadius: 8,
  },
  line: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginHorizontal: 20,
    marginVertical: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 18,
    fontStyle: 'italic',
    marginLeft: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    padding: 20,
    marginLeft: 25,
    flex: 3,
    color: '#444444',
  },
  input: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    flex: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#2986cc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: '#cc0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PackageComponent;



