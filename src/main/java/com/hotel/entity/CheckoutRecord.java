package com.hotel.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkout_records")
public class CheckoutRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_id", nullable = false)
    private Long guestId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "advance_payment")
    private BigDecimal advancePayment = BigDecimal.ZERO;

    @Column(name = "actual_payment", nullable = false)
    private BigDecimal actualPayment;

    @Column(name = "change_amount")
    private BigDecimal changeAmount = BigDecimal.ZERO;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "checkout_date", nullable = false)
    private LocalDate checkoutDate;

    @Column(name = "receipt_number")
    private String receiptNumber;

    private String remark;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 关联客人信息
    @Transient
    private String guestName;

    public CheckoutRecord() {
        this.checkoutDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
        // 生成收据号
        this.receiptNumber = generateReceiptNumber();
    }

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getAdvancePayment() { return advancePayment; }
    public void setAdvancePayment(BigDecimal advancePayment) { this.advancePayment = advancePayment; }

    public BigDecimal getActualPayment() { return actualPayment; }
    public void setActualPayment(BigDecimal actualPayment) {
        this.actualPayment = actualPayment;
        calculateChangeAmount();
    }

    public BigDecimal getChangeAmount() { return changeAmount; }
    public void setChangeAmount(BigDecimal changeAmount) { this.changeAmount = changeAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDate getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDate checkoutDate) { this.checkoutDate = checkoutDate; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    // 计算找零金额
    private void calculateChangeAmount() {
        if (this.actualPayment != null && this.totalAmount != null && this.advancePayment != null) {
            BigDecimal netAmount = this.totalAmount.subtract(this.advancePayment);
            if (this.actualPayment.compareTo(netAmount) > 0) {
                this.changeAmount = this.actualPayment.subtract(netAmount);
            } else {
                this.changeAmount = BigDecimal.ZERO;
            }
        }
    }

    // 生成收据号
    private String generateReceiptNumber() {
        return "RCP" + System.currentTimeMillis();
    }
}