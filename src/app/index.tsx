import React, { useState, useEffect } from 'react';
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import * as SQLite from 'expo-sqlite';

interface ShoppingItem {
  id: number;
  product: string;
  amount: string;
}

const db = SQLite.openDatabaseSync('shoppinglist.db');

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS shopping_list (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product TEXT NOT NULL,
          amount TEXT NOT NULL
        );
      `);
      updateList();
    } catch (error) {
      console.error("Virhe tietokannan alustuksessa:", error);
    }
  }, []);

  const updateList = () => {
    try {
      const allRows = db.getAllSync<ShoppingItem>('SELECT * FROM shopping_list;');
      setShoppingList(allRows);
    } catch (error) {
      console.error("Virhe haettaessa tietoja:", error);
    }
  };

  const saveItem = () => {
    if (product.trim() === '' || amount.trim() === '') {
      return;
    }

    try {
      db.runSync(
        'INSERT INTO shopping_list (product, amount) VALUES (?, ?);',
        [product, amount]
      );
      setProduct('');
      setAmount('');
      updateList();
    } catch (error) {
      console.error("Virhe tallennettaessa:", error);
    }
  };

  const deleteItem = (id: number) => {
    try {
      db.runSync('DELETE FROM shopping_list WHERE id = ?;', [id]);
      updateList();
    } catch (error) {
      console.error("Virhe poistettaessa:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Tuote"
        value={product}
        onChangeText={setProduct}
      />

      <TextInput
        style={styles.input}
        placeholder="Määrä"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.buttonContainer}>
        <Button title="Tallenna" onPress={saveItem} />
      </View>

      <Text style={styles.headerText}>Ostoslista</Text>

      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>
              {item.product}, {item.amount}
            </Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={styles.boughtText}>Valmis</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  input: {
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginVertical: 10,
    width: 90,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemText: {
    fontSize: 16,
  },
  boughtText: {
    color: 'blue',
    marginLeft: 10,
    fontSize: 16,
  },
});