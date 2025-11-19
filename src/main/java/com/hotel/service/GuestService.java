package com.hotel.service;

import com.hotel.entity.Guest;
import com.hotel.entity.Room;
import com.hotel.repository.GuestRepository;
import com.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GuestService {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private RoomRepository roomRepository;

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    public Optional<Guest> getGuestById(Long id) {
        return guestRepository.findById(id);
    }

    public Guest saveGuest(Guest guest) {
        // 检查房间是否存在且可用
        Optional<Room> roomOpt = roomRepository.findByRoomNumber(guest.getRoomNumber());
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            if ("AVAILABLE".equals(room.getStatus())) {
                // 更新房间状态为占用
                room.setStatus("OCCUPIED");
                roomRepository.save(room);

                return guestRepository.save(guest);
            } else {
                throw new RuntimeException("房间 " + guest.getRoomNumber() + " 当前不可用");
            }
        } else {
            throw new RuntimeException("房间 " + guest.getRoomNumber() + " 不存在");
        }
    }

    public Guest updateGuest(Long id, Guest guestDetails) {
        Optional<Guest> guestOpt = guestRepository.findById(id);
        if (guestOpt.isPresent()) {
            Guest guest = guestOpt.get();

            // 如果更换了房间，更新房间状态
            if (!guest.getRoomNumber().equals(guestDetails.getRoomNumber())) {
                // 释放原房间
                Optional<Room> oldRoomOpt = roomRepository.findByRoomNumber(guest.getRoomNumber());
                oldRoomOpt.ifPresent(room -> {
                    room.setStatus("AVAILABLE");
                    roomRepository.save(room);
                });

                // 占用新房间
                Optional<Room> newRoomOpt = roomRepository.findByRoomNumber(guestDetails.getRoomNumber());
                if (newRoomOpt.isPresent()) {
                    Room newRoom = newRoomOpt.get();
                    if ("AVAILABLE".equals(newRoom.getStatus())) {
                        newRoom.setStatus("OCCUPIED");
                        roomRepository.save(newRoom);

                        // 记录换房历史
                        String changeHistory = guest.getRoomChangeHistory();
                        if (changeHistory == null) {
                            changeHistory = "";
                        }
                        changeHistory += String.format("从 %s 换到 %s (%s); ",
                                guest.getRoomNumber(), guestDetails.getRoomNumber(), LocalDate.now());
                        guestDetails.setRoomChangeHistory(changeHistory);
                    } else {
                        throw new RuntimeException("房间 " + guestDetails.getRoomNumber() + " 当前不可用");
                    }
                } else {
                    throw new RuntimeException("房间 " + guestDetails.getRoomNumber() + " 不存在");
                }
            }

            guest.setName(guestDetails.getName());
            guest.setGender(guestDetails.getGender());
            guest.setOrigin(guestDetails.getOrigin());
            guest.setWorkUnit(guestDetails.getWorkUnit());
            guest.setProfession(guestDetails.getProfession());
            guest.setReasonForStay(guestDetails.getReasonForStay());
            guest.setCheckInDate(guestDetails.getCheckInDate());
            guest.setExpectedCheckOutDate(guestDetails.getExpectedCheckOutDate());
            guest.setRoomNumber(guestDetails.getRoomNumber());
            guest.setRoomChangeHistory(guestDetails.getRoomChangeHistory());
            guest.setUpdatedAt(java.time.LocalDateTime.now());

            return guestRepository.save(guest);
        } else {
            throw new RuntimeException("客人ID " + id + " 不存在");
        }
    }

    public void deleteGuest(Long id) {
        Optional<Guest> guestOpt = guestRepository.findById(id);
        if (guestOpt.isPresent()) {
            Guest guest = guestOpt.get();

            // 释放房间
            Optional<Room> roomOpt = roomRepository.findByRoomNumber(guest.getRoomNumber());
            roomOpt.ifPresent(room -> {
                room.setStatus("AVAILABLE");
                roomRepository.save(room);
            });

            guestRepository.deleteById(id);
        } else {
            throw new RuntimeException("客人ID " + id + " 不存在");
        }
    }

    public List<Guest> searchGuestsByName(String name) {
        return guestRepository.findByNameContaining(name);
    }

    public List<Guest> getCurrentGuests() {
        return guestRepository.findCurrentGuests(LocalDate.now());
    }
}