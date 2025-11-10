import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, SafeAreaView } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// CHANGE AFTER RENDER DEPLOY
axios.defaults.baseURL = "https://your-rento-app.onrender.com";

const Stack = createNativeStackNavigator();

const Login = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const login = async () => {
    if (!/^\d{10}$/.test(phone)) return Alert.alert("Error", "10-digit phone");
    if (!name.trim()) return Alert.alert("Error", "Enter name");

    try {
      const res = await axios.post("/api/auth/profile", { phone, name });
      await AsyncStorage.setItem("token", res.data.token);
      Alert.alert("Success", `Welcome ${res.data.user.name}!`);
      navigation.replace("Home");
    } catch (e) {
      Alert.alert("Failed", e.response?.data?.msg || "Backend not live");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Rento</Text>
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} style={styles.input} />
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <Button title="Login as Owner" onPress={login} />
    </SafeAreaView>
  );
};

const Home = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get("/api/properties/my", { headers: { "x-auth-token": token } });
      setProperties(res.data);
    } catch (e) { Alert.alert("Error", "Login again"); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load().then(() => setRefreshing(false)); };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Properties</Text>
      <Button title="Add Property" onPress={() => navigation.navigate("Add")} color="green" />
      <FlatList
        data={properties}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={i => i._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.h2}>{item.title}</Text>
            <Text>?{item.price}/mo • {item.location}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No properties</Text>}
      />
    </SafeAreaView>
  );
};

const AddProperty = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  const save = async () => {
    if (!title || !price || !location) return Alert.alert("Error", "Fill all");
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post("/api/properties", { title, price: Number(price), location }, {
        headers: { "x-auth-token": token }
      });
      Alert.alert("Success", "Added!");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.msg || "Failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Property</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Price (?)" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <Button title="Save" onPress={save} color="green" />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Add" component={AddProperty} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 14, borderRadius: 10, marginVertical: 8, backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", padding: 16, marginVertical: 8, borderRadius: 10, elevation: 2 },
  h2: { fontSize: 18, fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 60, color: "#666" },
});
