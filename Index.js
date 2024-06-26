// pages/index.js
import { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Input, Text, VStack, Image, Divider } from '@chakra-ui/react';
import { firestore, storage } from '../firebase';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsSnapshot = await firestore.collection('items').get();
      setItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchItems();
  }, []);

  const handleUpload = async () => {
    if (!newItem.name || !newItem.price || !newItem.image) return;
    setLoading(true);
    const storageRef = storage.ref();
    const fileRef = storageRef.child(newItem.image.name);
    await fileRef.put(newItem.image);
    const fileUrl = await fileRef.getDownloadURL();

    await firestore.collection('items').add({
      name: newItem.name,
      price: newItem.price,
      imageUrl: fileUrl,
    });

    setNewItem({ name: '', price: '', image: null });
    setLoading(false);
    window.location.reload();
  };

  const handleBuy = (id) => {
    alert(`Item with id ${id} bought!`);
  };

  return (
    <Box p={5}>
      <Heading mb={4}>ThriftXtream</Heading>
      <Divider mb={4} />
      <Heading size="md" mb={4}>Upload Barang Baru</Heading>
      <Input
        placeholder="Nama Barang"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        mb={2}
      />
      <Input
        placeholder="Harga Barang"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        mb={2}
      />
      <Input
        type="file"
        onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
        mb={2}
      />
      <Button onClick={handleUpload} isLoading={loading} mb={4}>Upload</Button>

      <Divider mb={4} />

      <Heading size="md" mb={4}>Barang yang Tersedia</Heading>
      <VStack spacing={4}>
        {items.map(item => (
          <Box key={item.id} p={4} borderWidth={1} borderRadius="md" width="100%">
            <Flex justifyContent="space-between" alignItems="center">
              <Box>
                <Text fontWeight="bold">{item.name}</Text>
                <Text>Harga: {item.price}</Text>
              </Box>
              <Image src={item.imageUrl} boxSize="100px" objectFit="cover" />
              <Button onClick={() => handleBuy(item.id)}>Beli</Button>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
