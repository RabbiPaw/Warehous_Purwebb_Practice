# База данных системы управления складом

## Обзор

Система использует **PostgreSQL** для хранения данных. Все идентификаторы генерируются с помощью `gen_random_uuid()` и хранятся как строки (`varchar(36)`).

**Ключевые особенности:**
- Все ID — UUID строки
- **Мягкое удаление (soft delete)** — данные не удаляются физически, только помечаются как неактивные (`is_active = false`)
- `units` имеют отдельное поле `code` для короткого обозначения (г, кг, мл, шт)
- Связь пользователей и складов через таблицу `user_warehouses` (многие-ко-многим)
- История изменений настроек склада в `warehouse_settings`

---

## Принцип мягкого удаления (Soft Delete)

В системе **запрещено физическое удаление записей**. Вместо этого используется флаг `is_active`:

| Значение | Состояние |
|----------|-----------|
| `true` | Запись активна, используется в системе |
| `false` | Запись неактивна, считается "удаленной" |

**Где применяется:**
- `users.is_active` — уволенный сотрудник становится неактивным
- `roles.is_active` — роль помечается неактивной, но остается в истории
- `units.is_active` — единица измерения помечается неактивной
- `distribution_types.is_active` — тип перемещения помечается неактивным

**Преимущества:**
- Сохранение истории для отчетов и аудита
- Возможность восстановления данных
- Целостность ссылок (внешние ключи не нарушаются)
- Аналитика по всем данным, включая исторические

---

## Таблицы

### 1. roles (Роли пользователей)

Хранит роли для разграничения доступа. Роли не удаляются, только деактивируются.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `name` | `varchar(50)` | `NOT NULL` | Название роли |
| `description` | `text` | - | Описание прав и обязанностей |
| `sort_order` | `smallint` | `DEFAULT 0` | Порядок сортировки |
| `is_active` | `boolean` | `DEFAULT true` | Активность роли (false — не используется) |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:** Нет

---

### 2. users (Пользователи)

Хранит информацию о пользователях системы. При увольнении сотрудник не удаляется, а становится неактивным.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `email` | `varchar(255)` | `NOT NULL, UNIQUE` | Email пользователя |
| `password` | `varchar(100)` | `NOT NULL` | Зашифрованный пароль (bcrypt) |
| `name` | `varchar(50)` | `NOT NULL` | Имя |
| `surname` | `varchar(50)` | `NOT NULL` | Фамилия |
| `patronymic` | `varchar(50)` | - | Отчество |
| `role_id` | `varchar(36)` | `FK → roles(id)` | Идентификатор роли |
| `is_active` | `boolean` | `DEFAULT true` | Активность учетной записи (false — уволен) |
| `last_login_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата последнего входа |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:**
- `idx_users_email` — для быстрого поиска по email
- `idx_users_role_id` — для фильтрации по роли

---

### 3. warehouses (Склады)

Хранит информацию о складах. Склады не удаляются физически.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `name` | `varchar(100)` | `NOT NULL` | Название склада |
| `address` | `text` | `NOT NULL` | Адрес склада |
| `description` | `text` | - | Описание склада |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:** Нет

**Примечание:** Склады не имеют флага `is_active`, так как они не удаляются и не деактивируются. Если склад закрывается, он просто перестает использоваться в новых операциях.

---

### 4. user_warehouses (Доступ пользователей к складам)

Связь многие-ко-многим между пользователями и складами. Определяет, на каких складах пользователь имеет права работы.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `user_id` | `varchar(36)` | `FK → users(id), NOT NULL` | Пользователь |
| `warehouse_id` | `varchar(36)` | `FK → warehouses(id), NOT NULL` | Склад |
| `granted_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата предоставления доступа |
| `granted_by` | `varchar(36)` | `FK → users(id)` | Кто предоставил доступ |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания записи |

**Индексы:**
- `idx_user_warehouses_user_id` — для фильтрации по пользователю
- `idx_user_warehouses_warehouse_id` — для фильтрации по складу

**Уникальное ограничение:** `(user_id, warehouse_id)` — у пользователя не может быть дублирующихся доступов к одному складу.

**Примечание:** Записи в этой таблице не удаляются. Если доступ отзывается, запись остается для истории.

---

### 5. units (Единицы измерения)

