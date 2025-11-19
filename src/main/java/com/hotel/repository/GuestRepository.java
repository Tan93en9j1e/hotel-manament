package com.hotel.repository;

import com.hotel.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByRoomNumber(String roomNumber);

    List<Guest> findByNameContaining(String name);

    @Query("SELECT g FROM Guest g WHERE g.expectedCheckOutDate >= ?1")
    List<Guest> findCurrentGuests(LocalDate date);

    List<Guest> findByCheckInDateBetween(LocalDate start, LocalDate end);
}