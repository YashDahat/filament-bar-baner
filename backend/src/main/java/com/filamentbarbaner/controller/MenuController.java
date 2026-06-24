package com.filamentbarbaner.controller;

import com.filamentbarbaner.dto.MenuItemDto;
import com.filamentbarbaner.model.MenuItemCategory;
import com.filamentbarbaner.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/menu-items")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<List<MenuItemDto>> getMenuItems(@RequestParam(required = false) Optional<MenuItemCategory> category) {
        List<MenuItemDto> menuItems = menuService.getAllMenuItems(category);
        return ResponseEntity.ok(menuItems);
    }
}