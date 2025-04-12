CREATE TABLE exercises (name character varying(100) NOT NULL, muscle character varying(100) NOT NULL, routine_id integer, exercise_id integer NOT NULL);

CREATE TABLE routineexercises (repetitions integer NOT NULL, exercise_id integer, routine_exercise_id integer NOT NULL, weight_measure character varying(50) NOT NULL DEFAULT 'kg'::character varying, weight numeric NOT NULL);

CREATE TABLE routines (description character varying(255), user_id integer, routine_id integer NOT NULL, is_completed boolean DEFAULT false, date date NOT NULL);

CREATE TABLE users (email character varying(100) NOT NULL, name character varying(100) NOT NULL, registration_date date DEFAULT CURRENT_DATE, auth_id character varying(255) NOT NULL, user_id integer NOT NULL);