Справочник единиц измерения. Не удаляются, только деактивируются.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `code` | `varchar(10)` | `NOT NULL, UNIQUE` | Короткое обозначение (г, кг, мл, шт) |
| `name` | `varchar(30)` | `NOT NULL` | Название единицы измерения |
| `description` | `text` | - | Описание |
| `sort_order` | `smallint` | `DEFAULT 0` | Порядок сортировки |
| `is_active` | `boolean` | `DEFAULT true` | Активность (false — не используется) |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:** Нет

**Данные по умолчанию:**

| code | name | description |
|------|------|-------------|
| `g` | Грамм | Единица измерения веса |
| `ml` | Миллилитр | Единица измерения объема |
| `p` | Штука | Единица измерения количества |
| `mm` | Миллиметр | Единица измерения длины |

---

### 6. products (Товары)

Хранит информацию о товарах. Товары не удаляются, только могут быть деактивированы (опционально).

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `name` | `varchar(100)` | `NOT NULL` | Название товара |
| `description` | `text` | - | Описание товара |
| `unit_id` | `varchar(36)` | `FK → units(id), NOT NULL` | Единица измерения |
| `is_active` | `boolean` | `DEFAULT true` | Активность товара |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:**
- `idx_products_unit_id` — для фильтрации по единице измерения

**Примечание:** Товары имеют флаг `is_active` для возможности скрытия товаров из каталога без потери истории.

---

### 7. suppliers (Поставщики)

Хранит информацию о поставщиках. Поставщики не удаляются.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `name` | `varchar(100)` | `NOT NULL` | Название компании |
| `inn` | `varchar(12)` | `NOT NULL, UNIQUE` | ИНН поставщика |
| `contact` | `text` | - | Контактная информация |
| `is_active` | `boolean` | `DEFAULT true` | Активность поставщика |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:**
- `idx_suppliers_inn` — для быстрого поиска по ИНН

**Примечание:** Поставщики имеют флаг `is_active` для возможности скрытия поставщика без потери истории.

---

### 8. distribution_types (Типы перемещений)

Хранит типы операций с товарами. Типы не удаляются, только деактивируются.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `name` | `varchar(50)` | `NOT NULL` | Название типа |
| `description` | `text` | - | Описание типа |
| `sign` | `integer` | `DEFAULT 1` | 1 — приход, -1 — расход, 0 — корректировка |
| `sort_order` | `smallint` | `DEFAULT 0` | Порядок сортировки |
| `is_active` | `boolean` | `DEFAULT true` | Активность типа |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:** Нет

**Данные по умолчанию:**

| name | sign | description |
|------|------|-------------|
| Поставка | `1` | Поступление товара от поставщика |
| Убытие | `-1` | Списание товара со склада |
| Брак | `-1` | Перемещение в брак |
| Корректировка | `0` | Корректировка количества товара |

---

### 9. distributions (Товародвижение)

Фиксирует все операции с товарами (приход, расход, корректировка). **Никогда не удаляется** — это исторические данные для отчетов и аудита.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `user_id` | `varchar(36)` | `FK → users(id), NOT NULL` | Пользователь, создавший запись |
| `distribution_type_id` | `varchar(36)` | `FK → distribution_types(id), NOT NULL` | Тип перемещения |
| `product_id` | `varchar(36)` | `FK → products(id), NOT NULL` | Товар |
| `supplier_id` | `varchar(36)` | `FK → suppliers(id), NOT NULL` | Поставщик |
| `warehouse_id` | `varchar(36)` | `FK → warehouses(id), NOT NULL` | Склад |
| `distribution_date` | `timestamp` | `NOT NULL` | Дата перемещения |
| `quantity` | `integer` | `NOT NULL` | Количество |
| `unit_id` | `varchar(36)` | `FK → units(id), NOT NULL` | Единица измерения |
| `description` | `text` | - | Описание перемещения |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата создания записи |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата обновления |

**Индексы:**
- `idx_distributions_user_id` — для фильтрации по пользователю
- `idx_distributions_product_id` — для фильтрации по товару
- `idx_distributions_warehouse_id` — для фильтрации по складу
- `idx_distributions_distribution_date` — для сортировки по дате

**Примечание:** Записи в `distributions` **никогда не удаляются** и не имеют флага `is_active`. Это исторические данные для аудита.

---

### 10. warehouse_settings (История настроек склада)

