from collections import defaultdict
from app.services.timetable_solver import timetable_solver
from ortools.sat.python import cp_model

c_list = [{"id": f"c_{g}_{s}", "grade": g, "section": s} for g in ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] for s in ["A", "B"]]
t_list = [{"id": f"t_{i}", "full_name": name} for i, name in enumerate(["Dr. Sarah Connor", "Prof. Alan Turing", "Dr. Marie Curie", "Dr. Lakshmi Iyer", "Prof. Suresh Babu", "Prof. Venkat Raman"])]
s_list = [{"id": f"s_{i}", "name": name} for i, name in enumerate(["Physics", "Computer Science", "Chemistry"])]
r_list = [{"id": f"r_{i}", "name": name} for i, name in enumerate(["Room 204", "Computer Lab 1", "Chem Lab 2"])]

teachers_map = {t["full_name"]: t for t in t_list}
subjects_map = {s["name"]: s for s in s_list}
classrooms_map = {r["name"]: r for r in r_list}

class_options = {}
teacher_classes = defaultdict(list)
room_classes = defaultdict(list)
for cls in c_list:
    cid = cls["id"]
    opts = timetable_solver._get_class_options(cls.get("grade", "10"), cls.get("section", "A"), teachers_map, subjects_map, classrooms_map)
    class_options[cid] = opts
    for opt in opts:
        teacher_classes[opt["solver_teacher_key"]].append(f"{cls['grade']}-{cls['section']}")
        room_classes[opt["solver_room_key"]].append(f"{cls['grade']}-{cls['section']}")

print("Teacher load:")
for t_key, clist in teacher_classes.items():
    print(f"  {t_key}: {len(clist)} classes -> {clist}")

print("\nRoom load:")
for r_key, clist in room_classes.items():
    print(f"  {r_key}: {len(clist)} classes -> {clist}")
