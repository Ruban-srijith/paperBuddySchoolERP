from ortools.sat.python import cp_model
from typing import List, Dict, Any

class TimetableSolver:
    """
    Uses Google OR-Tools CP-SAT Solver to generate conflict-free school timetables.
    Constraints:
    1. No teacher double-booking (Teacher cannot be in two classrooms in the same slot).
    2. No class double-booking (Class cannot have two lessons in the same slot).
    3. No classroom double-booking (Classroom cannot host two classes in the same slot).
    """

    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    TIME_SLOTS = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00"]

    def solve(
        self,
        classes: List[Dict[str, Any]],
        teachers: List[Dict[str, Any]],
        subjects: List[Dict[str, Any]],
        classrooms: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        model = cp_model.CpModel()

        # Decision variables: x[(c, t, s, r, d, slot)] = 1 if assigned, 0 otherwise
        # To simplify solver for demo, assign required subject periods per class
        assignments = {}
        for c in range(len(classes)):
            for t in range(len(teachers)):
                for s in range(len(subjects)):
                    for r in range(len(classrooms)):
                        for d in range(len(self.DAYS)):
                            for slot in range(len(self.TIME_SLOTS)):
                                var_name = f"x_{c}_{t}_{s}_{r}_{d}_{slot}"
                                assignments[(c, t, s, r, d, slot)] = model.NewBoolVar(var_name)

        # Constraint 1: Teacher double-booking (at most 1 assignment per teacher per day/slot)
        for t in range(len(teachers)):
            for d in range(len(self.DAYS)):
                for slot in range(len(self.TIME_SLOTS)):
                    model.AddAtMostOne(
                        assignments[(c, t, s, r, d, slot)]
                        for c in range(len(classes))
                        for s in range(len(subjects))
                        for r in range(len(classrooms))
                    )

        # Constraint 2: Class double-booking (at most 1 assignment per class per day/slot)
        for c in range(len(classes)):
            for d in range(len(self.DAYS)):
                for slot in range(len(self.TIME_SLOTS)):
                    model.AddAtMostOne(
                        assignments[(c, t, s, r, d, slot)]
                        for t in range(len(teachers))
                        for s in range(len(subjects))
                        for r in range(len(classrooms))
                    )

        # Constraint 3: Classroom double-booking (at most 1 assignment per classroom per day/slot)
        for r in range(len(classrooms)):
            for d in range(len(self.DAYS)):
                for slot in range(len(self.TIME_SLOTS)):
                    model.AddAtMostOne(
                        assignments[(c, t, s, r, d, slot)]
                        for c in range(len(classes))
                        for t in range(len(teachers))
                        for s in range(len(subjects))
                    )

        # Constraint 4: Ensure every class gets exactly 1 lesson per available day/slot for rich schedule
        for c in range(len(classes)):
            for d in range(len(self.DAYS)):
                for slot in range(len(self.TIME_SLOTS)):
                    model.Add(
                        sum(
                            assignments[(c, t, s, r, d, slot)]
                            for t in range(len(teachers))
                            for s in range(len(subjects))
                            for r in range(len(classrooms))
                        ) == 1
                    )

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10.0
        status = solver.Solve(model)

        schedule_result = []
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for c in range(len(classes)):
                for t in range(len(teachers)):
                    for s in range(len(subjects)):
                        for r in range(len(classrooms)):
                            for d in range(len(self.DAYS)):
                                for slot in range(len(self.TIME_SLOTS)):
                                    if solver.Value(assignments[(c, t, s, r, d, slot)]) == 1:
                                        schedule_result.append({
                                            "class_id": classes[c]["id"],
                                            "class_name": f"{classes[c]['grade']}-{classes[c]['section']}",
                                            "teacher_id": teachers[t]["id"],
                                            "teacher_name": teachers[t]["full_name"],
                                            "subject_id": subjects[s]["id"],
                                            "subject_name": subjects[s]["name"],
                                            "classroom_id": classrooms[r]["id"],
                                            "classroom_name": classrooms[r]["name"],
                                            "day_of_week": self.DAYS[d],
                                            "time_slot": self.TIME_SLOTS[slot]
                                        })
        return schedule_result

timetable_solver = TimetableSolver()
