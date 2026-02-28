# Database Schema

## Tables

### users_user (Custom User)
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| password | VARCHAR(128) | |
| last_login | DATETIME | NULLABLE |
| is_superuser | BOOLEAN | DEFAULT False |
| username | VARCHAR(150) | UNIQUE |
| first_name | VARCHAR(150) | |
| last_name | VARCHAR(150) | |
| email | VARCHAR(254) | UNIQUE |
| is_staff | BOOLEAN | DEFAULT False |
| is_active | BOOLEAN | DEFAULT True |
| date_joined | DATETIME | |
| name | VARCHAR(255) | NULLABLE |
| avatar | VARCHAR(100) | NULLABLE (upload_to='avatars/') |
| is_verified | BOOLEAN | DEFAULT False |
| business_name | VARCHAR(255) | NULLABLE |
| business_id | VARCHAR(100) | NULLABLE |

### users_passwordresetotp
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY -> users_user(id) |
| otp | VARCHAR(6) | |
| created_at | DATETIME | AUTO NOW ADD |
| expires_at | DATETIME | |

### users_businesstemplate
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(100) | PRIMARY KEY |
| name | VARCHAR(255) | |
| description | TEXT | NULLABLE |
| schema | JSON | DEFAULT list |
| is_active | BOOLEAN | DEFAULT True |
| created_at | DATETIME | AUTO NOW ADD |
| updated_at | DATETIME | AUTO NOW |

### users_subscriptionplan
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| name | VARCHAR(50) | |
| slug | VARCHAR(50) | UNIQUE |
| price | DECIMAL(10,2) | |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| features | JSON | DEFAULT dict |
| is_active | BOOLEAN | DEFAULT True |
| created_at | DATETIME | AUTO NOW ADD |

### users_usersubscription
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY -> users_user(id), UNIQUE |
| plan_id | BIGINT | FOREIGN KEY -> users_subscriptionplan(id) |
| start_date | DATETIME | AUTO NOW ADD |
| end_date | DATETIME | NULLABLE |
| is_active | BOOLEAN | DEFAULT True |

---

### products_category
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| uuid | UUID | UNIQUE |
| user_id | BIGINT | FOREIGN KEY -> users_user(id), NULLABLE |
| name | VARCHAR(255) | |
| description | TEXT | NULLABLE |
| rank | INTEGER | DEFAULT 0 |
| color | VARCHAR(7) | DEFAULT '#000000' |
| thumbnail | VARCHAR(100) | NULLABLE (upload_to='categories/') |
| parent_id | BIGINT | FOREIGN KEY -> products_category(id), NULLABLE |
| created_at | DATETIME | DEFAULT timezone.now |

**Self-referencing:** `parent_id` -> `products_category(id)` (subcategories)

### products_product
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| uuid | UUID | UNIQUE |
| user_id | BIGINT | FOREIGN KEY -> users_user(id), NULLABLE |
| name | VARCHAR(255) | |
| sku | VARCHAR(100) | INDEXED |
| price | DECIMAL(10,2) | |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| description | TEXT | NULLABLE |
| image | VARCHAR(100) | NULLABLE (upload_to='products/') |
| category_id | BIGINT | FOREIGN KEY -> products_category(id), NULLABLE |
| custom_fields | JSON | DEFAULT dict |
| created_at | DATETIME | DEFAULT timezone.now |
| updated_at | DATETIME | AUTO NOW |

**Relationships:**
- `category_id` -> `products_category(id)`

---

### media_mediaitem
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| uuid | UUID | UNIQUE |
| user_id | BIGINT | FOREIGN KEY -> users_user(id) |
| file | VARCHAR(100) | (upload_to='uploads/') |
| name | VARCHAR(255) | |
| type | VARCHAR(50) | DEFAULT 'image' |
| width | INTEGER | NULLABLE |
| height | INTEGER | NULLABLE |
| size_bytes | INTEGER | NULLABLE |
| created_at | DATETIME | DEFAULT timezone.now |

---

### catalogs_theme
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| uuid | UUID | UNIQUE |
| name | VARCHAR(255) | |
| background_color | VARCHAR(50) | |
| heading_color | VARCHAR(50) | |
| body_color | VARCHAR(50) | |
| accent_color | VARCHAR(50) | |
| font_collection | JSON | DEFAULT dict |
| preview_image | VARCHAR(100) | NULLABLE (upload_to='themes/') |

### catalogs_catalog
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| uuid | UUID | UNIQUE |
| name | VARCHAR(255) | |
| owner_id | BIGINT | FOREIGN KEY -> users_user(id) |
| status | VARCHAR(20) | DEFAULT 'draft' (choices: draft, published) |
| settings | JSON | DEFAULT dict |
| product_ids | JSON | DEFAULT list |
| selected_category_ids | JSON | DEFAULT list |
| created_at | DATETIME | DEFAULT timezone.now |
| updated_at | DATETIME | AUTO NOW |

### catalogs_catalogpage
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY |
| catalog_id | BIGINT | FOREIGN KEY -> catalogs_catalog(id) |
| page_number | INTEGER | |
| type | VARCHAR(20) | DEFAULT 'interior' (choices: cover, interior, index, closing) |
| layout_data | JSON | DEFAULT dict |
| category_id | BIGINT | FOREIGN KEY -> products_category(id), NULLABLE |

---

## Relationships Diagram

```
users_user
├── 1:N -> products_category
├── 1:N -> products_product
├── 1:N -> media_mediaitem
├── 1:N -> catalogs_catalog (owner)
├── 1:1 -> users_usersubscription
└── 1:N -> users_passwordresetotp

products_category
├── N:1 -> products_category (parent - self ref)
└── 1:N -> products_product

products_product
└── N:1 -> products_category

catalogs_catalog
└── 1:N -> catalogs_catalogpage

catalogs_catalogpage
├── N:1 -> catalogs_catalog
└── N:1 -> products_category

users_subscriptionplan
└── 1:N -> users_usersubscription

users_usersubscription
├── N:1 -> users_user
└── N:1 -> users_subscriptionplan
```
