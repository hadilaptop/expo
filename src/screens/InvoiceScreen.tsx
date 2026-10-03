import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import {
  toPersianDigits,formatNumber,parseNumber,convertNumberToPersianWords,
} from "../utils/numberUtils";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedScrollWrapper, {
  AnimatedScrollWrapperRef,
} from "../components/AnimatedScrollWrapper";
import InvoicePreview from "./InvoicePreview";

import CustomText from '../components/CustomText';
import CustomTextInput from '../components/CustomTextInput';

const { width } = Dimensions.get("window");
const MAX_ROWS = 12;

const CustomDropdown = ({ label, value, options, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View
      style={[
        styles.inputGroup,
        { zIndex: isOpen ? 1000 : 1, elevation: isOpen ? 10 : 1 },
      ]}
    >
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownTrigger,
          isOpen && styles.inputFocused,
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <CustomText style={styles.dropdownTriggerText}>{value}</CustomText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((opt: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
            >
              <CustomText style={styles.dropdownItemText}>{opt.label}</CustomText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function InvoiceScreen({
  onNavigate = (screen: string) => {},
  initialCustomer = null,
  invoiceToEdit = null,
  customers = [
    {
      id: "1",
      name: "شرکت مکعب طلایی",
      phone: "09123456789",
      economicCode: "4112233",
      address: "تهران",
    },
    {
      id: "2",
      name: "سپاهان پخت",
      phone: "09131112233",
      economicCode: "998877",
      address: "اصفهان",
    },
  ],
}: any) {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const bottomBarAnim = useRef(new Animated.Value(100)).current;
  const scrollRef = useRef<AnimatedScrollWrapperRef>(null);
  const insets = useSafeAreaInsets();
  const safePaddingBottom = insets.bottom > 0 ? insets.bottom + 5 : 10;
  const bottomNavHeight = 55 + safePaddingBottom;
  const [step, setStep] = useState("form");
  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const PROFORMA_DEFAULT_NOTE =
    "به دلیل نوسانات بازار این پیش فاکتور تا زمان دریافت اسناد مالی قابل تغییر قیمت می‌باشد و فروشنده تضمینی در قبال مبلغ ندارد.";
  const INVOICE_DEFAULT_NOTE =
    "اقلام فاکتور تا زمان تسویه حساب کامل نزد خریدار به صورت امانت می باشد";

  const [invoiceType, setInvoiceType] = useState(
    invoiceToEdit?.type || "پیش فاکتور",
  );
  // ✨ توابع toPersianDigits حذف شدند
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoiceToEdit?.number || "1001",
  );
  const [invoiceDate, setInvoiceDate] = useState(
    invoiceToEdit?.date || "1405/07/09",
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialCustomer?.id || null,
  );
  const [buyerName, setBuyerName] = useState(
    initialCustomer ? initialCustomer.name : "",
  );
  
  // ✨ توابع toPersianDigits حذف شدند
  const [buyerEconomicCode, setBuyerEconomicCode] = useState(
    initialCustomer?.economicCode || "",
  );
  const [buyerPhone, setBuyerPhone] = useState(
    initialCustomer?.phone || "",
  );
  const [buyerAddress, setBuyerAddress] = useState(
    initialCustomer?.address || "",
  );

  const [rows, setRows] = useState(
    invoiceToEdit?.items || [
      { id: Date.now(), desc: "", quantity: "1", unitPrice: "" },
    ],
  );

  const [noteText, setNoteText] = useState(() => {
    if (invoiceToEdit && invoiceToEdit.note !== undefined)
      return invoiceToEdit.note;
    const initialType = invoiceToEdit
      ? invoiceToEdit.type || "پیش فاکتور"
      : "پیش فاکتور";
    return initialType === "فاکتور فروش" || initialType === "فاکتور"
      ? INVOICE_DEFAULT_NOTE
      : PROFORMA_DEFAULT_NOTE;
  });

  const sellerName = "نام شرکت شما";
  const sellerPhone = "021-12345678";
  const sellerAddress = "تهران، خیابان مثال، پلاک ۱";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 150,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, bottomBarAnim]);

  const handleClose = () => {
    scrollRef.current?.close(() => {
      onNavigate("dashboard");
    });
  };

  const grandTotal = rows.reduce((acc: number, row: any) => {
    const q = parseNumber(row.quantity) || 1;
    const p = parseNumber(row.unitPrice) || 0;
    return acc + q * p;
  }, 0);

  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows([
        ...rows,
        { id: Date.now(), desc: "", quantity: "1", unitPrice: "" },
      ]);
    }
  };

  const removeRow = (indexToRemove: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_: any, index: number) => index !== indexToRemove));
    }
  };

  const handleTypeChange = (newType: string) => {
    setInvoiceType(newType);
    setNoteText(
      newType === "فاکتور فروش" ? INVOICE_DEFAULT_NOTE : PROFORMA_DEFAULT_NOTE,
    );
  };

  const handleCustomerSelect = (custId: string | null) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setBuyerName("");
      setBuyerAddress("");
      setBuyerPhone("");
      setBuyerEconomicCode("");
      return;
    }
    const cust = customers.find((c: any) => c.id === custId);
    if (cust) {
      setBuyerName(cust.name || "");
      setBuyerAddress(cust.address || "");
      // ✨ توابع toPersianDigits حذف شدند
      setBuyerPhone(cust.phone || "");
      setBuyerEconomicCode(cust.economicCode || "");
    }
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      handleClose();
    }, 1000);
  };

  const handleExport = (format: "pdf" | "png") => {
    setShowExportMenu(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title={step === "form" ? "صدور فاکتور جدید" : "نمایش فاکتور"}
        onBack={handleClose}
        iconName="arrow-back"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AnimatedScrollWrapper
          ref={scrollRef}
          style={{ flex: 1, transform: [{ translateX: slideAnim }] }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === "form" ? (
            <View style={styles.formContainer}>
              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={styles.card}
              >
                <CustomText style={styles.sectionTitle}>مشخصات فاکتور</CustomText>

                <View style={styles.inputGroup}>
                  <CustomText style={styles.label}>نوع فاکتور :</CustomText>
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.typeBtn,
                        invoiceType === "پیش فاکتور" && styles.typeBtnActive,
                      ]}
                      onPress={() => handleTypeChange("پیش فاکتور")}
                      activeOpacity={0.8}
                    >
                      <CustomText
                        style={[
                          styles.typeBtnText,
                          invoiceType === "پیش فاکتور" &&
                            styles.typeBtnTextActive,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        پیش فاکتور
                      </CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeBtn,
                        invoiceType === "فاکتور فروش" && styles.typeBtnActive,
                      ]}
                      onPress={() => handleTypeChange("فاکتور فروش")}
                      activeOpacity={0.8}
                    >
                      <CustomText
                        style={[
                          styles.typeBtnText,
                          invoiceType === "فاکتور فروش" &&
                            styles.typeBtnTextActive,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        فاکتور فروش
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.grid2}>
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.label}>شماره فاکتور :</CustomText>
                    <CustomTextInput
                      style={[styles.input, { textAlign: "center" }]}
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      value={invoiceNumber}
                      onChangeText={setInvoiceNumber} // ✨ تغییر فرمت برداشته شد
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.label}>تاریخ فاکتور :</CustomText>
                    <View style={styles.dateInputContainer}>
                      <CustomTextInput
                        style={[styles.input, { textAlign: "center", flex: 1 }]}
                        placeholderTextColor="rgba(255,255,255,0.45)"
                        value={invoiceDate}
                        onChangeText={setInvoiceDate} // ✨ تغییر فرمت برداشته شد
                      />
                      <TouchableOpacity style={styles.dateIconWrapper}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={[styles.card, { zIndex: 10 }]}
              >
                <CustomDropdown
                  label="انتخاب مشتری از لیست :"
                  value={
                    selectedCustomerId
                      ? customers.find((c: any) => c.id === selectedCustomerId)
                          ?.name
                      : " مشتری جدید "
                  }
                  options={[
                    { label: " مشتری جدید ", value: null },
                    ...customers.map((c: any) => ({
                      label: c.name,
                      value: c.id,
                    })),
                  ]}
                  onSelect={handleCustomerSelect}
                />
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={[styles.card, { zIndex: 1 }]}
              >
                <CustomText style={styles.sectionTitle}>اطلاعات خریدار</CustomText>

                <View style={styles.inputGroup}>
                  <CustomText style={styles.label}>نام خریدار / شرکت *</CustomText>
                  <CustomTextInput
                    style={[styles.input, selectedCustomerId ? { opacity: 0.7 } : {}]}
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    placeholder="شرکت..."
                    value={buyerName}
                    onChangeText={setBuyerName}
                    editable={!selectedCustomerId}
                  />
                </View>

                <View style={styles.grid2}>
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.label}>کد اقتصادی خریدار</CustomText>
                    <CustomTextInput
                      style={[styles.input, selectedCustomerId ? { opacity: 0.7 } : {}]}
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      placeholder=" 0 "
                      value={buyerEconomicCode}
                      onChangeText={setBuyerEconomicCode} // ✨ تغییر فرمت برداشته شد
                      keyboardType="numeric"
                      editable={!selectedCustomerId}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <CustomText style={styles.label}>شماره تماس خریدار</CustomText>
                    <CustomTextInput
                      style={[styles.input, selectedCustomerId ? { opacity: 0.7 } : {}]}
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      placeholder="  0912... "
                      value={buyerPhone}
                      onChangeText={setBuyerPhone} // ✨ تغییر فرمت برداشته شد
                      keyboardType="phone-pad"
                      editable={!selectedCustomerId}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <CustomText style={styles.label}>نشانی خریدار</CustomText>
                  <CustomTextInput
                    style={[styles.input, selectedCustomerId ? { opacity: 0.7 } : {}]}
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    placeholder="استان، شهر، خیابان..."
                    value={buyerAddress}
                    onChangeText={setBuyerAddress}
                    editable={!selectedCustomerId}
                  />
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={styles.card}
              >
                <View style={styles.rowHeader}>
                  <CustomText style={styles.sectionTitle}>
                    اقلام و کالاهای فاکتور
                  </CustomText>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addRow}
                    disabled={rows.length >= MAX_ROWS}
                  >
                    <CustomText style={styles.addButtonText}>
                      + سطر جدید ({toPersianDigits(rows.length.toString())})
                    </CustomText>
                  </TouchableOpacity>
                </View>

                {rows.map((row: any, index: number) => (
                  <View key={row.id} style={styles.itemRow}>
                    <View style={styles.itemRowTop}>
                      <CustomText style={styles.itemBadge}>
                        سطر {toPersianDigits((index + 1).toString())}
                      </CustomText>
                      {rows.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeRow(index)}
                          style={styles.deleteBtn}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#ffffff"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <CustomText style={styles.labelSm}>شرح کالا / خدمات</CustomText>
                    <CustomTextInput
                      style={[styles.input, { marginBottom: 8 }]}
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      placeholder="محصول جدید"
                      value={row.desc}
                      onChangeText={(text: string) => {
                        const newRows = [...rows];
                        newRows[index].desc = text;
                        setRows(newRows);
                      }}
                    />

                    <View style={styles.rowInputGroup}>
                      <View style={{ flex: 1 }}>
                        <CustomText style={styles.labelSm}>تعداد</CustomText>
                        <CustomTextInput
                          style={[styles.input, { textAlign: "center" }]}
                          placeholderTextColor="rgba(255,255,255,0.45)"
                          placeholder="1"
                          keyboardType="numeric"
                          value={row.quantity}
                          onChangeText={(text: string) => {
                            const cleaned = text.replace(/[^0-9۰-۹]/g, "");
                            const newRows = [...rows];
                            newRows[index].quantity = cleaned; // ✨ تغییر فرمت برداشته شد
                            setRows(newRows);
                          }}
                        />
                      </View>
                      <View style={{ flex: 2 }}>
                        <CustomText style={styles.labelSm}>قیمت واحد (ریال)</CustomText>
                        <CustomTextInput
                          style={[styles.input, { textAlign: "left" }]}
                          placeholderTextColor="rgba(255,255,255,0.45)"
                          placeholder="۰"
                          keyboardType="numeric"
                          value={
                            row.unitPrice ? formatNumber(row.unitPrice) : ""
                          }
                          onChangeText={(text: string) => {
                            const cleaned = text.replace(/[^0-9۰-۹]/g, "");
                            const newRows = [...rows];
                            newRows[index].unitPrice = cleaned;
                            setRows(newRows);
                          }}
                        />
                      </View>
                    </View>
                    <View style={styles.itemTotalBox}>
                      <CustomText style={styles.labelSm}>
                        جمع:{" "}
                        {formatNumber(
                          (parseNumber(row.quantity) || 1) *
                            (parseNumber(row.unitPrice) || 0),
                        )}{" "}
                        ریال
                      </CustomText>
                    </View>
                  </View>
                ))}

                <View style={styles.totalBox}>
                  <CustomText style={styles.totalTitle}>مبلغ کل فاکتور:</CustomText>
                  <CustomText style={styles.totalAmount}>
                    {formatNumber(grandTotal)}{" "}
                    <CustomText style={styles.currencyText}>ریال</CustomText>
                  </CustomText>
                </View>
                <View style={styles.wordsBox}>
                  <CustomText style={styles.wordsText}>
                    {convertNumberToPersianWords(grandTotal)}
                  </CustomText>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={styles.card}
              >
                <CustomText style={styles.sectionTitle}>توضیحات فاکتور</CustomText>
                <CustomTextInput
                  style={[styles.input, {fontSize:14, height: 155, textAlignVertical: "top", lineHeight: 24 }]}
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  multiline
                  placeholder="توضیحات یا شرایط فاکتور..."
                  value={noteText}
                  onChangeText={setNoteText}
                />
              </LinearGradient>
            </View>
          ) : (
            <InvoicePreview
              invoiceType={invoiceType}
              sellerName={sellerName}
              sellerAddress={sellerAddress}
              sellerPhone={sellerPhone}
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              buyerName={buyerName}
              buyerPhone={buyerPhone}
              buyerEconomicCode={buyerEconomicCode}
              buyerAddress={buyerAddress}
              rows={rows}
              grandTotal={grandTotal}
              noteText={noteText}
            />
          )}
        </AnimatedScrollWrapper>
      </KeyboardAvoidingView>

      <Animated.View
        style={[
          styles.bottomBar,
          {
            bottom: bottomNavHeight + 20,
            transform: [{ translateY: bottomBarAnim }],
          },
        ]}
      >
        <View style={styles.actionCard}>
          {step === "form" ? (
            <>
              <TouchableOpacity
                style={styles.circleBtnLight}
                onPress={() => setStep("preview")}
              >
                <Ionicons name="eye-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleBtnGreen}
                onPress={handleSaveToDatabase}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="checkmark-outline" size={28} color="#fff" />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {showExportMenu && (
                <View style={styles.exportMenu}>
                  <TouchableOpacity
                    onPress={() => handleExport("png")}
                    style={styles.exportMenuItem}
                  >
                    <CustomText style={styles.exportMenuText}>تصویر (PNG)</CustomText>
                  </TouchableOpacity>
                  <View style={styles.exportMenuDivider} />
                  <TouchableOpacity
                    onPress={() => handleExport("pdf")}
                    style={styles.exportMenuItem}
                  >
                    <CustomText style={styles.exportMenuText}>فایل (PDF)</CustomText>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.circleBtnLight}
                onPress={() => setShowExportMenu(!showExportMenu)}
              >
                <Ionicons name="share-social-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleBtnLight}
                onPress={() => setShowExportMenu(!showExportMenu)}
              >
                <Ionicons name="download-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleBtnGreen}
                onPress={handleSaveToDatabase}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="checkmark-outline" size={28} color="#fff" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6fc",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 410,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#0d2b43",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#a2c8e2",
  },
  sectionTitle: {
    
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 8,
  },
  grid2: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  inputGroup: {
    paddingVertical: 6,
    flex: 1,
  },
  label: {
    
    fontSize: 14,
    color: "#ffffff",
    textAlign: "right",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  labelSm: {
    
    fontSize: 13,
    color: "#ffffff",
    textAlign: "right",
    marginBottom: 4,
  },
  input: {
    
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#fff",
    textAlign: "right",
    fontSize: 15,
  },
  inputFocused: {
    borderColor: "#ffffff",
    backgroundColor: "rgba(20, 58, 123, 0.35)",
  },
  dateInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    position: "relative",
  },
  dateIconWrapper: {
    position: "absolute",
    right: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 6,
    borderRadius: 8,
  },
  typeSelectorRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
  },
  typeBtnActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  typeBtnText: {
    
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  dropdownTrigger: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownTriggerText: {
    
    color: "#fff",
    fontSize: 15,
  },
  dropdownList: {
    backgroundColor: "#0f4c75",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#a2c8e2",
    marginTop: 4,
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  dropdownItemText: {
    
    color: "#fff",
    fontSize: 14,
    textAlign: "right",
  },
  rowHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 8,
  },
  addButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    
    color: "#fff",
    fontSize: 13,
  },
  itemRow: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(40,227,30,0.6)",
  },
  itemRowTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 8,
  },
  itemBadge: {
    
    color: "#fff",
    fontSize: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    padding: 6,
    borderRadius: 8,
  },
  rowInputGroup: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 5,
  },
  itemTotalBox: {
    marginTop: 10,
    backgroundColor: "rgba(13,43,67,0.45)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  totalBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "rgba(13,43,67,0.5)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#a2c8e2",
  },
  totalTitle: {
    
    color: "#fff",
    fontSize: 15,
    textAlign: "right",
    marginBottom: 4,
  },
  totalAmount: {
    
    color: "#fff",
    fontSize: 22,
    textAlign: "left",
  },
  currencyText: {
    
    fontSize: 15,
    color: "#e0f2fe",
  },
  wordsBox: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  wordsText: {
    
    color: "#e0f2fe",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 95 : 95,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  actionCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row-reverse",
    borderRadius: 40,
    padding: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    gap: 45,
    borderWidth: 2,
    borderColor: "#3282b8",
  },
  circleBtnLight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3282b8",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBtnGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  exportMenu: {
    position: "absolute",
    bottom: 70,
    left: 20,
    backgroundColor: "#0f4c75",
    borderRadius: 12,
    padding: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minWidth: 130,
  },
  exportMenuItem: {
    paddingVertical: 10,
    alignItems: "center",
  },
  exportMenuText: {
    
    color: "#fff",
    fontSize: 15,
  },
  exportMenuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
});