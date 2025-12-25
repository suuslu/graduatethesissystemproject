
  # Graduate Thesis System

  Graduate Thesis System is a Database Management Systems (DBMS) course project
  that models and manages academic records such as theses, people, universities,
  and institutes. It provides a complete CRUD workflow and a searchable
  interface for structured academic data. See `databasemgmtsyst-final.docx` for
  the project report and documentation.

  ## Course information

  - Course: Database Management Systems (DBMS)
  - University: Maltepe University
  - Department: Software Engineering
  - Term: 25-26
  - Instructor: Volkan Tunali
  - Students: Ayşe Su Uslu, İrem Özbilgin, Zeynep Lara Korkmaz, Irmak Çakır, Yağmur Gülse Özel

  ## Project goals

  This project demonstrates core DBMS concepts in practice: relational modeling,
  normalization, integrity constraints, and application-layer data management.
  The frontend delivers a clean admin dashboard, while the backend performs
  reliable data operations on PostgreSQL.

  ## Features

  - CRUD for theses, people, universities, and institutes
  - Thesis search by title/abstract, topic, and keyword
  - Detail views for person, university, and institute entities
  - Consistent admin flow: Dashboard, Search, Add, Edit

  ## Tech stack

  - Frontend: React + Vite + Tailwind CSS
  - Backend: Flask + psycopg2
  - Database: PostgreSQL

  ## Architecture overview

  - UI: `Graduate_Thesis_System_UI` (React app)
  - API: `GTS/app.py` (Flask service)
  - Core tables: `thesis`, `person`, `university`, `institute`, `topic`, `keyword`

  ## Running the project

  Frontend:

  ```
  cd Graduate_Thesis_System_UI
  npm install
  npm run dev
  ```

  Backend:

  ```
  cd GTS
  source .venv/bin/activate
  python app.py
  ```

  Optional environment variables:

  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

  ## Notes

  - Project report: `databasemgmtsyst-final.docx`
  - Do not commit `node_modules` or `.venv` to GitHub
  
