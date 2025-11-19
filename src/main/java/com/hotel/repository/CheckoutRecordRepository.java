package com.hotel.repository;

import com.hotel.entity.CheckoutRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CheckoutRecordRepository extends JpaRepository<CheckoutRecord, Long> {

    List<CheckoutRecord> findByGuestId(Long guestId);

    List<CheckoutRecord> findByCheckoutDateBetween(LocalDate start, LocalDate end);
}