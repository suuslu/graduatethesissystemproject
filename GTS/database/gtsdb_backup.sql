--
-- PostgreSQL database dump
--

\restrict yMjNzqeyCN1HiuJy8g5V4NCP96jErCt6PX7h6pGg5wtfI2dl2D5sH1k9gh6KgWE

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-25 23:51:16 +03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16707)
-- Name: cosupervisor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cosupervisor (
    per_id integer NOT NULL,
    th_num integer NOT NULL
);


ALTER TABLE public.cosupervisor OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16612)
-- Name: institute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.institute (
    ins_id integer NOT NULL,
    ins_name character varying(100) NOT NULL,
    uni_id integer NOT NULL
);


ALTER TABLE public.institute OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16611)
-- Name: institute_ins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.institute_ins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.institute_ins_id_seq OWNER TO postgres;

--
-- TOC entry 3901 (class 0 OID 0)
-- Dependencies: 221
-- Name: institute_ins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.institute_ins_id_seq OWNED BY public.institute.ins_id;


--
-- TOC entry 232 (class 1259 OID 16757)
-- Name: keyword; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keyword (
    keyword_id integer NOT NULL,
    th_num integer NOT NULL,
    keyword character varying(500)
);


ALTER TABLE public.keyword OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16756)
-- Name: keyword_keyword_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.keyword_keyword_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keyword_keyword_id_seq OWNER TO postgres;

--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 231
-- Name: keyword_keyword_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.keyword_keyword_id_seq OWNED BY public.keyword.keyword_id;


--
-- TOC entry 224 (class 1259 OID 16665)
-- Name: person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person (
    per_id integer NOT NULL,
    first_name character varying(20) NOT NULL,
    second_name character varying(15) NOT NULL,
    phone_num character(11)
);


ALTER TABLE public.person OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16664)
-- Name: person_per_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_per_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_per_id_seq OWNER TO postgres;

--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 223
-- Name: person_per_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_per_id_seq OWNED BY public.person.per_id;


--
-- TOC entry 228 (class 1259 OID 16724)
-- Name: supervisor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supervisor (
    per_id integer NOT NULL,
    th_num integer NOT NULL
);


ALTER TABLE public.supervisor OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16675)
-- Name: thesis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thesis (
    th_num integer NOT NULL,
    title character varying(500) NOT NULL,
    abstract character varying(5000) NOT NULL,
    author_id integer NOT NULL,
    th_year date,
    th_type character varying(30) NOT NULL,
    uni_id integer NOT NULL,
    ins_id integer NOT NULL,
    page_num integer NOT NULL,
    th_language character varying(20) NOT NULL,
    submission_date date
);


ALTER TABLE public.thesis OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16674)
-- Name: thesis_th_num_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thesis_th_num_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thesis_th_num_seq OWNER TO postgres;

--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 225
-- Name: thesis_th_num_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thesis_th_num_seq OWNED BY public.thesis.th_num;


--
-- TOC entry 230 (class 1259 OID 16742)
-- Name: topic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topic (
    topic_id integer NOT NULL,
    th_num integer NOT NULL,
    topic_name character varying(100) NOT NULL
);


ALTER TABLE public.topic OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16741)
-- Name: topic_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topic_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topic_topic_id_seq OWNER TO postgres;

--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 229
-- Name: topic_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topic_topic_id_seq OWNED BY public.topic.topic_id;


--
-- TOC entry 220 (class 1259 OID 16602)
-- Name: university; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.university (
    uni_id integer NOT NULL,
    uni_name character varying(100) NOT NULL,
    uni_location character varying(50) NOT NULL
);


ALTER TABLE public.university OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16601)
-- Name: university_uni_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.university_uni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.university_uni_id_seq OWNER TO postgres;

--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 219
-- Name: university_uni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.university_uni_id_seq OWNED BY public.university.uni_id;


--
-- TOC entry 3704 (class 2604 OID 16615)
-- Name: institute ins_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institute ALTER COLUMN ins_id SET DEFAULT nextval('public.institute_ins_id_seq'::regclass);


--
-- TOC entry 3708 (class 2604 OID 16760)
-- Name: keyword keyword_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keyword ALTER COLUMN keyword_id SET DEFAULT nextval('public.keyword_keyword_id_seq'::regclass);


--
-- TOC entry 3705 (class 2604 OID 16668)
-- Name: person per_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person ALTER COLUMN per_id SET DEFAULT nextval('public.person_per_id_seq'::regclass);


