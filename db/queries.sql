-- Get all completed routines for a particular user
SELECT *
FROM Routines
WHERE user_id = 1 AND is_completed = TRUE;

-- Get exercises from a particular routine
SELECT *
FROM RoutineExercises re
JOIN Exercises e ON re.exercise_id = e.exercise_id
WHERE re.routine_id = 1;

-- Get exercises that a user has done for a particular muscle
SELECT e.name, e.muscle, re.repetitions, re.weight, r.date
FROM Users u
JOIN Routines r ON u.user_id = r.user_id
JOIN RoutineExercises re ON r.routine_id = re.routine_id
JOIN Exercises e ON re.exercise_id = e.exercise_id
WHERE u.user_id = 1 AND e.muscle = 'Chest';

-- Script to insert data for RoutineExercises, Exercises, and Routines assigned to user 1, showing progressive advancement over 3 weeks

-- Insert routines for user 1 for 3 weeks
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-04', 'Week 1 - Chest and Back', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-05', 'Week 1 - Legs and Shoulders', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-06', 'Week 1 - Arms', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-11', 'Week 2 - Chest and Back', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-12', 'Week 2 - Legs and Shoulders', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-13', 'Week 2 - Arms', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-18', 'Week 3 - Chest and Back', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-19', 'Week 3 - Legs and Shoulders', TRUE);
INSERT INTO Routines (user_id, date, description, is_completed) VALUES (1, '2024-11-20', 'Week 3 - Arms', TRUE);

-- Insert exercises (variety of muscle groups)
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Bench Press', 'Chest' FROM Routines WHERE description LIKE 'Week 1 - Chest%';
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Deadlift', 'Back' FROM Routines WHERE description LIKE 'Week 1 - Chest%';
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Squat', 'Legs' FROM Routines WHERE description LIKE 'Week 1 - Legs%';
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Shoulder Press', 'Shoulders' FROM Routines WHERE description LIKE 'Week 1 - Legs%';
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Bicep Curl', 'Biceps' FROM Routines WHERE description LIKE 'Week 1 - Arms';
INSERT INTO Exercises (routine_id, name, muscle) SELECT routine_id, 'Tricep Extension', 'Triceps' FROM Routines WHERE description LIKE 'Week 1 - Arms';

-- Insert progressive routine exercises for 3 weeks
-- Week 1
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 50.00, 'kg' FROM Exercises WHERE name = 'Bench Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 60.00, 'kg' FROM Exercises WHERE name = 'Deadlift';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 40.00, 'kg' FROM Exercises WHERE name = 'Squat';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 30.00, 'kg' FROM Exercises WHERE name = 'Shoulder Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 15.00, 'kg' FROM Exercises WHERE name = 'Bicep Curl';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 20.00, 'kg' FROM Exercises WHERE name = 'Tricep Extension';

-- Week 2 (progressive increase)
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 55.00, 'kg' FROM Exercises WHERE name = 'Bench Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 65.00, 'kg' FROM Exercises WHERE name = 'Deadlift';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 45.00, 'kg' FROM Exercises WHERE name = 'Squat';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 35.00, 'kg' FROM Exercises WHERE name = 'Shoulder Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 17.50, 'kg' FROM Exercises WHERE name = 'Bicep Curl';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 22.50, 'kg' FROM Exercises WHERE name = 'Tricep Extension';

-- Week 3 (further progressive increase)
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 60.00, 'kg' FROM Exercises WHERE name = 'Bench Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 10, 70.00, 'kg' FROM Exercises WHERE name = 'Deadlift';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 50.00, 'kg' FROM Exercises WHERE name = 'Squat';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 40.00, 'kg' FROM Exercises WHERE name = 'Shoulder Press';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 20.00, 'kg' FROM Exercises WHERE name = 'Bicep Curl';
INSERT INTO RoutineExercises (exercise_id, repetitions, weight, weight_measure) SELECT exercise_id, 12, 25.00, 'kg' FROM Exercises WHERE name = 'Tricep Extension';
