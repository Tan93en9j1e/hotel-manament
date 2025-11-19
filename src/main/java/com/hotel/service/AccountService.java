package com.hotel.service;

import com.hotel.entity.*;
import com.hotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private GuestAccountRepository guestAccountRepository;

    @Autowired
    private AdvancePaymentRepository advancePaymentRepository;

    @Autowired
    private CheckoutRecordRepository checkoutRecordRepository;

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    @Autowired
    private ConsumptionItemRepository consumptionItemRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private RoomRepository roomRepository;

    // 客人账务相关方法
    public List<GuestAccount> getAllGuestAccounts() {
        List<GuestAccount> accounts = guestAccountRepository.findAll();
        // 填充客人姓名
        accounts.forEach(account -> {
            guestRepository.findById(account.getGuestId()).ifPresent(guest -> {
                account.setGuestName(guest.getName());
            });
        });
        return accounts;
    }

    public List<GuestAccount> getGuestAccountsByGuestId(Long guestId) {
        return guestAccountRepository.findByGuestId(guestId);
    }

    public List<GuestAccount> getUnsettledAccounts() {
        return guestAccountRepository.findByIsSettled(false);
    }

    public List<GuestAccount> getUnsettledAccountsByGuestId(Long guestId) {
        return guestAccountRepository.findByGuestIdAndIsSettled(guestId, false);
    }

    public GuestAccount saveGuestAccount(GuestAccount guestAccount) {
        // 验证客人是否存在
        if (!guestRepository.existsById(guestAccount.getGuestId())) {
            throw new RuntimeException("客人ID " + guestAccount.getGuestId() + " 不存在");
        }

        // 验证房间是否存在
        if (roomRepository.findByRoomNumber(guestAccount.getRoomNumber()).isEmpty()) {
            throw new RuntimeException("房间 " + guestAccount.getRoomNumber() + " 不存在");
        }

        return guestAccountRepository.save(guestAccount);
    }

    public void deleteGuestAccount(Long id) {
        guestAccountRepository.deleteById(id);
    }

    // 预付款相关方法
    public List<AdvancePayment> getAllAdvancePayments() {
        List<AdvancePayment> payments = advancePaymentRepository.findAll();
        // 填充客人姓名
        payments.forEach(payment -> {
            guestRepository.findById(payment.getGuestId()).ifPresent(guest -> {
                payment.setGuestName(guest.getName());
            });
        });
        return payments;
    }

    public List<AdvancePayment> getAdvancePaymentsByGuestId(Long guestId) {
        return advancePaymentRepository.findByGuestId(guestId);
    }

    public AdvancePayment saveAdvancePayment(AdvancePayment advancePayment) {
        // 验证客人是否存在
        if (!guestRepository.existsById(advancePayment.getGuestId())) {
            throw new RuntimeException("客人ID " + advancePayment.getGuestId() + " 不存在");
        }

        // 验证房间是否存在
        if (roomRepository.findByRoomNumber(advancePayment.getRoomNumber()).isEmpty()) {
            throw new RuntimeException("房间 " + advancePayment.getRoomNumber() + " 不存在");
        }

        return advancePaymentRepository.save(advancePayment);
    }

    // 结账相关方法
    public List<CheckoutRecord> getAllCheckoutRecords() {
        List<CheckoutRecord> records = checkoutRecordRepository.findAll();
        // 填充客人姓名
        records.forEach(record -> {
            guestRepository.findById(record.getGuestId()).ifPresent(guest -> {
                record.setGuestName(guest.getName());
            });
        });
        return records;
    }

    public CheckoutRecord saveCheckoutRecord(CheckoutRecord checkoutRecord) {
        // 验证客人是否存在
        if (!guestRepository.existsById(checkoutRecord.getGuestId())) {
            throw new RuntimeException("客人ID " + checkoutRecord.getGuestId() + " 不存在");
        }

        return checkoutRecordRepository.save(checkoutRecord);
    }

    // 账务类型和消费项目相关方法
    public List<AccountType> getAllAccountTypes() {
        return accountTypeRepository.findAll();
    }

    public List<ConsumptionItem> getAllConsumptionItems() {
        return consumptionItemRepository.findAll();
    }

    public List<ConsumptionItem> getConsumptionItemsByType(String itemType) {
        return consumptionItemRepository.findByItemType(itemType);
    }

    // 计算客人总欠款
    public BigDecimal calculateTotalUnsettledAmount(Long guestId) {
        BigDecimal totalConsumption = guestAccountRepository.findTotalUnsettledAmountByGuestId(guestId);
        BigDecimal totalAdvance = advancePaymentRepository.findTotalAdvancePaymentByGuestId(guestId);

        if (totalConsumption == null) {
            totalConsumption = BigDecimal.ZERO;
        }
        if (totalAdvance == null) {
            totalAdvance = BigDecimal.ZERO;
        }

        return totalConsumption.subtract(totalAdvance);
    }

    // 办理结账
    public CheckoutRecord checkoutGuest(Long guestId, String paymentMethod, BigDecimal actualPayment, String remark) {
        // 获取客人信息
        Optional<Guest> guestOpt = guestRepository.findById(guestId);
        if (guestOpt.isEmpty()) {
            throw new RuntimeException("客人ID " + guestId + " 不存在");
        }
        Guest guest = guestOpt.get();

        // 计算总消费金额
        BigDecimal totalConsumption = guestAccountRepository.findTotalUnsettledAmountByGuestId(guestId);
        if (totalConsumption == null) {
            totalConsumption = BigDecimal.ZERO;
        }

        // 计算总预付款
        BigDecimal totalAdvance = advancePaymentRepository.findTotalAdvancePaymentByGuestId(guestId);
        if (totalAdvance == null) {
            totalAdvance = BigDecimal.ZERO;
        }

        // 创建结账记录
        CheckoutRecord checkoutRecord = new CheckoutRecord();
        checkoutRecord.setGuestId(guestId);
        checkoutRecord.setRoomNumber(guest.getRoomNumber());
        checkoutRecord.setTotalAmount(totalConsumption);
        checkoutRecord.setAdvancePayment(totalAdvance);
        checkoutRecord.setActualPayment(actualPayment);
        checkoutRecord.setPaymentMethod(paymentMethod);
        checkoutRecord.setRemark(remark);

        // 保存结账记录
        CheckoutRecord savedRecord = checkoutRecordRepository.save(checkoutRecord);

        // 标记所有账务记录为已结算
        List<GuestAccount> unsettledAccounts = guestAccountRepository.findByGuestIdAndIsSettled(guestId, false);
        unsettledAccounts.forEach(account -> {
            account.setIsSettled(true);
            account.setSettledDate(LocalDate.now());
        });
        guestAccountRepository.saveAll(unsettledAccounts);

        // 释放房间
        roomRepository.findByRoomNumber(guest.getRoomNumber()).ifPresent(room -> {
            room.setStatus("AVAILABLE");
            roomRepository.save(room);
        });

        return savedRecord;
    }
}