--
-- TOC entry 3706 (class 2604 OID 16678)
-- Name: thesis th_num; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis ALTER COLUMN th_num SET DEFAULT nextval('public.thesis_th_num_seq'::regclass);


--
-- TOC entry 3707 (class 2604 OID 16745)
-- Name: topic topic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic ALTER COLUMN topic_id SET DEFAULT nextval('public.topic_topic_id_seq'::regclass);


--
-- TOC entry 3703 (class 2604 OID 16605)
-- Name: university uni_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university ALTER COLUMN uni_id SET DEFAULT nextval('public.university_uni_id_seq'::regclass);


--
-- TOC entry 3890 (class 0 OID 16707)
-- Dependencies: 227
-- Data for Name: cosupervisor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cosupervisor (per_id, th_num) FROM stdin;
1	3
2	5
3	1
4	6
5	2
6	4
\.


--
-- TOC entry 3885 (class 0 OID 16612)
-- Dependencies: 222
-- Data for Name: institute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.institute (ins_id, ins_name, uni_id) FROM stdin;
1	Graduate School of Engineering	1
2	Institute of Social Sciences	2
3	Institute of Health Sciences	3
4	Institute of Fine Arts	4
5	Institute of Marine Sciences	5
6	Graduate School of Data Science	1
\.


--
-- TOC entry 3895 (class 0 OID 16757)
-- Dependencies: 232
-- Data for Name: keyword; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keyword (keyword_id, th_num, keyword) FROM stdin;
1	1	machine learning, scoring
2	2	battery, storage, efficiency
3	3	ocean, plankton, climate
4	4	diagnosis, prediction, health
5	5	creativity, therapy, cognition
6	6	traffic, mobility, forecasting
\.


--
-- TOC entry 3887 (class 0 OID 16665)
-- Dependencies: 224
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (per_id, first_name, second_name, phone_num) FROM stdin;
1	Aylin	Koral	05437651289
2	Burak	Temel	05382994456
3	Selin	Uslu	05419873265
4	Eren	Dumlu	05468392177
5	Naz	Ersoy	05348229944
6	Koray	Aktaş	05458900312
\.


--
-- TOC entry 3891 (class 0 OID 16724)
-- Dependencies: 228
-- Data for Name: supervisor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisor (per_id, th_num) FROM stdin;
1	2
2	1
3	4
4	3
5	6
6	5
\.


--
-- TOC entry 3889 (class 0 OID 16675)
-- Dependencies: 226
-- Data for Name: thesis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thesis (th_num, title, abstract, author_id, th_year, th_type, uni_id, ins_id, page_num, th_language, submission_date) FROM stdin;
1	AI-Based Debate Evaluation	Speech scoring model design	1	2023-01-01	Master	1	1	82	English	2023-06-12
2	Renewable Energy Storage	Battery efficiency study	2	2022-01-01	PhD	2	2	155	Turkish	2022-11-30
3	Marine Ecosystems & Climate	Plankton decline analysis	3	2021-01-01	Master	5	5	93	English	2021-05-18
4	Data-Driven Health Diagnosis	Predictive model design	4	2024-01-01	Master	3	3	120	English	2024-02-01
5	Art Therapy & Creativity	Visual cognition study	5	2020-01-01	PhD	4	4	210	Turkish	2020-09-22
6	Machine Learning for Urban Mobility	Traffic flow prediction	6	2023-01-01	Master	1	6	140	English	2023-07-10
\.


--
-- TOC entry 3893 (class 0 OID 16742)
-- Dependencies: 230
-- Data for Name: topic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic (topic_id, th_num, topic_name) FROM stdin;
1	1	Artificial Intelligence
2	2	Energy Systems
3	3	Climate Change
4	4	Medical Informatics
5	5	Art & Psychology
6	6	Smart Mobility
\.


--
-- TOC entry 3883 (class 0 OID 16602)
-- Dependencies: 220
-- Data for Name: university; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.university (uni_id, uni_name, uni_location) FROM stdin;
1	Maltepe University	Istanbul
2	Hacettepe University	Ankara
3	Dokuz Eylül University	Izmir
4	Anadolu University	Eskişehir
5	Karadeniz Technical University	Trabzon
6	Uludağ University	Bursa
\.


--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 221
-- Name: institute_ins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.institute_ins_id_seq', 9, true);


--
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 231
-- Name: keyword_keyword_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.keyword_keyword_id_seq', 8, true);


