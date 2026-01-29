
# CatalogStudio SaaS Architecture

## 1. System Architecture
- **Multi-tenant Core**: The database schema uses a `tenant_id` on every table. All API requests are scoped to the authenticated tenant.
- **Frontend**: React + TypeScript with `react-konva` for the graphics engine.
- **State Management**: Zustand for UI and Editor state. Optimized for high-frequency updates (dragging/resizing).
- **Storage**: S3 for high-res product assets. CDN (CloudFront) for fast global delivery.
- **PDF Generation**: Hybrid approach. `jsPDF` for client-side quick previews and an AWS Lambda (Puppeteer/Playwright) for high-fidelity, CMYK print-ready exports.

## 2. Database Schema (PostgreSQL)
```sql
-- Core Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}'
);

-- Catalog Entities
CREATE TABLE catalogs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catalog Pages (Storing Layout JSON)
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  catalog_id UUID REFERENCES catalogs(id) ON DELETE CASCADE,
  page_number INT,
  layout_json JSONB NOT NULL,
  thumbnail_url TEXT
);

-- Product Data (Source of truth)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  sku VARCHAR(100),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(12, 2),
  images JSONB
);
```

## 3. PDF Export Workflow
1. User clicks "Export PDF".
2. Client sends the `Catalog` object (JSON) to the backend API.
3. Backend validates assets and renders the JSON into a high-res HTML/Canvas page using a headless browser (Puppeteer).
4. Puppeteer generates a multi-page PDF with print specifications (300DPI, Bleed).
5. S3 upload -> Return signed download URL to user.

## 4. Implementation Plan
- **Phase 1**: Core Product CRUD and Asset Upload.
- **Phase 2**: Canvas Editor V1 (Basic shapes, text, images).
- **Phase 3**: Product-to-Canvas binding (Drag product onto page -> Auto-generate block).
- **Phase 4**: Multi-page support and Catalog versioning.
- **Phase 5**: Server-side PDF rendering pipeline.
- **Phase 6**: Public showroom URLs and SEO-optimized web views.