Хранит историю изменений параметров склада. **Никогда не удаляется** — полная история изменений.

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | `varchar(36)` | `PRIMARY KEY` | Уникальный идентификатор (UUID) |
| `warehouse_id` | `varchar(36)` | `FK → warehouses(id), NOT NULL` | Склад |
| `capacity` | `integer` | `NOT NULL` | Вместимость склада |
| `current_occupancy` | `integer` | `DEFAULT 0` | Текущая занятость |
| `threshold_percent` | `integer` | `DEFAULT 10` | Процент для уведомления |
| `user_updater_id` | `varchar(36)` | `FK → users(id)` | Пользователь, изменивший настройки |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` | Дата изменения |

**Индексы:**
- `idx_warehouse_settings_warehouse_id` — для фильтрации по складу
- `idx_warehouse_settings_user_updater_id` — для фильтрации по пользователю

**Примечание:** Записи в `warehouse_settings` **никогда не удаляются**. Это полная история изменений настроек склада. Актуальные настройки — это последняя запись для каждого склада.

---

## Связи между таблицами

| Внешний ключ | Ссылается на | Тип связи | Описание |
|--------------|--------------|-----------|----------|
| `users.role_id` | `roles.id` | `ON DELETE SET NULL` | Пользователь → Роль |
| `user_warehouses.user_id` | `users.id` | `ON DELETE CASCADE` | Доступ → Пользователь |
| `user_warehouses.warehouse_id` | `warehouses.id` | `ON DELETE CASCADE` | Доступ → Склад |
| `user_warehouses.granted_by` | `users.id` | `ON DELETE SET NULL` | Доступ → Кто выдал |
| `products.unit_id` | `units.id` | `ON DELETE RESTRICT` | Товар → Единица измерения |
| `distributions.user_id` | `users.id` | `ON DELETE RESTRICT` | Перемещение → Пользователь |
| `distributions.distribution_type_id` | `distribution_types.id` | `ON DELETE RESTRICT` | Перемещение → Тип |
| `distributions.product_id` | `products.id` | `ON DELETE RESTRICT` | Перемещение → Товар |
| `distributions.supplier_id` | `suppliers.id` | `ON DELETE RESTRICT` | Перемещение → Поставщик |
| `distributions.warehouse_id` | `warehouses.id` | `ON DELETE RESTRICT` | Перемещение → Склад |
| `distributions.unit_id` | `units.id` | `ON DELETE RESTRICT` | Перемещение → Единица измерения |
| `warehouse_settings.warehouse_id` | `warehouses.id` | `ON DELETE CASCADE` | Настройки → Склад |
| `warehouse_settings.user_updater_id` | `users.id` | `ON DELETE SET NULL` | Настройки → Пользователь |

---

## Правила валидации

- `quantity` в `distributions` должен быть > 0
- `email` в `users` должен быть уникальным
- `inn` в `suppliers` должен быть уникальным
- `code` в `units` должен быть уникальным
- `sign` в `distribution_types` может быть: 1 (приход), -1 (расход), 0 (корректировка)
- У одного пользователя не может быть дублирующихся доступов к одному складу

---

## Особенности реализации

### Мягкое удаление (Soft Delete)
- **Никакие данные не удаляются физически** из базы данных
- Для сущностей используется флаг `is_active`:
  - `true` — запись активна
  - `false` — запись неактивна (считается "удаленной")
- При выборке данных по умолчанию фильтруем только активные записи
- Неактивные записи сохраняются для истории и аудита

### Идентификаторы
- Все ID генерируются через `gen_random_uuid()` на стороне базы данных
- ID хранятся как `varchar(36)` (стандартный UUID)
- Исключение: `units.code` — короткие коды (`g`, `ml`, `p`, `mm`)

### Временные поля
- Все временные поля используют тип `timestamp`
- `created_at` автоматически заполняется при создании записи
- `updated_at` автоматически обновляется при изменении записи

### Каскадные операции
- `ON DELETE RESTRICT` — запрещает удаление записи, если на нее есть ссылки
- `ON DELETE SET NULL` — устанавливает NULL при удалении связанной записи
- `ON DELETE CASCADE` — удаляет связанные записи автоматически

---

## Начальные данные

При первом запуске миграций создаются:

1. **Роли:** Администратор, Кладовщик, Бухгалтер, Неизвестно
2. **Единицы измерения:** Грамм, Миллилитр, Штука, Миллиметр
3. **Типы перемещений:** Поставка, Убытие, Брак, Корректировка
4. **Администратор:** `admin@warehouse.com` / `admin123`
5. **Связь администратора со складом** (по умолчанию)