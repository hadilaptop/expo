import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// --- توابع کمکی ---
const toPersianDigits = (str: string | number) => {
  if (str === null || str === undefined) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
};

const formatNumber = (num: number | string) => {
  if (!num) return "";
  const cleanNum = num
    .toString()
    .replace(/,/g, "")
    .replace(/[۰-۹]/g, (c) => "0123456789"[c.charCodeAt(0) - 1776]);
  if (isNaN(Number(cleanNum)) || cleanNum === "") return "";
  return toPersianDigits(Number(cleanNum).toLocaleString("en-US"));
};

const parseNumber = (str: string | number) => {
  if (!str) return 0;
  if (typeof str === "number") return str;
  const englishStr = str
    .toString()
    .replace(/[۰-۹]/g, (c) => "0123456789"[c.charCodeAt(0) - 1776])
    .replace(/,/g, "");
  return parseInt(englishStr, 10) || 0;
};

// تعریف تایپ‌های مربوط به Props
interface InvoicePreviewProps {
  invoiceType: string;
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyerName: string;
  buyerPhone: string;
  buyerEconomicCode: string;
  buyerAddress: string;
  rows: any[];
  grandTotal: number;
  noteText: string;
}

export default function InvoicePreview({
  invoiceType,
  sellerName,
  sellerAddress,
  sellerPhone,
  invoiceNumber,
  invoiceDate,
  buyerName,
  buyerPhone,
  buyerEconomicCode,
  buyerAddress,
  rows,
  grandTotal,
  noteText
}: InvoicePreviewProps) {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View style={styles.previewHeaderCenter}>
            <Text style={styles.previewTitle}>{invoiceType}</Text>
            <Text style={styles.previewSubBrand}>{sellerName}</Text>
          </View>
        </View>

        <View style={styles.previewMeta}>
          <Text style={styles.previewMetaText}>
            شماره فاکتور: {toPersianDigits(invoiceNumber)}
          </Text>
          <Text style={styles.previewMetaText}>
            تاریخ: {toPersianDigits(invoiceDate)}
          </Text>
        </View>

        <View style={styles.previewParties}>
          <View style={styles.previewBuyerBox}>
            <Text style={styles.previewBuyerName}>
              خریدار: {buyerName || "وارد نشده"}
            </Text>
            {buyerPhone ? (
              <Text style={styles.previewBuyerDetails}>
                تلفن: {toPersianDigits(buyerPhone)}
              </Text>
            ) : null}
            {buyerEconomicCode ? (
              <Text style={styles.previewBuyerDetails}>
                کد اقتصادی: {toPersianDigits(buyerEconomicCode)}
              </Text>
            ) : null}
            {buyerAddress ? (
              <Text style={styles.previewBuyerDetails}>
                آدرس: {buyerAddress}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.previewTable}>
          <View style={styles.previewTableHeader}>
            <Text style={[styles.previewTh, { flex: 0.5 }]}>ردیف</Text>
            <Text style={[styles.previewTh, { flex: 2 }]}>شرح کالا</Text>
            <Text style={[styles.previewTh, { flex: 0.8 }]}>تعداد</Text>
            <Text style={[styles.previewTh, { flex: 1.5 }]}>قیمت واحد</Text>
            <Text style={[styles.previewTh, { flex: 1.5 }]}>جمع کل</Text>
          </View>
          {rows.map((row: any, idx: number) => {
            const q = parseNumber(row.quantity) || 1;
            const p = parseNumber(row.unitPrice) || 0;
            return (
              <View key={idx} style={styles.previewTableRow}>
                <Text style={[styles.previewTd, { flex: 0.5 }]}>
                  {toPersianDigits(idx + 1)}
                </Text>
                <Text
                  style={[
                    styles.previewTd,
                    { flex: 2, textAlign: "right", paddingRight: 5 },
                  ]}
                >
                  {row.desc || "---"}
                </Text>
                <Text style={[styles.previewTd, { flex: 0.8 }]}>
                  {toPersianDigits(q)}
                </Text>
                <Text style={[styles.previewTd, { flex: 1.5 }]}>
                  {formatNumber(p)}
                </Text>
                <Text style={[styles.previewTd, { flex: 1.5 }]}>
                  {formatNumber(q * p)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.previewTotalFinal}>
          <Text style={styles.previewTotalLabel}>مبلغ نهایی فاکتور :</Text>
          <Text style={styles.previewTotalValue}>
            {formatNumber(grandTotal)} ریال
          </Text>
        </View>

        {noteText ? (
          <View style={styles.previewNoteBox}>
            <Text style={styles.previewNoteLabel}>توضیحات:</Text>
            <Text style={styles.previewNoteText}>{noteText}</Text>
          </View>
        ) : null}

        <View style={styles.previewFooter}>
          <View style={styles.previewDivider} />
          <Text style={styles.previewFooterText}>{sellerAddress}</Text>
          <Text style={styles.previewFooterText}>
            {toPersianDigits(sellerPhone)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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