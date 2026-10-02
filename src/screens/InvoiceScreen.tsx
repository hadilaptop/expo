import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
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


const { width } = Dimensions.get("window");
const MAX_ROWS = 12;

// --- کامپوننت‌های سفارشی داخلی ---
const CustomTextInput = ({ style, onFocus, onBlur, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <TextInput
      style={[styles.input, isFocused && styles.inputFocused, style]}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus && onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur && onBlur(e);
      }}
      placeholderTextColor="rgba(255,255,255,0.45)"
      {...props}
    />
  );
};

const CustomDropdown = ({ label, value, options, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View
      style={[
        styles.inputGroup,
        { zIndex: isOpen ? 1000 : 1, elevation: isOpen ? 10 : 1 },
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownTrigger,
          isOpen && styles.inputFocused,
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownTriggerText}>{value}</Text>
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
              <Text style={styles.dropdownItemText}>{opt.label}</Text>
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
  const [invoiceNumber, setInvoiceNumber] = useState(
    toPersianDigits(invoiceToEdit?.number || "1001"),
  );
  const [invoiceDate, setInvoiceDate] = useState(
    toPersianDigits(invoiceToEdit?.date || "1405/07/09"),
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialCustomer?.id || null,
  );
  const [buyerName, setBuyerName] = useState(
    initialCustomer ? initialCustomer.name : "",
  );
  const [buyerEconomicCode, setBuyerEconomicCode] = useState(
    toPersianDigits(initialCustomer?.economicCode || ""),
  );
  const [buyerPhone, setBuyerPhone] = useState(
    toPersianDigits(initialCustomer?.phone || ""),
  );
  const [buyerAddress, setBuyerAddress] = useState(
    initialCustomer?.address || "",
  );

  const [rows, setRows] = useState(
    invoiceToEdit?.items || [
      { id: Date.now(), desc: "", quantity: "۱", unitPrice: "" },
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
        { id: Date.now(), desc: "", quantity: "۱", unitPrice: "" },
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
      setBuyerPhone(toPersianDigits(cust.phone || ""));
      setBuyerEconomicCode(toPersianDigits(cust.economicCode || ""));
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
                <Text style={styles.sectionTitle}>مشخصات فاکتور</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>نوع فاکتور :</Text>
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.typeBtn,
                        invoiceType === "پیش فاکتور" && styles.typeBtnActive,
                      ]}
                      onPress={() => handleTypeChange("پیش فاکتور")}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          invoiceType === "پیش فاکتور" &&
                            styles.typeBtnTextActive,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        پیش فاکتور
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeBtn,
                        invoiceType === "فاکتور فروش" && styles.typeBtnActive,
                      ]}
                      onPress={() => handleTypeChange("فاکتور فروش")}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          invoiceType === "فاکتور فروش" &&
                            styles.typeBtnTextActive,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        فاکتور فروش
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.grid2}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>شماره فاکتور :</Text>
                    <CustomTextInput
                      style={{ textAlign: "center" }}
                      value={invoiceNumber}
                      onChangeText={(text: string) =>
                        setInvoiceNumber(toPersianDigits(text))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>تاریخ فاکتور :</Text>
                    <View style={styles.dateInputContainer}>
                      <CustomTextInput
                        style={{ textAlign: "center", flex: 1 }}
                        value={invoiceDate}
                        onChangeText={(text: string) =>
                          setInvoiceDate(toPersianDigits(text))
                        }
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
                      : "-- مشتری جدید --"
                  }
                  options={[
                    { label: "-- مشتری جدید --", value: null },
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
                <Text style={styles.sectionTitle}>اطلاعات خریدار</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>نام خریدار / شرکت *</Text>
                  <CustomTextInput
                    placeholder="شرکت..."
                    value={buyerName}
                    onChangeText={setBuyerName}
                    editable={!selectedCustomerId}
                    style={selectedCustomerId ? { opacity: 0.7 } : {}}
                  />
                </View>

                <View style={styles.grid2}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>کد اقتصادی خریدار</Text>
                    <CustomTextInput
                      placeholder="...123"
                      value={buyerEconomicCode}
                      onChangeText={(text: string) =>
                        setBuyerEconomicCode(toPersianDigits(text))
                      }
                      keyboardType="numeric"
                      editable={!selectedCustomerId}
                      style={selectedCustomerId ? { opacity: 0.7 } : {}}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>شماره تماس خریدار</Text>
                    <CustomTextInput
                      placeholder="...0912"
                      value={buyerPhone}
                      onChangeText={(text: string) =>
                        setBuyerPhone(toPersianDigits(text))
                      }
                      keyboardType="phone-pad"
                      editable={!selectedCustomerId}
                      style={selectedCustomerId ? { opacity: 0.7 } : {}}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>نشانی خریدار</Text>
                  <CustomTextInput
                    placeholder="استان، شهر، خیابان..."
                    value={buyerAddress}
                    onChangeText={setBuyerAddress}
                    editable={!selectedCustomerId}
                    style={selectedCustomerId ? { opacity: 0.7 } : {}}
                  />
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={styles.card}
              >
                <View style={styles.rowHeader}>
                  <Text style={styles.sectionTitle}>
                    اقلام و کالاهای فاکتور
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addRow}
                    disabled={rows.length >= MAX_ROWS}
                  >
                    <Text style={styles.addButtonText}>
                      + سطر جدید ({toPersianDigits(rows.length)})
                    </Text>
                  </TouchableOpacity>
                </View>

                {rows.map((row: any, index: number) => (
                  <View key={row.id} style={styles.itemRow}>
                    <View style={styles.itemRowTop}>
                      <Text style={styles.itemBadge}>
                        سطر {toPersianDigits(index + 1)}
                      </Text>
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

                    <Text style={styles.labelSm}>شرح کالا / خدمات</Text>
                    <CustomTextInput
                      style={{ marginBottom: 8 }}
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
                        <Text style={styles.labelSm}>تعداد</Text>
                        <CustomTextInput
                          style={{ textAlign: "center" }}
                          placeholder="۱"
                          keyboardType="numeric"
                          value={row.quantity}
                          onChangeText={(text: string) => {
                            const cleaned = text.replace(/[^0-9۰-۹]/g, "");
                            const newRows = [...rows];
                            newRows[index].quantity = toPersianDigits(cleaned);
                            setRows(newRows);
                          }}
                        />
                      </View>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.labelSm}>قیمت واحد (ریال)</Text>
                        <CustomTextInput
                          style={{ textAlign: "left" }}
                          placeholder="۰"
                          keyboardType="numeric"
                          value={
                            row.unitPrice ? formatNumber(row.unitPrice) : ""
                          }
                          onChangeText={(text: string) => {
                            const cleaned = text.replace(/[^0-9۰-۹]/g, "");
                            const newRows = [...rows];
                            // ذخیره عدد به صورت انگلیسی خام برای محاسبات دقیق و تبدیل سریع در UI
                            newRows[index].unitPrice = cleaned;
                            setRows(newRows);
                          }}
                        />
                      </View>
                    </View>
                    <View style={styles.itemTotalBox}>
                      <Text style={styles.labelSm}>
                        جمع:{" "}
                        {formatNumber(
                          (parseNumber(row.quantity) || 1) *
                            (parseNumber(row.unitPrice) || 0),
                        )}{" "}
                        ریال
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.totalBox}>
                  <Text style={styles.totalTitle}>مبلغ کل فاکتور:</Text>
                  <Text style={styles.totalAmount}>
                    {formatNumber(grandTotal)}{" "}
                    <Text style={styles.currencyText}>ریال</Text>
                  </Text>
                </View>
                <View style={styles.wordsBox}>
                  <Text style={styles.wordsText}>
                    {convertNumberToPersianWords(grandTotal)}
                  </Text>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={["#0f4c75", "#3282b8"]}
                style={styles.card}
              >
                <Text style={styles.sectionTitle}>توضیحات فاکتور</Text>
                <CustomTextInput
                  style={{
                    height: 95,
                    textAlignVertical: "top",
                    lineHeight: 24,
                  }}
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
                    <Text style={styles.exportMenuText}>تصویر (PNG)</Text>
                  </TouchableOpacity>
                  <View style={styles.exportMenuDivider} />
                  <TouchableOpacity
                    onPress={() => handleExport("pdf")}
                    style={styles.exportMenuItem}
                  >
                    <Text style={styles.exportMenuText}>فایل (PDF)</Text>
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
    paddingBottom: 110,
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
    fontSize: 14,
    color: "#ffffff",
    textAlign: "right",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  labelSm: {
    fontFamily: "Vazirmatn",
    fontSize: 13,
    color: "#ffffff",
    textAlign: "right",
    marginBottom: 4,
  },
  input: {
    fontFamily: "Vazirmatn",
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
    paddingVertical: 10, // ارتفاع متناسب
    paddingHorizontal: 2, // کاهش فاصله داخلی تا متن جا شود
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
    fontFamily: "Vazirmatn",
    color: "#fff",
    fontSize: 12, // سایز بهینه برای اینکه تو یک خط جا بشه
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
    color: "#fff",
    fontSize: 15,
    textAlign: "right",
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: "Vazirmatn",
    color: "#fff",
    fontSize: 22,
    textAlign: "left",
  },
  currencyText: {
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
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
    fontFamily: "Vazirmatn",
    color: "#fff",
    fontSize: 15,
  },
  exportMenuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },

  // ================= PREVIEW STYLES =================
  previewContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  previewCard: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 15,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#0f4c75",
    minHeight: 500,
  },
  previewHeader: {
    borderBottomWidth: 2,
    borderBottomColor: "#3282b8",
    paddingBottom: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  previewHeaderCenter: {
    alignItems: "center",
  },
  previewTitle: {
    fontFamily: "Vazirmatn",
    fontSize: 24,
    color: "#0d2b43",
    marginBottom: 5,
  },
  previewSubBrand: {
    fontFamily: "Vazirmatn",
    fontSize: 20,
    color: "#1b262c",
  },
  previewMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#eaf6fc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#086bad",
    marginBottom: 15,
  },
  previewMetaText: {
    fontFamily: "Vazirmatn",
    fontSize: 14,
    color: "#0a2c43",
  },
  previewParties: {
    marginBottom: 15,
  },
  previewBuyerBox: {
    backgroundColor: "#eaf6fc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#086bad",
  },
  previewBuyerName: {
    fontFamily: "Vazirmatn",
    fontSize: 16,
    color: "#0a2c43",
    textAlign: "right",
    marginBottom: 8,
  },
  previewBuyerDetails: {
    fontFamily: "Vazirmatn",
    fontSize: 13,
    color: "#0a2c43",
    textAlign: "right",
    marginBottom: 4,
  },
  previewTable: {
    borderWidth: 1.5,
    borderColor: "#086bad",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  previewTableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#bbe1fa",
    borderBottomWidth: 1.5,
    borderBottomColor: "#086bad",
  },
  previewTh: {
    fontFamily: "Vazirmatn",
    padding: 8,
    fontSize: 12,
    color: "#0a2c43",
    textAlign: "center",
    borderLeftWidth: 1.5,
    borderLeftColor: "#086bad",
  },
  previewTableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1.5,
    borderBottomColor: "#086bad",
    backgroundColor: "#fff",
  },
  previewTd: {
    fontFamily: "Vazirmatn",
    padding: 8,
    fontSize: 13,
    color: "#2d2a24",
    textAlign: "center",
    borderLeftWidth: 1.5,
    borderLeftColor: "#086bad",
  },
  previewTotalFinal: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#bbe1fa",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  previewTotalLabel: {
    fontFamily: "Vazirmatn",
    fontSize: 15,
    color: "#0a2c43",
  },
  previewTotalValue: {
    fontFamily: "Vazirmatn",
    fontSize: 18,
    color: "#1b262c",
  },
  previewNoteBox: {
    backgroundColor: "#eaf6fc",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3282b8",
    marginBottom: 15,
  },
  previewNoteLabel: {
    fontFamily: "Vazirmatn",
    fontSize: 15,
    color: "#0a2c43",
    textAlign: "right",
    marginBottom: 5,
  },
  previewNoteText: {
    fontFamily: "Vazirmatn",
    fontSize: 14,
    color: "#1b262c",
    textAlign: "right",
    lineHeight: 22,
  },
  previewFooter: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 15,
  },
  previewDivider: {
    width: "60%",
    height: 2,
    backgroundColor: "#3282b8",
    marginBottom: 10,
    borderStyle: "dashed",
  },
  previewFooterText: {
    fontFamily: "Vazirmatn",
    fontSize: 13,
    color: "#1b262c",
    marginBottom: 4,
  },
});
