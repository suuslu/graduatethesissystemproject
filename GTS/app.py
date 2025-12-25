import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# DB CONFIG
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "gtsdb")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD
    )

# --- HEALTH CHECK (DB bağlı mı hızlı görürsün) ---
@app.get("/api/health")
def api_health():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    v = cur.fetchone()[0]
    cur.close()
    conn.close()
    return jsonify({"ok": True, "db": DB_NAME, "test": v})

def parse_date_from_year(year_value):
    try:
        year_int = int(year_value)
    except (TypeError, ValueError):
        return None
    return f"{year_int}-01-01"

# --- HTML HOME (Jinja) ---
@app.route("/")
def home():
    conn = get_db_connection()
    cur = conn.cursor()

    # Theses
    cur.execute("""
        SELECT T.th_num, T.title, T.th_type, T.th_year, T.th_language,
               T.page_num, P.first_name || ' ' || P.second_name AS author_name
        FROM thesis T
        JOIN person P ON T.author_id = P.per_id
        ORDER BY T.th_num
    """)
    theses = cur.fetchall()

    cur.close()
    conn.close()
    return render_template("home.html", theses=theses)

# --- API: LIST THESES (React için) ---
@app.get("/api/theses")
def api_theses():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            T.th_num,
            T.title,
            EXTRACT(YEAR FROM T.th_year)::int AS th_year,
            T.th_type,
            P.first_name || ' ' || P.second_name AS author
        FROM thesis T
        JOIN person P ON T.author_id = P.per_id
        ORDER BY T.th_num
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: LIST PERSONS ---
@app.get("/api/persons")
def api_persons():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            per_id AS id,
            first_name AS "firstName",
            second_name AS "secondName",
            phone_num AS "phoneNumber"
        FROM person
        ORDER BY per_id
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: LIST UNIVERSITIES ---
@app.get("/api/universities")
def api_universities():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            uni_id AS id,
            uni_name AS "universityName",
            uni_location AS "location"
        FROM university
        ORDER BY uni_id
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: LIST INSTITUTES ---
@app.get("/api/institutes")
def api_institutes():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            I.ins_id AS id,
            I.ins_name AS "instituteName",
            I.uni_id AS "universityId",
            U.uni_name AS "universityName"
        FROM institute I
        JOIN university U ON I.uni_id = U.uni_id
        ORDER BY I.ins_id
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: CREATE PERSON ---
@app.post("/api/persons")
def api_person_create():
    body = request.get_json(silent=True) or {}
    first_name = (body.get("firstName") or "").strip()
    second_name = (body.get("secondName") or "").strip()
    phone_num = (body.get("phoneNumber") or "").strip()

    if not first_name or not second_name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO person (first_name, second_name, phone_num)
            VALUES (%s, %s, %s)
            RETURNING per_id AS id
        """, (first_name, second_name, phone_num or None))
        new_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"id": new_id}), 201

# --- API: UPDATE PERSON ---
@app.put("/api/persons/<int:per_id>")
def api_person_update(per_id: int):
    body = request.get_json(silent=True) or {}
    first_name = (body.get("firstName") or "").strip()
    second_name = (body.get("secondName") or "").strip()
    phone_num = (body.get("phoneNumber") or "").strip()

    if not first_name or not second_name:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE person
            SET first_name = %s,
                second_name = %s,
                phone_num = %s
            WHERE per_id = %s
        """, (first_name, second_name, phone_num or None, per_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Person not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: DELETE PERSON ---
@app.delete("/api/persons/<int:per_id>")
def api_person_delete(per_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM person WHERE per_id = %s", (per_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Person not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: CREATE UNIVERSITY ---
@app.post("/api/universities")
def api_university_create():
    body = request.get_json(silent=True) or {}
    uni_name = (body.get("universityName") or "").strip()
    uni_location = (body.get("location") or "").strip()

    if not uni_name or not uni_location:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO university (uni_name, uni_location)
            VALUES (%s, %s)
            RETURNING uni_id AS id
        """, (uni_name, uni_location))
        new_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"id": new_id}), 201

# --- API: UPDATE UNIVERSITY ---
@app.put("/api/universities/<int:uni_id>")
def api_university_update(uni_id: int):
    body = request.get_json(silent=True) or {}
    uni_name = (body.get("universityName") or "").strip()
    uni_location = (body.get("location") or "").strip()

    if not uni_name or not uni_location:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE university
            SET uni_name = %s,
                uni_location = %s
            WHERE uni_id = %s
        """, (uni_name, uni_location, uni_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "University not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: DELETE UNIVERSITY ---
@app.delete("/api/universities/<int:uni_id>")
def api_university_delete(uni_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM university WHERE uni_id = %s", (uni_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "University not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: CREATE INSTITUTE ---
@app.post("/api/institutes")
def api_institute_create():
    body = request.get_json(silent=True) or {}
    ins_name = (body.get("instituteName") or "").strip()
    uni_id = body.get("universityId")

    if not ins_name or not uni_id:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO institute (ins_name, uni_id)
            VALUES (%s, %s)
            RETURNING ins_id AS id
        """, (ins_name, uni_id))
        new_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"id": new_id}), 201

# --- API: UPDATE INSTITUTE ---
@app.put("/api/institutes/<int:ins_id>")
def api_institute_update(ins_id: int):
    body = request.get_json(silent=True) or {}
    ins_name = (body.get("instituteName") or "").strip()
    uni_id = body.get("universityId")

    if not ins_name or not uni_id:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE institute
            SET ins_name = %s,
                uni_id = %s
            WHERE ins_id = %s
        """, (ins_name, uni_id, ins_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Institute not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: DELETE INSTITUTE ---
@app.delete("/api/institutes/<int:ins_id>")
def api_institute_delete(ins_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM institute WHERE ins_id = %s", (ins_id,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Institute not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: CREATE THESIS ---
@app.post("/api/theses")
def api_thesis_create():
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    abstract = (body.get("abstract") or "").strip()
    author_id = body.get("authorId")
    thesis_year = body.get("thesisYear")
    thesis_type = (body.get("thesisType") or "").strip()
    university_id = body.get("universityId")
    institute_id = body.get("instituteId")
    page_count = body.get("pageCount")
    language = (body.get("language") or "").strip()
    submission_date = body.get("submissionDate")
    topics = body.get("topics") or []
    keywords = body.get("keywords") or []

    if not title or not abstract or not author_id or not thesis_type or not university_id or not institute_id or not language:
        return jsonify({"error": "Missing required fields"}), 400

    th_year_date = parse_date_from_year(thesis_year)
    if thesis_year and not th_year_date:
        return jsonify({"error": "Invalid thesisYear"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO thesis (
                title, abstract, author_id, th_year, th_type, uni_id, ins_id,
                page_num, th_language, submission_date
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING th_num AS id
        """, (
            title,
            abstract,
            author_id,
            th_year_date,
            thesis_type,
            university_id,
            institute_id,
            page_count,
            language,
            submission_date or None,
        ))
        new_id = cur.fetchone()["id"]

        for topic in [t.strip() for t in topics if str(t).strip()]:
            cur.execute("INSERT INTO topic (th_num, topic_name) VALUES (%s, %s)", (new_id, topic))
        for keyword in [k.strip() for k in keywords if str(k).strip()]:
            cur.execute("INSERT INTO keyword (th_num, keyword) VALUES (%s, %s)", (new_id, keyword))

        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"id": new_id}), 201

# --- API: UPDATE THESIS ---
@app.put("/api/theses/<int:th_num>")
def api_thesis_update(th_num: int):
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    abstract = (body.get("abstract") or "").strip()
    author_id = body.get("authorId")
    thesis_year = body.get("thesisYear")
    thesis_type = (body.get("thesisType") or "").strip()
    university_id = body.get("universityId")
    institute_id = body.get("instituteId")
    page_count = body.get("pageCount")
    language = (body.get("language") or "").strip()
    submission_date = body.get("submissionDate")
    topics = body.get("topics") or []
    keywords = body.get("keywords") or []

    if not title or not abstract or not author_id or not thesis_type or not university_id or not institute_id or not language:
        return jsonify({"error": "Missing required fields"}), 400

    th_year_date = parse_date_from_year(thesis_year)
    if thesis_year and not th_year_date:
        return jsonify({"error": "Invalid thesisYear"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE thesis
            SET title = %s,
                abstract = %s,
                author_id = %s,
                th_year = %s,
                th_type = %s,
                uni_id = %s,
                ins_id = %s,
                page_num = %s,
                th_language = %s,
                submission_date = %s
            WHERE th_num = %s
        """, (
            title,
            abstract,
            author_id,
            th_year_date,
            thesis_type,
            university_id,
            institute_id,
            page_count,
            language,
            submission_date or None,
            th_num,
        ))
        if cur.rowcount == 0:
            conn.rollback()
            return jsonify({"error": "Thesis not found"}), 404

        cur.execute("DELETE FROM topic WHERE th_num = %s", (th_num,))
        cur.execute("DELETE FROM keyword WHERE th_num = %s", (th_num,))
        for topic in [t.strip() for t in topics if str(t).strip()]:
            cur.execute("INSERT INTO topic (th_num, topic_name) VALUES (%s, %s)", (th_num, topic))
        for keyword in [k.strip() for k in keywords if str(k).strip()]:
            cur.execute("INSERT INTO keyword (th_num, keyword) VALUES (%s, %s)", (th_num, keyword))

        conn.commit()
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: DELETE THESIS ---
@app.delete("/api/theses/<int:th_num>")
def api_thesis_delete(th_num: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM keyword WHERE th_num = %s", (th_num,))
        cur.execute("DELETE FROM topic WHERE th_num = %s", (th_num,))
        cur.execute("DELETE FROM thesis WHERE th_num = %s", (th_num,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "Thesis not found"}), 404
    except Exception as exc:
        conn.rollback()
        return jsonify({"error": str(exc)}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"ok": True})

# --- API: THESIS DETAIL ---
@app.get("/api/theses/<int:th_num>")
def api_thesis_detail(th_num: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            T.th_num AS id,
            T.title,
            T.abstract,
            T.author_id AS "authorId",
            P.first_name || ' ' || P.second_name AS "authorName",
            EXTRACT(YEAR FROM T.th_year)::int AS "thesisYear",
            T.th_type AS "thesisType",
            T.uni_id AS "universityId",
            U.uni_name AS "universityName",
            T.ins_id AS "instituteId",
            I.ins_name AS "instituteName",
            T.page_num AS "pageCount",
            T.th_language AS "language",
            T.submission_date AS "submissionDate",
            COALESCE(
                array_agg(DISTINCT TP.topic_name) FILTER (WHERE TP.topic_name IS NOT NULL),
                ARRAY[]::text[]
            ) AS topics,
            COALESCE(
                array_agg(DISTINCT K.keyword) FILTER (WHERE K.keyword IS NOT NULL),
                ARRAY[]::text[]
            ) AS keywords
        FROM thesis T
        JOIN person P ON T.author_id = P.per_id
        JOIN university U ON T.uni_id = U.uni_id
        JOIN institute I ON T.ins_id = I.ins_id
        LEFT JOIN topic TP ON TP.th_num = T.th_num
        LEFT JOIN keyword K ON K.th_num = T.th_num
        WHERE T.th_num = %s
        GROUP BY
            T.th_num,
            P.first_name,
            P.second_name,
            U.uni_name,
            I.ins_name
    """, (th_num,))
    thesis = cur.fetchone()

    cur.close()
    conn.close()

    if thesis is None:
        return jsonify({"error": "Thesis not found"}), 404

    return jsonify(thesis)

# --- API: SEARCH (title/abstract) ---
@app.post("/api/search")
def api_search():
    body = request.get_json(silent=True) or {}
    keyword = (body.get("keyword") or "").strip()
    search_type = (body.get("type") or "").strip().lower()
    param = f"%{keyword}%"

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if search_type == "topic":
        cur.execute("""
            SELECT DISTINCT
                T.th_num,
                T.title,
                EXTRACT(YEAR FROM T.th_year)::int AS th_year,
                T.th_type,
                P.first_name || ' ' || P.second_name AS author
            FROM thesis T
            JOIN person P ON T.author_id = P.per_id
            JOIN topic TP ON TP.th_num = T.th_num
            WHERE TP.topic_name ILIKE %s
            ORDER BY T.th_num
        """, (param,))
    elif search_type == "keyword":
        cur.execute("""
            SELECT DISTINCT
                T.th_num,
                T.title,
                EXTRACT(YEAR FROM T.th_year)::int AS th_year,
                T.th_type,
                P.first_name || ' ' || P.second_name AS author
            FROM thesis T
            JOIN person P ON T.author_id = P.per_id
            JOIN keyword K ON K.th_num = T.th_num
            WHERE K.keyword ILIKE %s
            ORDER BY T.th_num
        """, (param,))
    else:
        cur.execute("""
            SELECT
                T.th_num,
                T.title,
                EXTRACT(YEAR FROM T.th_year)::int AS th_year,
                T.th_type,
                P.first_name || ' ' || P.second_name AS author
            FROM thesis T
            JOIN person P ON T.author_id = P.per_id
            WHERE T.title ILIKE %s OR T.abstract ILIKE %s
            ORDER BY T.th_num
        """, (param, param))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: PERSON DETAIL ---
@app.get("/api/persons/<int:per_id>")
def api_person_detail(per_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            per_id AS id,
            first_name AS "firstName",
            second_name AS "secondName",
            phone_num AS "phoneNumber"
        FROM person
        WHERE per_id = %s
    """, (per_id,))
    person = cur.fetchone()

    cur.close()
    conn.close()

    if person is None:
        return jsonify({"error": "Person not found"}), 404

    return jsonify(person)

# --- API: PERSON THESES ---
@app.get("/api/persons/<int:per_id>/theses")
def api_person_theses(per_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            T.th_num AS id,
            T.title,
            EXTRACT(YEAR FROM T.th_year)::int AS "thesisYear",
            T.th_type AS "thesisType",
            T.page_num AS "pageCount"
        FROM thesis T
        WHERE T.author_id = %s
        ORDER BY T.th_num
    """, (per_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: UNIVERSITY DETAIL ---
@app.get("/api/universities/<int:uni_id>")
def api_university_detail(uni_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            uni_id AS id,
            uni_name AS "universityName",
            uni_location AS "location"
        FROM university
        WHERE uni_id = %s
    """, (uni_id,))
    university = cur.fetchone()

    cur.close()
    conn.close()

    if university is None:
        return jsonify({"error": "University not found"}), 404

    return jsonify(university)

# --- API: UNIVERSITY INSTITUTES ---
@app.get("/api/universities/<int:uni_id>/institutes")
def api_university_institutes(uni_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            I.ins_id AS id,
            I.ins_name AS "instituteName",
            I.uni_id AS "universityId"
        FROM institute I
        WHERE I.uni_id = %s
        ORDER BY I.ins_id
    """, (uni_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: UNIVERSITY THESES ---
@app.get("/api/universities/<int:uni_id>/theses")
def api_university_theses(uni_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            T.th_num AS id,
            T.title,
            EXTRACT(YEAR FROM T.th_year)::int AS "thesisYear",
            T.th_type AS "thesisType"
        FROM thesis T
        WHERE T.uni_id = %s
        ORDER BY T.th_num
    """, (uni_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

# --- API: INSTITUTE DETAIL ---
@app.get("/api/institutes/<int:ins_id>")
def api_institute_detail(ins_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            I.ins_id AS id,
            I.ins_name AS "instituteName",
            I.uni_id AS "universityId",
            U.uni_name AS "universityName"
        FROM institute I
        JOIN university U ON I.uni_id = U.uni_id
        WHERE I.ins_id = %s
    """, (ins_id,))
    institute = cur.fetchone()

    cur.close()
    conn.close()

    if institute is None:
        return jsonify({"error": "Institute not found"}), 404

    return jsonify(institute)

# --- API: INSTITUTE THESES ---
@app.get("/api/institutes/<int:ins_id>/theses")
def api_institute_theses(ins_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            T.th_num AS id,
            T.title,
            EXTRACT(YEAR FROM T.th_year)::int AS "thesisYear",
            T.th_type AS "thesisType",
            T.page_num AS "pageCount"
        FROM thesis T
        WHERE T.ins_id = %s
        ORDER BY T.th_num
    """, (ins_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return jsonify(rows)

if __name__ == "__main__":
    # 5001 sende çakışma olmasın diye
    app.run(debug=True, port=5001)
