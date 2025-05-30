import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { WebView } from 'react-native-webview';

const ScrapeInfomation = () => {
    const webviewRef = useRef<WebView>(null);
    const [data, setData] = useState(''); // chỉ load khi bấm nút
    const [shouldLoadWeb, setShouldLoadWeb] = useState(false); // chỉ load khi bấm nút
    const crawlData = () => {

    }
    const crawlScript = `
    (function() {
      const title = document.getElementById('title')?.innerText || 'Không tìm thấy tiêu đề';
      window.ReactNativeWebView.postMessage(title);
    })();
    true;
  `;
    const handleCrawl = () => {
        if (webviewRef.current) {
            webviewRef.current.injectJavaScript(crawlScript);
        }
    };
    const handleMessage = (event: any) => {
        const message = event.nativeEvent.data;
        console.log(message);
        setData(message)
    };
    useEffect(() => {
        console.log('state', shouldLoadWeb);
    }, [shouldLoadWeb])
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {shouldLoadWeb ? (
                    <WebView
                        ref={webviewRef}
                        source={{ uri: 'https://csdl.vietnamtourism.gov.vn/dest/?item=1' }}
                        onLoadEnd={() => {
                            webviewRef.current?.injectJavaScript(crawlScript);
                        }}
                        onMessage={handleMessage}
                    />) : (
                    <Text>Chưa bấm nút</Text>
                )}
            </View>
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    style={{ margin: 10, height: 30, backgroundColor: 'red' }}
                    onPress={() => setShouldLoadWeb(!shouldLoadWeb)} >
                    <Text>Scrape</Text>
                </TouchableOpacity>
                <Text>{data == '' ? 'Chưa có' : data}</Text>
            </View >
        </SafeAreaView>
    )
}

export default ScrapeInfomation

const styles = StyleSheet.create({})