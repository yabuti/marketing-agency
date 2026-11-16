import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// ── The live website loaded inside the app ──
// Change this if the site moves to a new URL.
const WEBSITE_URL = 'https://www.allthings.com.et';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);

  // Android hardware back button: go back in webview, else exit app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const handleShouldStartLoadWithRequest = useCallback((request) => {
    const { url } = request;
    if (url.startsWith('http://') || url.startsWith('https://')) return true;
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return false;
  }, []);

  const retry = () => {
    setFailed(false);
    webViewRef.current && webViewRef.current.reload();
  };

  if (failed) {
    return (
      <View style={styles.errorWrap}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMsg}>We couldn't load All Things Ethiopia. Check your internet connection and try again.</Text>
        <TouchableOpacity onPress={retry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        )}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
        onHttpError={() => setFailed(true)}
        onError={() => setFailed(true)}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        cacheEnabled
        originWhitelist={['http://*', 'https://*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0f172a',
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorMsg: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
