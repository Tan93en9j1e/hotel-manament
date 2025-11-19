package com.hotel.repository;

import com.hotel.entity.GuestAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuestAccountRepository extends JpaRepository<GuestAccount, Long> {

    List<GuestAccount> findByGuestId(Long guestId);

    List<GuestAccount> findByRoomNumber(String roomNumber);

    List<GuestAccount> findByIsSettled(Boolean isSettled);

    List<GuestAccount> findByGuestIdAndIsSettled(Long guestId, Boolean isSettled);

    @Query("SELECT SUM(ga.totalAmount) FROM GuestAccount ga WHERE ga.guestId = ?1 AND ga.isSettled = false")
    BigDecimal findTotalUnsettledAmountByGuestId(Long guestId);

    @Query("SELECT ga FROM GuestAccount ga WHERE ga.consumptionDate BETWEEN ?1 AND ?2")
    List<GuestAccount> findByConsumptionDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT ga FROM GuestAccount ga WHERE ga.guestId = ?1 AND ga.consumptionDate BETWEEN ?2 AND ?3")
    List<GuestAccount> findByGuestIdAndConsumptionDateBetween(Long guestId, LocalDate start, LocalDate end);
}