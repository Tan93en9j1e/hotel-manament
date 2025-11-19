package com.hotel.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "guest_accounts")
public class GuestAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_id", nullable = false)
    private Long guestId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "account_type", nullable = false)
    private String accountType;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "consumption_date", nullable = false)
    private LocalDate consumptionDate;

    @Column(name = "is_settled")
    private Boolean isSettled = false;

    @Column(name = "settled_date")
    private LocalDate settledDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 关联客人信息（非数据库字段，用于前端显示）
    @Transient
    private String guestName;

    public GuestAccount() {
        this.consumptionDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateTotalAmount();
    }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateTotalAmount();
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDate getConsumptionDate() { return consumptionDate; }
    public void setConsumptionDate(LocalDate consumptionDate) { this.consumptionDate = consumptionDate; }

    public Boolean getIsSettled() { return isSettled; }
    public void setIsSettled(Boolean isSettled) { this.isSettled = isSettled; }

    public LocalDate getSettledDate() { return settledDate; }
    public void setSettledDate(LocalDate settledDate) { this.settledDate = settledDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    // 计算总金额
    private void calculateTotalAmount() {
        if (this.unitPrice != null && this.quantity != null) {
            this.totalAmount = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
    }
}