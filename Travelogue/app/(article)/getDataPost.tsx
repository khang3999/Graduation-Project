import { database } from '@/firebase/firebaseConfig';
import { ref, get } from 'firebase/database';
import { parseContent } from '@/utils/parseContent';

export const getDataPost = async (postId: string) => {
  const postRef = ref(database, `posts/${postId}`);

  try {
    const snapshot = await get(postRef); 
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Data available:', data);
      const content = data.content || '';
      const status_id = data.status_id || '';
      const isCheckIn = data.isCheckIn || false;
      const locations = data.locations || [];
      const images = data.images || [];
    
      if (content) {
        parseContent(content);
        const parsedData = parseContent(content);
        console.log('Parsed data:', parsedData);
        // return {
        //     content: parsedData,
        //     status_id,
        //     isCheckIn,
        //     locations,
        //     images
        // };

      }

      return { };
    } else {
      console.log('No data available');
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
