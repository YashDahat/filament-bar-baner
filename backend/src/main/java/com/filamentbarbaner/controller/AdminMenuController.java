package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.MenuItemDto;
import com.filamentbarbaner.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/menu-items")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMenuController {

    private final MenuService menuService;

    public AdminMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping
    public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto createdMenuItem = menuService.createMenuItem(menuItemDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMenuItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable UUID id, @Valid @RequestBody MenuItemDto menuItemDto) {
        Optional<MenuItemDto> updatedMenuItem = menuService.updateMenuItem(id, menuItemDto);
        return updatedMenuItem.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}