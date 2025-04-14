-- SQL Schema generated on 2025-04-14T15:11:57.483Z
-- Tables and foreign key constraints for Supabase project
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE TABLE exercises (name character varying(100) NOT NULL, muscle character varying(100) NOT NULL, routine_id integer, exercise_id integer NOT NULL);

CREATE TABLE routineexercises (repetitions integer NOT NULL, exercise_id integer, routine_exercise_id integer NOT NULL, weight_measure character varying(50) NOT NULL DEFAULT 'kg'::character varying, weight numeric NOT NULL);

CREATE TABLE routines (description character varying(255), user_id integer, routine_id integer NOT NULL, is_completed boolean DEFAULT false, date date NOT NULL);

CREATE TABLE users (email character varying(100) NOT NULL, name character varying(100) NOT NULL, registration_date date DEFAULT CURRENT_DATE, auth_id character varying(255) NOT NULL, user_id integer NOT NULL);
-- Foreign Key Constraints

ALTER TABLE routines
    ADD CONSTRAINT routines_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id);

ALTER TABLE exercises
    ADD CONSTRAINT exercises_routine_id_fkey
    FOREIGN KEY (routine_id)
    REFERENCES routines(routine_id);

ALTER TABLE routineexercises
    ADD CONSTRAINT routineexercises_exercise_id_fkey
    FOREIGN KEY (exercise_id)
    REFERENCES exercises(exercise_id);