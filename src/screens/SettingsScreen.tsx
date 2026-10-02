import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Header from "../components/Header";
import AnimatedScrollWrapper, { AnimatedScrollWrapperRef } from '../components/AnimatedScrollWrapper';

// کامپوننت‌های سفارشی و توابع
import CustomText from '../components/CustomText';
import CustomTextInput from '../components/CustomTextInput';
import { toPersianDigits } from '../utils/numberUtils';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const scrollRef = useRef<AnimatedScrollWrapperRef>(null);

  const [theme, setTheme] = useState("blue");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [economicCode, setEconomicCode] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("invoiceTheme");
        const storedName = await AsyncStorage.getItem("companyName");
        const storedAddress = await AsyncStorage.getItem("companyAddress");
        const storedPhone = await AsyncStorage.getItem("companyPhone");
        const storedCode = await AsyncStorage.getItem("companyEconomicCode");
        const storedLogo = await AsyncStorage.getItem("companyLogo");

        if (storedTheme) setTheme(storedTheme);
        if (storedName) setCompanyName(storedName);
        if (storedAddress) setCompanyAddress(storedAddress);
        if (storedPhone) setCompanyPhone(storedPhone);
        if (storedCode) setEconomicCode(storedCode);
        if (storedLogo) setLogoPreview(storedLogo);
      } catch (e) {
        console.error("Failed to load settings.");
      }
    };
    loadSettings();
  }, []);

  const handleClose = () => {
    scrollRef.current?.close(() => {
      onNavigate("dashboard");
    });
  };

  const handleLogoSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطا", "برای انتخاب لوگو به دسترسی گالری نیاز داریم.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      setLogoPreview(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("invoiceTheme", theme);
      await AsyncStorage.setItem("companyName", companyName.trim());
      await AsyncStorage.setItem("companyAddress", companyAddress.trim());
      await AsyncStorage.setItem("companyPhone", companyPhone.trim());
      await AsyncStorage.setItem("companyEconomicCode", economicCode.trim());
      if (logoPreview) {
        await AsyncStorage.setItem("companyLogo", logoPreview);
      } else {
        await AsyncStorage.removeItem("companyLogo");
      }

      Alert.alert("موفق", "تنظیمات با موفقیت ذخیره شد.", [
        { text: "تایید", onPress: handleClose },
      ]);
    } catch (e) {
      Alert.alert("خطا", "مشکلی در ذخیره اطلاعات پیش آمد.");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "بازنشانی تنظیمات",
      "آیا از پاک کردن تمامی تنظیمات و فرم‌ها مطمئن هستید؟",
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "بله، پاک کن",
          style: "destructive",
          onPress: async () => {
            setTheme("blue");
            setCompanyName("");
            setCompanyAddress("");
            setCompanyPhone("");
            setEconomicCode("");
            setLogoPreview(null);

            await AsyncStorage.multiRemove([
              "invoiceTheme",
              "companyName",
              "companyAddress",
              "companyPhone",
              "companyEconomicCode",
              "companyLogo",
            ]);
            Alert.alert("انجام شد", "تنظیمات بازنشانی شد.");
          },
        },
      ],
    );
  };

  const renderThemeButton = (themeColor: string, colorCode: string) => (
    <TouchableOpacity
      style={[
        styles.themeBtn,
        { backgroundColor: colorCode },
        theme === themeColor && styles.themeBtnActive,
      ]}
      onPress={() => setTheme(themeColor)}
      activeOpacity={0.7}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title="تنظیمات فاکتور"
        onBack={handleClose}
        iconName="arrow-back"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AnimatedScrollWrapper
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          delay={0}
        >
          <LinearGradient colors={["#0f4c75", "#3282b8"]} style={styles.card}>
            <CustomText style={styles.label}>تم رنگی فاکتور :</CustomText>
            <View style={styles.themeSelector}>
              {renderThemeButton("gold", "#7e5108")}
              {renderThemeButton("blue", "#0f4c75")}
              {renderThemeButton("red", "#a10000")}
              {renderThemeButton("green", "#127547")}
              {renderThemeButton("teal", "#13899d")}
            </View>
          </LinearGradient>

          <LinearGradient colors={["#0f4c75", "#3282b8"]} style={styles.card}>
            <View style={styles.inputGroup}>
              <CustomText style={styles.label}>نام شرکت :</CustomText>
              <CustomTextInput
                style={styles.input}
                placeholder="نام شرکت را وارد کنید"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={companyName}
                onChangeText={setCompanyName}
              />
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.label}>آدرس :</CustomText>
              <CustomTextInput
                style={styles.input}
                placeholder="آدرس شرکت را وارد کنید"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={companyAddress}
                onChangeText={setCompanyAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.label}>شماره تماس :</CustomText>
              <CustomTextInput
                style={styles.input}
                placeholder="۰۹۱۲..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="phone-pad"
                value={companyPhone}
                onChangeText={(text: string) => setCompanyPhone(toPersianDigits(text))}
              />
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.label}>کد اقتصادی :</CustomText>
              <CustomTextInput
                style={styles.input}
                placeholder="۱۲۳..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
                value={economicCode}
                onChangeText={(text: string) => setEconomicCode(toPersianDigits(text))}
              />
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.label}>لوگوی شرکت :</CustomText>
              <TouchableOpacity
                style={styles.logoUploadBtn}
                onPress={handleLogoSelect}
                activeOpacity={0.8}
              >
                {logoPreview ? (
                  <Image
                    source={{ uri: logoPreview }}
                    style={styles.logoPreviewImg}
                  />
                ) : (
                  <CustomText style={styles.logoUploadText}>انتخاب لوگو</CustomText>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#3282b8", "#0f4c75"]}
            style={styles.actionCard}
          >
            <TouchableOpacity style={styles.btnReset} onPress={handleReset}>
              <CustomText style={styles.btnText}>🔄 بازنشانی</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <CustomText style={styles.btnText}>ذخیره تنظیمات</CustomText>
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedScrollWrapper>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6fc",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#0d2b43",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#a2c8e2",
  },
  label: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "right",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: "#fff",
    textAlign: "right",
    fontSize: 16,
  },
  themeSelector: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginTop: 10,
  },
  themeBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  themeBtnActive: {
    borderColor: "#ffffff",
    transform: [{ scale: 1.15 }],
  },
  logoUploadBtn: {
    alignSelf: "center",
    width: 130,
    height: 130,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 10,
  },
  logoUploadText: {
    color: "#fff",
    fontSize: 15,
  },
  logoPreviewImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  actionCard: {
    flexDirection: "row-reverse",
    borderRadius: 20,
    padding: 15,
    gap: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  btnSave: {
    flex: 1.5,
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
  },
  btnReset: {
    flex: 1,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
  },
});