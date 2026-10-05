# CatalogStudio

**Create stunning product catalogs with ease**

CatalogStudio is a visual catalog design platform that helps businesses transform their product data into professional, print-ready PDF catalogs. Perfect for e-commerce stores, manufacturers, and retailers who need to showcase their products beautifully.

## What You Can Do

- 🎨 **Design Visually** - Drag and drop products onto a canvas to create beautiful layouts
- 📄 **Export to PDF** - Generate high-quality, print-ready catalogs instantly
- 🛍️ **Manage Products** - Import and organize your product catalog
- 🎯 **Real-time Editing** - See changes as you make them with live preview
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Who It's For

- **E-commerce Businesses** - Create seasonal catalogs and lookbooks
- **Manufacturers** - Showcase product lines and specifications
- **Retailers** - Design promotional materials and price lists
- **Marketing Teams** - Produce professional catalogs without design skills

## Tech Stack

Built with modern web technologies:
- React 19 + TypeScript for the interface
- Konva for powerful graphics and canvas editing
- Zustand for smooth state management
- jsPDF for instant PDF generation

## Project Structure

```
Catalog-SAAS/
├── frontend/                   # Visual editor and user interface
└── backend/                    # Django API
```

## Local Setup

### 1. Environment variables

Mail credentials and other deployment-specific values are read from the
environment. Copy the sample file and fill it in:

```bash
cp .env.example .env
```

`.env` is gitignored — never commit real credentials.

### 2. Backend

```bash
cd backend
python -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py runserver
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Email Configuration

Outgoing mail (welcome emails, password-reset OTPs, subscription receipts) uses
the SMTP server described in `.env`. See `.env.example` for every supported
variable.

- `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` — the SMTP mailbox. For a Google
  account use an [App Password](https://myaccount.google.com/apppasswords),
  not the account password.
- `DEFAULT_FROM_EMAIL` — the `From` address. Should match the authenticated
  mailbox; providers reject or spam mail claiming a different sender.
- `FRONTEND_URL` — public URL of the React app, used for links inside emails.

If the SMTP variables are missing, the backend falls back to Django's **console
email backend** and prints messages to the terminal instead of failing, so
signup and password reset keep working during local development.

> **Note:** account email verification is currently disabled
> (`ACCOUNT_EMAIL_VERIFICATION = "none"` in `backend/config/settings.py`).