package com.hotel.controller;

import com.hotel.entity.*;
import com.hotel.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "file://"})
public class AccountController {

    @Autowired
    private AccountService accountService;

    // 客人账务相关接口
    @GetMapping("/guest-accounts")
    public List<GuestAccount> getAllGuestAccounts() {
        return accountService.getAllGuestAccounts();
    }

    @GetMapping("/guest-accounts/guest/{guestId}")
    public List<GuestAccount> getGuestAccountsByGuestId(@PathVariable Long guestId) {
        return accountService.getGuestAccountsByGuestId(guestId);
    }

    @GetMapping("/guest-accounts/unsettled")
    public List<GuestAccount> getUnsettledAccounts() {
        return accountService.getUnsettledAccounts();
    }

    @GetMapping("/guest-accounts/unsettled/guest/{guestId}")
    public List<GuestAccount> getUnsettledAccountsByGuestId(@PathVariable Long guestId) {
        return accountService.getUnsettledAccountsByGuestId(guestId);
    }

    @PostMapping("/guest-accounts")
    public ResponseEntity<?> createGuestAccount(@RequestBody GuestAccount guestAccount) {
        try {
            GuestAccount savedAccount = accountService.saveGuestAccount(guestAccount);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/guest-accounts/{id}")
    public ResponseEntity<?> deleteGuestAccount(@PathVariable Long id) {
        try {
            accountService.deleteGuestAccount(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 预付款相关接口
    @GetMapping("/advance-payments")
    public List<AdvancePayment> getAllAdvancePayments() {
        return accountService.getAllAdvancePayments();
    }

    @GetMapping("/advance-payments/guest/{guestId}")
    public List<AdvancePayment> getAdvancePaymentsByGuestId(@PathVariable Long guestId) {
        return accountService.getAdvancePaymentsByGuestId(guestId);
    }

    @PostMapping("/advance-payments")
    public ResponseEntity<?> createAdvancePayment(@RequestBody AdvancePayment advancePayment) {
        try {
            AdvancePayment savedPayment = accountService.saveAdvancePayment(advancePayment);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 结账相关接口
    @GetMapping("/checkout-records")
    public List<CheckoutRecord> getAllCheckoutRecords() {
        return accountService.getAllCheckoutRecords();
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutGuest(@RequestBody Map<String, Object> checkoutData) {
        try {
            Long guestId = Long.valueOf(checkoutData.get("guestId").toString());
            String paymentMethod = (String) checkoutData.get("paymentMethod");
            BigDecimal actualPayment = new BigDecimal(checkoutData.get("actualPayment").toString());
            String remark = (String) checkoutData.get("remark");

            CheckoutRecord record = accountService.checkoutGuest(guestId, paymentMethod, actualPayment, remark);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 账务类型和消费项目相关接口
    @GetMapping("/account-types")
    public List<AccountType> getAllAccountTypes() {
        return accountService.getAllAccountTypes();
    }

    @GetMapping("/consumption-items")
    public List<ConsumptionItem> getAllConsumptionItems() {
        return accountService.getAllConsumptionItems();
    }

    @GetMapping("/consumption-items/type/{itemType}")
    public List<ConsumptionItem> getConsumptionItemsByType(@PathVariable String itemType) {
        return accountService.getConsumptionItemsByType(itemType);
    }

    // 计算客人欠款
    @GetMapping("/unsettled-amount/guest/{guestId}")
    public ResponseEntity<BigDecimal> getUnsettledAmountByGuestId(@PathVariable Long guestId) {
        BigDecimal amount = accountService.calculateTotalUnsettledAmount(guestId);
        return ResponseEntity.ok(amount);
    }
}