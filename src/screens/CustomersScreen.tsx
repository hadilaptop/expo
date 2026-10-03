import React, { useState, useMemo , useEffect, useRef} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  Modal,
  Animated,
  Dimensions
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScrollWrapper, { AnimatedScrollWrapperRef } from '../components/AnimatedScrollWrapper';
import Header from '../components/Header';
import {
  toPersianDigits,formatNumber,parseNumber,convertNumberToPersianWords,
} from "../utils/numberUtils";
import CustomText from '../components/CustomText';
import CustomTextInput from '../components/CustomTextInput';

export default function CustomersScreen({ 
  onNavigate = (screen: string) => {},
  customers = [
    // داده‌های تستی موقت برای اینکه ظاهر را ببینید
    { id: '101', name: 'شرکت مکعب طلایی', phone: '09123456789' },
    { id: '102', name: 'صنایع سپاهان پخت', phone: '09131112233' },
  ], 
  onDeleteCustomer = (id: string) => {},
  onEditCustomer = (customer: any) => {},
  onSelectCustomerLedger = (customer: any) => {}
}) {
  const searchRef = useRef<AnimatedScrollWrapperRef>(null);
  const scrollRef = useRef<AnimatedScrollWrapperRef>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteModalData, setDeleteModalData] = useState<any>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.trim().toLowerCase();
    return customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) || 
      (c.phone && c.phone.includes(query))
    );
  }, [customers, searchQuery]);
  
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;


  const handleClose = () => {
    searchRef.current?.close ();
    scrollRef.current?.close(() => {
      onNavigate("dashboard");
    });
  };

  const confirmDelete = () => {
    if (deleteModalData) onDeleteCustomer(deleteModalData.id);
    setDeleteModalData(null);
  };


  return (
    <View style={styles.overlay} onStartShouldSetResponder={() => {
        if (activeDropdown) setActiveDropdown(null);
        return false;
    }}>
      
      {/* هدر */}
      <Header
        title=" مدیریت مشتریان"
        onBack={handleClose}
        iconName="arrow-back"
      />

      {/* جستجو */}
      <AnimatedScrollWrapper
        ref={searchRef}
       style={[styles.searchContainer, { transform: [{ translateX: slideAnim }] }]}>
<View style={styles.searchWrapper}>
          {/* سمت چپ: جایگاه ثابت برای ذره‌بین یا ضربدر */}
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.iconWrapper}>
              <View style={styles.clearBtn}>
                <Ionicons name="close" size={16} color="#0f4c75" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="search" size={20} color="#0f4c75" />
            </View>
          )}
          
          {/* کادر جستجو */}
          <CustomTextInput 
            style={styles.searchInput}
            placeholder="جستجوی نام یا شماره مشتری..."
            placeholderTextColor="#8da4b5"
            value={searchQuery}
            onChangeText={setSearchQuery}
            disableFocusStyle={true}
          />
        </View>
      </AnimatedScrollWrapper>

      {/* لیست مشتریان */}
      <AnimatedScrollWrapper
        ref={scrollRef}
        style={{ flex: 1, transform: [{ translateX: slideAnim }] }}
        contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <View key={customer.id} style={styles.customerCardWrapper}>
              
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.customerCard}
                onPress={() => onSelectCustomerLedger(customer)}
              >
                <LinearGradient
                  colors={['#0f4c75', '#3282b8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} color="#b3d4e6" />
                  </View>
                  
                  <View style={styles.info}>
                    <CustomText style={styles.name}>{customer.name}</CustomText>
                    <CustomText style={styles.code}>کد مشتری: {toPersianDigits(customer.id)}</CustomText>
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionBtn, activeDropdown === customer.id && styles.actionBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === customer.id ? null : customer.id);
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={25} color="#ffffffe1" />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>

              {/* منوی دراپ‌داون */}
              {activeDropdown === customer.id && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity 
                    style={styles.dropdownItem} 
                    onPress={() => { setActiveDropdown(null); onEditCustomer(customer); }}
                  >
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <CustomText style={styles.dropdownText}>ویرایش مشخصات</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { borderBottomWidth: 0 }]} 
                    onPress={() => { setActiveDropdown(null); setDeleteModalData(customer); }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff5c5c" />
                    <CustomText style={[styles.dropdownText, { color: '#ff5c5c' }]}>حذف مشتری</CustomText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <CustomText style={styles.emptyText}>
             {searchQuery.trim() ? ` مشتری با این مشخصات یافت نشد. ` : "هنوز مشتری ثبت نشده است."}
          </CustomText>
        )}
      </AnimatedScrollWrapper>

      {/* مودال تایید حذف */}
      <Modal visible={!!deleteModalData} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#0d2b43', '#0f4c75']} style={styles.modalBox}>
            <View style={styles.modalIconBg}>
              <Ionicons name="trash-outline" size={32} color="#ff5c5c" />
            </View>
            <CustomText style={styles.modalTitle}>آیا از حذف مطمئن هستید؟</CustomText>
            <CustomText style={styles.modalText}>تمام پرداختی‌ها و فاکتورهای مرتبط با این شخص نیز حذف خواهند شد و قابل بازگشت نیست.</CustomText>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setDeleteModalData(null)}>
                <CustomText style={styles.cancelBtnText}>انصراف</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.dangerBtn]} onPress={confirmDelete}>
                <CustomText style={styles.dangerBtnText}>بله حذف شود</CustomText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#eaf6fc',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: "#ffffff",
    lineHeight: 28,
    textAlign: "right",
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexGrow: 0,
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    zIndex: 1,
  },
searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#b3d4e6',
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#0d2b43',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrapper: {
    width: 30, // عرض ثابت باعث می‌شود هنگام تغییر آیکون، کادر متن جابجا نشود
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0d2b43',
    textAlign: 'right',
  },
  clearBtn: {
    width: 26,
    height: 26,
    backgroundColor: '#eaf6fc',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  customerCardWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  customerCard: {
    width: '100%',
    shadowColor: '#3b5998',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 15,
  },
  cardGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'right',
  },
  code: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#0f4c75',
    borderWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 10,
    minWidth: 160,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#778ca1',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#0f4c75',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2e557c',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  modalIconBg: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 92, 92, 0.15)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#aab7c8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 2,
    borderColor: '#2e557c',
  },
  cancelBtnText: {
    color: '#dee1e4',
  },
  dangerBtn: {
    backgroundColor: '#ff5c5c',
  },
  dangerBtnText: {
    color: '#ffffff',
  }
});