--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 223
-- Name: person_per_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_per_id_seq', 9, true);


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 225
-- Name: thesis_th_num_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thesis_th_num_seq', 12, true);


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 229
-- Name: topic_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topic_topic_id_seq', 9, true);


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 219
-- Name: university_uni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.university_uni_id_seq', 9, true);


--
-- TOC entry 3718 (class 2606 OID 16713)
-- Name: cosupervisor cosupervisor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cosupervisor
    ADD CONSTRAINT cosupervisor_pkey PRIMARY KEY (per_id, th_num);


--
-- TOC entry 3712 (class 2606 OID 16620)
-- Name: institute institute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institute
    ADD CONSTRAINT institute_pkey PRIMARY KEY (ins_id);


--
-- TOC entry 3724 (class 2606 OID 16766)
-- Name: keyword keyword_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keyword
    ADD CONSTRAINT keyword_pkey PRIMARY KEY (keyword_id);


--
-- TOC entry 3714 (class 2606 OID 16673)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (per_id);


--
-- TOC entry 3720 (class 2606 OID 16730)
-- Name: supervisor supervisor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor
    ADD CONSTRAINT supervisor_pkey PRIMARY KEY (per_id, th_num);


--
-- TOC entry 3716 (class 2606 OID 16691)
-- Name: thesis thesis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis
    ADD CONSTRAINT thesis_pkey PRIMARY KEY (th_num);


--
-- TOC entry 3722 (class 2606 OID 16750)
-- Name: topic topic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_pkey PRIMARY KEY (topic_id);


--
-- TOC entry 3710 (class 2606 OID 16610)
-- Name: university university_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university
    ADD CONSTRAINT university_pkey PRIMARY KEY (uni_id);


--
-- TOC entry 3729 (class 2606 OID 16714)
-- Name: cosupervisor cosupervisor_per_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cosupervisor
    ADD CONSTRAINT cosupervisor_per_id_fkey FOREIGN KEY (per_id) REFERENCES public.person(per_id);


--
-- TOC entry 3730 (class 2606 OID 16719)
-- Name: cosupervisor cosupervisor_th_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cosupervisor
    ADD CONSTRAINT cosupervisor_th_num_fkey FOREIGN KEY (th_num) REFERENCES public.thesis(th_num);


--
-- TOC entry 3725 (class 2606 OID 16621)
-- Name: institute fk_institute_university; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institute
    ADD CONSTRAINT fk_institute_university FOREIGN KEY (uni_id) REFERENCES public.university(uni_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3734 (class 2606 OID 16767)
-- Name: keyword keyword_th_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keyword
    ADD CONSTRAINT keyword_th_num_fkey FOREIGN KEY (th_num) REFERENCES public.thesis(th_num);


--
-- TOC entry 3731 (class 2606 OID 16731)
-- Name: supervisor supervisor_per_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor
    ADD CONSTRAINT supervisor_per_id_fkey FOREIGN KEY (per_id) REFERENCES public.person(per_id);


--
-- TOC entry 3732 (class 2606 OID 16736)
-- Name: supervisor supervisor_th_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor
    ADD CONSTRAINT supervisor_th_num_fkey FOREIGN KEY (th_num) REFERENCES public.thesis(th_num);


--
-- TOC entry 3726 (class 2606 OID 16692)
-- Name: thesis thesis_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis
    ADD CONSTRAINT thesis_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.person(per_id);


--
-- TOC entry 3727 (class 2606 OID 16702)
-- Name: thesis thesis_ins_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis
    ADD CONSTRAINT thesis_ins_id_fkey FOREIGN KEY (ins_id) REFERENCES public.institute(ins_id);


--
-- TOC entry 3728 (class 2606 OID 16697)
-- Name: thesis thesis_uni_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thesis
    ADD CONSTRAINT thesis_uni_id_fkey FOREIGN KEY (uni_id) REFERENCES public.university(uni_id);


--
-- TOC entry 3733 (class 2606 OID 16751)
-- Name: topic topic_th_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic
    ADD CONSTRAINT topic_th_num_fkey FOREIGN KEY (th_num) REFERENCES public.thesis(th_num);


-- Completed on 2025-12-25 23:51:16 +03

--
-- PostgreSQL database dump complete
--

\unrestrict yMjNzqeyCN1HiuJy8g5V4NCP96jErCt6PX7h6pGg5wtfI2dl2D5sH1k9gh6KgWE

