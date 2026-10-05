# Project Setup & Execution Guide

## Prerequisites
- Python 3.10+
- Node.js v18+ & npm
- MongoDB (Optional, system operates gracefully in-memory if MongoDB is offline)

## Backend Setup (Flask REST API)
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Seed benchmark career database:
   ```bash
   python seed_db.py
   ```
4. Start Flask server on port 5000:
   ```bash
   python run.py
   ```

## Frontend Setup (React + Vite)
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server on port 3000:
   ```bash
   npm run dev
   ```
