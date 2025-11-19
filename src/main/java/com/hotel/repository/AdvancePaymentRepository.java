package com.hotel.repository;

import com.hotel.entity.AdvancePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AdvancePaymentRepository extends JpaRepository<AdvancePayment, Long> {

    List<AdvancePayment> findByGuestId(Long guestId);

    @Query("SELECT SUM(ap.paymentAmount) FROM AdvancePayment ap WHERE ap.guestId = ?1")
    BigDecimal findTotalAdvancePaymentByGuestId(Long guestId);
}