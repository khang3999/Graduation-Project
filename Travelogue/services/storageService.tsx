import { getStorage, ref as storageRef, listAll, deleteObject } from "firebase/storage";

const deleteFolder = async (folderPath: string) => {
  const storage = getStorage();
  const folderRef = storageRef(storage, folderPath);

  try {
    const listResult = await listAll(folderRef);
    const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deletePromises);
    console.log(`Folder ${folderPath} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting folder ${folderPath}:`, error);
  }
};

export { deleteFolder };
