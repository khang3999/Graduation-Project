import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRanking } from '@/contexts/RankingContext';
import { database, get, ref } from '@/firebase/firebaseConfig';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  entities?: {
    id: string;
    type: 'tour' | 'city' | 'post';
    name: string;
    index: number;
  }[];
}

const ChatBotModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Xin chào! Tôi có thể giúp gì cho bạn về du lịch?', sender: 'bot' },
  ]);
  
  // Xử lý khi người dùng nhấn vào một entity
  const handleEntityPress = (entity: {id: string; type: 'tour' | 'city' | 'post'}) => {
    console.log("Entity pressed:", entity);
    
    if (entity.type === 'tour') {
      console.log(`Navigating to tour: ${entity.id}`);
      router.push(`/tourDetail?id=${entity.id}`);
    } else if (entity.type === 'city') {
      // Lấy thông tin city từ citiesData
      // entity có thể có name hoặc không, ưu tiên tìm theo id, nếu không thì theo name
  const _entity: any = entity;
  const city = citiesData.find((c: any) => c.id === _entity.id || (_entity.name && (c.name === _entity.name || c.value === _entity.name)));
      const idCity = city?.key || city?.id || entity.id;
      const idCountry = city?.idCountry || city?.countryId || '';
      const idArea = city?.areaId || city?.idArea || '';
      console.log(`Navigating to city:`, { idCity, idCountry, idArea });
      router.push({
        pathname: '/galleryCities',
        params: {
          idCity,
          idCountry,
          idArea
        }
      });
    } else if (entity.type === 'post') {
      console.log(`Navigating to post: ${entity.id}`);
      router.push(`/postDetail?id=${entity.id}`);
    }
    // Đóng modal sau khi nhấp vào entity
    onClose();
  };
  
  // Hàm render text có chứa các phần có thể nhấn (entities)
  const renderTextWithEntities = (text: string, entities?: Message['entities']) => {
    if (!entities || entities.length === 0) return text;
    
    // Tạo danh sách các phần tử để render
    const parts: React.ReactNode[] = [];
    
    // Chia văn bản thành các dòng
    const lines = text.split('\n');
    
    // Xử lý từng dòng
    lines.forEach((line, lineIndex) => {
      // Kiểm tra xem dòng này có chứa entity không
      // Các mẫu line thường có dạng "1. Tên tour:" hoặc "#1: Tên thành phố"
      const matchIndex = parseInt(line.match(/^[#]?(\d+)[.:].*$/)?.[1] || '0') - 1;
      
      if (matchIndex >= 0 && matchIndex < (entities?.length || 0)) {
        const entity = entities![matchIndex];
        
        // Thêm dòng có thể nhấp vào
        parts.push(
          <TouchableOpacity 
            key={`entity-${lineIndex}`}
            onPress={() => handleEntityPress(entity)}
            style={styles.entityButton}
          >
            <Text style={styles.entityText}>{line}</Text>
          </TouchableOpacity>
        );
        
        // Thêm xuống dòng sau mỗi dòng (ngoại trừ dòng cuối cùng)
        if (lineIndex < lines.length - 1) {
          parts.push(<Text key={`br-${lineIndex}`}>{'\n'}</Text>);
        }
      } else {
        // Dòng thường không chứa entity
        parts.push(<Text key={`text-${lineIndex}`}>{line}</Text>);
        
        // Thêm xuống dòng sau mỗi dòng (ngoại trừ dòng cuối cùng)
        if (lineIndex < lines.length - 1) {
          parts.push(<Text key={`br-${lineIndex}`}>{'\n'}</Text>);
        }
      }
    });
    
    return parts;
  };
  
  // Lấy dữ liệu từ context app
  const { 
    citiesData, 
    toursData,
    postsData1: postsData
  } = useRanking();

  const GEMINI_API_KEY = 'AIzaSyB-zunL-Cpk5xyN9lkIvjKN1_itUheQamA';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Hàm lấy dữ liệu tour giá thấp nhất
  const getCheapestTours = (cityFilter?: string) => {
    // Nếu có filter theo thành phố, lọc các tour thuộc thành phố đó
    let filteredTours = toursData;
    if (!filteredTours || filteredTours.length === 0) return { text: "không có dữ liệu tour", entities: [] };
    
    if (cityFilter) {
      const normalizedCityName = cityFilter.toLowerCase().trim();
      filteredTours = toursData.filter((tour: any) => {
        // Kiểm tra nếu tour thuộc thành phố này (check các trường locations, address, title, description)
        const locations = tour.locations || [];
        const locMatch = locations.some((loc: any) => 
          (loc.name || "").toLowerCase().includes(normalizedCityName) || 
          (loc.value || "").toLowerCase().includes(normalizedCityName)
        );
        
        const addressMatch = (tour.address || "").toLowerCase().includes(normalizedCityName);
        const titleMatch = (tour.title || "").toLowerCase().includes(normalizedCityName);
        const descMatch = (tour.content || "").toLowerCase().includes(normalizedCityName);
        
        return locMatch || addressMatch || titleMatch || descMatch;
      });
      
      if (filteredTours.length === 0) {
        return { 
          text: `Không tìm thấy tour nào ở ${cityFilter}`, 
          entities: [] 
        };
      }
    }
    
    // Lọc tour có giá (ưu tiên money, nếu không có thì lấy price)
    const toursWithPrice = filteredTours.filter((tour: any) => {
      const price = tour.money !== undefined ? tour.money : tour.price;
      return price !== undefined && !isNaN(Number(price)) && Number(price) > 0;
    });

    // Sắp xếp theo giá từ thấp đến cao
    const sortedTours = [...toursWithPrice].sort((a: any, b: any) => {
      const priceA = a.money !== undefined ? a.money : a.price;
      const priceB = b.money !== undefined ? b.money : b.price;
      return (Number(priceA) || 0) - (Number(priceB) || 0);
    });

    if (sortedTours.length === 0) return { text: "không có dữ liệu giá tour", entities: [] };

    // Lấy 3 tour rẻ nhất
    const top3Tours = sortedTours.slice(0, 3);
    
    // Tạo entities để làm các phần có thể nhấn
    const entities = top3Tours.map((tour, index) => ({
      id: tour.id || "",
      type: 'tour' as const,
      name: tour.title || 'Không tên',
      index: index
    }));
    
    const toursInfo = top3Tours.map((tour, index) => {
      const price = tour.money !== undefined ? tour.money : tour.price;
      return `${index + 1}. ${tour.title || 'Không tên'}: ${Number(price).toLocaleString('vi-VN')}đ, ${tour.duration || '?'} ngày, điểm đánh giá: ${tour.scores || '?'}`;
    }).join('\n');
    
    const cityText = cityFilter ? ` ở ${cityFilter}` : "";
    return { 
      text: `Ba tour rẻ nhất${cityText}:\n${toursInfo}`,
      entities 
    };
  };
  
  // Hàm lấy dữ liệu tỉnh xu hướng
  const getTrendingCities = (count: number = 10) => {
    if (!citiesData || citiesData.length === 0) return { text: "không có dữ liệu tỉnh xu hướng", entities: [] };
    // Lấy top count tỉnh xu hướng
    const topCities = citiesData.slice(0, count);
    // Tạo entities để làm các phần có thể nhấn
    const entities = topCities.map((city: any, index: number) => ({
      id: city.id || city.name || city.value || "",
      type: 'city' as const,
      name: city.name || city.value || 'Không tên',
      index: index
    }));
    const citiesInfo = topCities.map((city: any, index: number) => 
      `#${index + 1}: ${city.name || city.value || 'Không tên'} (${city.scores || 0} điểm)`
    ).join('; ');
    return { 
      text: `Top tỉnh thành xu hướng: ${citiesInfo}`,
      entities 
    };
  };
  
  // Hàm lấy dữ liệu bài viết nổi bật
  const getTrendingPosts = () => {
    if (!postsData || postsData.length === 0) return { text: "không có dữ liệu bài viết nổi bật", entities: [] };
    
    // Lấy top 3 bài viết nổi bật
    const top3Posts = postsData.slice(0, 3);
    
    // Tạo entities để làm các phần có thể nhấn
    const entities = top3Posts.map((post: any, index: number) => ({
      id: post.id || "",
      type: 'post' as const,
      name: post.title || 'Không tiêu đề',
      index: index
    }));
    
    const postsInfo = top3Posts.map((post: any, index: number) => {
      // Xử lý thông tin tác giả nếu có
      const authorInfo = post.author ? 
        `tác giả: ${post.author.name || post.author.username || 'Ẩn danh'}` : '';
      
      // Xử lý thời gian nếu có
      let timeInfo = '';
      if (post.created_at) {
        const postDate = new Date(post.created_at);
        timeInfo = `, ngày ${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
      }
      
      return `#${index + 1}: "${post.title || 'Không tiêu đề'}" (${post.scores || 0} điểm)${timeInfo}${authorInfo ? ', ' + authorInfo : ''}`;
    }).join('\n');
    
    return {
      text: `Bài viết nổi bật nhất:\n${postsInfo}`,
      entities
    };
  };
  
  // Hàm lấy dữ liệu dự báo thời tiết sử dụng WeatherAPI
  const getWeatherForecast = async (cityName: string) => {
    try {
      const API_KEY = 'f816ffe03d08496298b74114252007'; 
      const q = encodeURIComponent(cityName + ', Vietnam');
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${q}&days=7&lang=vi`);
      const data = await response.json();
      if (data.error) {
        return `Không tìm thấy dự báo cho thành phố "${cityName}" (WeatherAPI: ${data.error.message})`;
      }
      const numDays = data.forecast && data.forecast.forecastday ? data.forecast.forecastday.length : 0;
      let result = `Dự báo thời tiết ${numDays} ngày tới cho ${data.location.name} (${data.location.country}):\n`;
      data.forecast.forecastday.forEach((day: any, idx: number) => {
        const date = new Date(day.date);
        const dayOfWeek = idx === 0 ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'long' });
        result += `- ${dayOfWeek} (${day.date}): ${day.day.avgtemp_c}°C, ${day.day.condition.text}, độ ẩm: ${day.day.avghumidity}%, mưa: ${day.day.daily_chance_of_rain}%\n`;
      });
      return result;
    } catch (error) {
      console.error('Lỗi lấy dữ liệu thời tiết:', error);
      return `Không thể lấy dự báo thời tiết. Lỗi: ${error}`;
    }
  };

  // Phân tích câu hỏi và xác định nội dung liên quan đến app
  const analyzeQuestion = (question: string) => {
    question = question.toLowerCase();
    
    let appData = { text: "", entities: [] as Message["entities"] };
    
    // Kiểm tra câu hỏi về tour ở thành phố cụ thể
    const cityTourRegex = /(?:tour|du lịch|tham quan).*(?:ở|tại|trong|của|cho).*?([\p{L}\s]+?)(?:\?|$|\.|,)/u;
    const cityTourMatch = question.match(cityTourRegex);
    
    let cityFilter = null;
    if (cityTourMatch && cityTourMatch[1]) {
      cityFilter = cityTourMatch[1].trim();
      
      // Kiểm tra nếu hỏi về tour rẻ nhất ở thành phố đó
      if (question.includes('rẻ') || question.includes('giá') || question.includes('tiền') || 
          question.includes('giá thấp') || question.includes('tiết kiệm')) {
        const result = getCheapestTours(cityFilter);
        appData.text += result.text + "\n\n";
        appData.entities = [...(appData.entities || []), ...(result.entities || [])];
        return appData;
      }
    }
    
    // Kiểm tra từng loại câu hỏi (ngoại trừ thời tiết, được xử lý riêng ở handleSend)
    if (question.includes('xu hướng') || question.includes('nổi bật') || question.includes('trending') || 
        question.includes('phổ biến') || question.includes('hot') || question.includes('top')) {
      
      if (question.includes('tỉnh') || question.includes('thành phố') || question.includes('địa điểm')) {
        const result = getTrendingCities();
        appData.text += result.text + "\n\n";
        appData.entities = [...(appData.entities || []), ...(result.entities || [])];
      }
      
      if (question.includes('bài') || question.includes('post') || question.includes('viết')) {
        const result = getTrendingPosts();
        appData.text += result.text + "\n\n";
        appData.entities = [...(appData.entities || []), ...(result.entities || [])];
      }
      
      if (question.includes('tour') || question.includes('du lịch') || question.includes('tham quan')) {
        // Logic lấy tour xu hướng
        if (toursData.length > 0) {
          const topTour = toursData[0];
          appData.text += `Tour nổi bật nhất: "${topTour?.title || 'Không tiêu đề'}" (${topTour?.scores || 0} điểm)\n\n`;
          appData.entities = [...(appData.entities || []), {
            id: topTour.id || "",
            type: 'tour',
            name: topTour.title || 'Không tiêu đề',
            index: 0
          }];
        } else {
          appData.text += "Không có dữ liệu tour nổi bật\n\n";
        }
      }
    }
    
    if ((question.includes('rẻ') || question.includes('giá') || question.includes('tiền') || 
        question.includes('giá thấp') || question.includes('tiết kiệm') || question.includes('khuyến mãi')) && !cityFilter) {
      if (question.includes('tour') || question.includes('du lịch') || question.includes('tham quan')) {
        const result = getCheapestTours();
        appData.text += result.text + "\n\n";
        appData.entities = [...(appData.entities || []), ...(result.entities || [])];
      }
    }
    
    // Thêm thông tin tổng quan nếu hỏi chung
    if (question.includes('tất cả') || question.includes('tổng quan') || question.includes('thông tin') || 
        question.includes('hiển thị') || question.includes('all') || question === 'app') {
      appData.text += "Thông tin tổng quan app:\n";
      appData.text += `- Có ${citiesData.length} tỉnh/thành xu hướng\n`;
      appData.text += `- Có ${toursData.length} tour du lịch\n`;
      appData.text += `- Có ${postsData.length} bài viết nổi bật\n\n`;
    }
    
    return appData;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const uniqueId = () => Date.now().toString() + Math.random().toString(36).substring(2, 8);
    const userMsg: Message = { id: uniqueId(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Thêm "thinking" message
    const thinkingId = uniqueId();
    setMessages((prev) => [
      ...prev,
      { id: thinkingId, text: "Đang tìm thông tin...", sender: 'bot' }
    ]);
    
    // Phân tích câu hỏi để lấy dữ liệu từ app
    const question = input.toLowerCase();
    let appData = analyzeQuestion(input);

    // Kiểm tra nếu câu hỏi về thời tiết
    if (question.includes('thời tiết') || question.includes('dự báo') || 
        question.includes('nhiệt độ') || question.includes('mưa') || question.includes('nắng')) {
      // Ưu tiên lấy tên thành phố bất kỳ user nhập trong câu hỏi (không cần tra bảng)
      // Regex tìm tên thành phố sau từ "thời tiết|dự báo|ở|tại|của|cho" hoặc cuối câu
      let cityName = null;
      const cityRegex = /(?:thời tiết|dự báo|ở|tại|của|cho)?\s*([A-Za-zÀ-ỹ\s]+)$/i;
      const match = input.match(cityRegex);
      if (match && match[1]) {
        cityName = match[1].trim();
      }
      // Nếu không phát hiện được tên thành phố, fallback về citiesData
      if (!cityName || cityName.length < 2) {
        if (citiesData && citiesData.length > 0) {
          cityName = citiesData[0].name || citiesData[0].value;
        } else {
          cityName = 'Hà Nội';
        }
      }
      if (cityName) {
        try {
          const weatherData = await getWeatherForecast(cityName);
          appData.text += weatherData + "\n\n";
        } catch (error) {
          appData.text += `Không thể lấy dự báo thời tiết cho ${cityName}. Lỗi: ${error}\n\n`;
        }
      }
    }

    try {
      // Đóng gói context từ app + câu hỏi để gửi lên AI
      const prompt = appData.text ? 
        `Thông tin từ app: ${appData.text}\n\nCâu hỏi: ${input}\n\nHãy trả lời dựa trên thông tin từ app, đừng bịa thông tin, trả lời ngắn gọn và tự nhiên.` : 
        input;

      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        }),
      });
      const data = await res.json();
      
      // Xóa "thinking" message
      setMessages((prev) => prev.filter(msg => msg.id !== thinkingId));

      let botText = 'Xin lỗi, không nhận được phản hồi.';
      if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        botText = data.candidates[0].content.parts[0].text;
      }

      // Nếu không có dữ liệu app nhưng có câu trả lời từ AI thì dùng câu trả lời AI
      // Nếu có dữ liệu app nhưng không có câu trả lời từ AI thì hiển thị dữ liệu app
      if (botText === 'Xin lỗi, không nhận được phản hồi.' && appData.text) {
        botText = "Dựa trên thông tin app:\n\n" + appData.text;
      }

      setMessages((prev) => [
        ...prev,
        { 
          id: uniqueId(), 
          text: botText, 
          sender: 'bot',
          entities: appData.entities 
        },
      ]);
    } catch (err) {
      // Xóa "thinking" message
      setMessages((prev) => prev.filter(msg => msg.id !== thinkingId));
      
      // Nếu lỗi nhưng có dữ liệu app thì hiển thị dữ liệu app
      if (appData.text) {
        setMessages((prev) => [
          ...prev,
          { 
            id: uniqueId(), 
            text: "Tôi không thể kết nối với AI, nhưng đây là thông tin từ app:\n\n" + appData.text, 
            sender: 'bot',
            entities: appData.entities 
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: uniqueId(), text: 'Lỗi kết nối AI. Vui lòng thử lại sau.', sender: 'bot' },
        ]);
      }
    }
  };
  
  // Kiểm tra xem dữ liệu đã sẵn sàng chưa
  const checkDataReady = () => {
    if (!citiesData || citiesData.length === 0 || 
        !toursData || toursData.length === 0 ||
        !postsData || postsData.length === 0) {
      return false;
    }
    return true;
  };

  // Khi mở chatbot, kiểm tra dữ liệu
  React.useEffect(() => {
    if (visible && !checkDataReady()) {
      // Hiển thị tin nhắn thông báo đang tải dữ liệu
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: 'Đang tải dữ liệu app, vui lòng đợi một chút...', sender: 'bot' },
      ]);
    }
  }, [visible, citiesData, toursData, postsData]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Trợ Lý Travelogue AI</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ fontSize: 20 }}>×</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.message, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
              <Text style={styles.msgText}>
            {item.entities && item.entities.length > 0 
              ? renderTextWithEntities(item.text, item.entities)
              : item.text
            }
          </Text>
            </View>
          )}
          style={styles.list}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập câu hỏi..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000,
  },
  entityButton: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 4,
    padding: 4,
    marginVertical: 2,
    marginHorizontal: 0,
    width: '100%',
  },
  entityText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  container: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    flex: 1,
    padding: 12,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
  },
  msgText: {
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

export default ChatBotModal;
