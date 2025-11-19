package com.hotel.controller;

import com.hotel.entity.Guest;
import com.hotel.service.GuestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "file://"})
public class GuestController {

    @Autowired
    private GuestService guestService;

    @GetMapping
    public List<Guest> getAllGuests() {
        return guestService.getAllGuests();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guest> getGuestById(@PathVariable Long id) {
        Optional<Guest> guest = guestService.getGuestById(id);
        return guest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createGuest(@Valid @RequestBody Guest guest) {
        try {
            Guest savedGuest = guestService.saveGuest(guest);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGuest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGuest(@PathVariable Long id, @Valid @RequestBody Guest guestDetails) {
        try {
            Guest updatedGuest = guestService.updateGuest(id, guestDetails);
            return ResponseEntity.ok(updatedGuest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGuest(@PathVariable Long id) {
        try {
            guestService.deleteGuest(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public List<Guest> searchGuests(@RequestParam String name) {
        return guestService.searchGuestsByName(name);
    }

    @GetMapping("/current")
    public List<Guest> getCurrentGuests() {
        return guestService.getCurrentGuests();
    }
}