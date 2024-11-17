import { database, onValue } from '@/firebase/firebaseConfig';
import { ref } from 'firebase/database';
import { useEffect, useState } from 'react';

// Hook để lấy danh sách từ bị cấm từ Firebase
export const useBannedWords = () => {
    const [bannedWords, setBannedWords] = useState<string[]>([]);

    useEffect(() => {
        const wordsRef = ref(database, 'words/');
        const unsubscribe = onValue(
            wordsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const jsonData = snapshot.val();
                    // Chuyển đổi object thành array
                    const dataArray: string[] = Object.values(jsonData);
                    setBannedWords(dataArray);
                } else {
                    console.log("No data available");
                }
            },
            (error) => {
                console.error("Error fetching data:", error);
            }
        );

        // Hủy đăng ký listener khi unmount
        return () => unsubscribe();
    }, []);

    // console.log("Banned words:", bannedWords);

    return bannedWords;
};
