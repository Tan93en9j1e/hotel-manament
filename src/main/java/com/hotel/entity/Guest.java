package com.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "guests")
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "姓名不能为空")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "性别不能为空")
    private String gender;

    private String origin;

    @Column(name = "work_unit")
    private String workUnit;

    private String profession;

    @Column(name = "reason_for_stay")
    private String reasonForStay;

    @NotNull(message = "入住日期不能为空")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull(message = "预计离店日期不能为空")
    @Column(name = "expected_check_out_date", nullable = false)
    private LocalDate expectedCheckOutDate;

    @NotBlank(message = "房间号不能为空")
    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "room_change_history")
    private String roomChangeHistory;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Guest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getWorkUnit() { return workUnit; }
    public void setWorkUnit(String workUnit) { this.workUnit = workUnit; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public String getReasonForStay() { return reasonForStay; }
    public void setReasonForStay(String reasonForStay) { this.reasonForStay = reasonForStay; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getExpectedCheckOutDate() { return expectedCheckOutDate; }
    public void setExpectedCheckOutDate(LocalDate expectedCheckOutDate) { this.expectedCheckOutDate = expectedCheckOutDate; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getRoomChangeHistory() { return roomChangeHistory; }
    public void setRoomChangeHistory(String roomChangeHistory) { this.roomChangeHistory = roomChangeHistory; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}