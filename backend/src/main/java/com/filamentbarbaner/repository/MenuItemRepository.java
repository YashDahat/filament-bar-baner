package com.filamentbarbaner.repository;

import com.filamentbarbaner.model.MenuItem;
import com.filamentbarbaner.model.MenuItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByCategory(MenuItemCategory category);
}