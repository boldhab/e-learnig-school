import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminApi from '../../api/modules/admin.api';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const ManageCoursesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const [allTeachers, setAllTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // Section 1 – Create Class
  const [newClassName, setNewClassName] = useState('');

  // Section 2 – Create Course
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  // Section 3 – Assign Course to Class
  const [assignClassId, setAssignClassId] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAcademicDepartments();
      const data = res?.data?.data || res?.data || {};
      setAllTeachers(Array.isArray(data.all_teachers) ? data.all_teachers : []);
      setAllCourses(Array.isArray(data.all_courses) ? data.all_courses : []);
      setAllClasses(Array.isArray(data.all_classes) ? data.all_classes : []);
    } catch (err) {
      console.error('Failed to load academic data', err);
      toast.error('Failed to load academic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected course changes in Section 3, reset teacher selection
  useEffect(() => {
    setAssignTeacherId('');
  }, [assignCourseId]);

  const selectedCourseTeachers = useMemo(() => {
    if (!assignCourseId) return [];
    const course = allCourses.find((c) => String(c.id) === String(assignCourseId));
    return course?.teachers || [];
  }, [assignCourseId, allCourses]);

  const summary = useMemo(() => {
    const totalAssigned = allClasses.reduce((acc, cls) => acc + (cls.assigned_courses?.length || 0), 0);
    return { classes: allClasses.length, courses: allCourses.length, assignments: totalAssigned };
  }, [allClasses, allCourses]);

  // --- Handlers ---

  const handleCreateClass = async () => {
    const name = newClassName.trim();
    if (!name) { toast.error('Class name is required.'); return; }
    setSaving(true);
    try {
      await adminApi.createStandaloneClass({ name });
      setNewClassName('');
      toast.success('Class created.');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create class.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeacher = (id) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleCreateCourse = async () => {
    const name = newCourseName.trim();
    if (!name) { toast.error('Course name is required.'); return; }
    setSaving(true);
    try {
      await adminApi.createCourse({ name, teacher_ids: selectedTeacherIds });
      setNewCourseName('');
      setSelectedTeacherIds([]);
      toast.success('Course created.');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!assignClassId) { toast.error('Select a class.'); return; }
    if (!assignCourseId) { toast.error('Select a course.'); return; }
    if (!assignTeacherId) { toast.error('Select a teacher.'); return; }
    setSaving(true);
    try {
      await adminApi.assignCourseToClass(assignClassId, {
        course_id: Number(assignCourseId),
        teacher_id: Number(assignTeacherId),
      });
      setAssignClassId('');
      setAssignCourseId('');
      setAssignTeacherId('');
      toast.success('Course assigned to class.');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!cls?.id) return;
    const ok = window.confirm(`Delete class "${cls.name}"? This will unassign students and remove teacher/course links.`);
    if (!ok) return;

    setDeletingClassId(cls.id);
    try {
      await adminApi.deleteClass(cls.id);
      toast.success('Class deleted.');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete class.');
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!course?.id) return;
    const ok = window.confirm(`Delete course "${course.name}"? This will remove teacher assignments and course-to-class links.`);
    if (!ok) return;

    setDeletingCourseId(course.id);
    try {
      await adminApi.deleteCourse(course.id);
      toast.success('Course deleted.');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete course.');
    } finally {
      setDeletingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminSection
        title="Academic Management"
        description="Create classes, build courses with teacher lists, then assign courses to classes."
      >
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetricCard title="Classes" value={summary.classes} trend="Total classes" icon={GraduationCap} />
          <AdminMetricCard title="Courses" value={summary.courses} trend="Total courses" icon={BookOpen} />
          <AdminMetricCard title="Assignments" value={summary.assignments} trend="Course-class links" icon={Users} />
        </div>

        {/* ── Step 1: Create Class ── */}
        <AdminCard className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Step 1</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Create a Class</h3>
          <p className="mt-1 text-sm text-slate-500">Add a class that students belong to (e.g. Grade 10-A, Class 2024).</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
              placeholder="e.g. Grade 10-A"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleCreateClass}
              disabled={saving}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus size={16} />
              Create Class
            </button>
          </div>

          {allClasses.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">All Classes ({allClasses.length})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allClasses.map((cls) => (
                  <div key={cls.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/admin/courses/classes/${cls.id}`)}>
                        <p className="truncate text-sm font-semibold text-slate-900">{cls.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {cls.assigned_courses?.length || 0} course{cls.assigned_courses?.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls)}
                          disabled={saving || deletingClassId === cls.id}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                          title="Delete class"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {(cls.assigned_courses || []).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {cls.assigned_courses.map((ac) => (
                          <div key={ac.id} className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1"><BookOpen size={11} />{ac.course_name}</span>
                            <span className="flex items-center gap-1"><Users size={11} />{ac.teacher_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </AdminCard>

        {/* ── Step 2: Create Course ── */}
        <AdminCard className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Step 2</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Create a Course</h3>
          <p className="mt-1 text-sm text-slate-500">Name the course and select which teachers can teach it.</p>

          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="e.g. Mathematics, Biology, History"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Select Teachers for This Course</p>
              {allTeachers.length === 0 ? (
                <p className="text-sm text-slate-400">No teachers available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTeachers.map((teacher) => {
                    const selected = selectedTeacherIds.includes(teacher.id);
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => toggleTeacher(teacher.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {selected && <X size={11} />}
                        {teacher.full_name}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedTeacherIds.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">{selectedTeacherIds.length} teacher{selectedTeacherIds.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateCourse}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus size={16} />
              Create Course
            </button>
          </div>

          {allCourses.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">All Courses ({allCourses.length})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/courses/${course.id}`)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen size={15} className="shrink-0 text-blue-600" />
                        <p className="truncate text-sm font-semibold text-slate-900">{course.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course);
                        }}
                        disabled={saving || deletingCourseId === course.id}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                        title="Delete course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(course.teachers || []).length === 0 ? (
                        <span className="text-xs text-slate-400">No teachers assigned</span>
                      ) : (
                        course.teachers.map((t) => (
                          <AdminBadge key={t.id} tone="blue">{t.full_name}</AdminBadge>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AdminCard>

        {/* ── Step 3: Assign Course to Class ── */}
        <AdminCard className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Step 3</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Assign Course to Class</h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose a class, pick a course, then select the teacher from that course&apos;s teacher list.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Class</label>
              <select
                value={assignClassId}
                onChange={(e) => setAssignClassId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="">Select class...</option>
                {allClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Course</label>
              <select
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="">Select course...</option>
                {allCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Teacher
                {assignCourseId && selectedCourseTeachers.length === 0 && (
                  <span className="ml-2 text-xs font-normal text-amber-600">No teachers on this course</span>
                )}
              </label>
              <select
                value={assignTeacherId}
                onChange={(e) => setAssignTeacherId(e.target.value)}
                disabled={selectedCourseTeachers.length === 0}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {assignCourseId
                    ? selectedCourseTeachers.length === 0
                      ? 'No teachers available'
                      : 'Select teacher...'
                    : 'Select a course first'}
                </option>
                {selectedCourseTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleAssignCourse}
              disabled={saving || !assignClassId || !assignCourseId || !assignTeacherId}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Assign Course to Class
            </button>
          </div>
        </AdminCard>
      </AdminSection>
    </div>
  );
};

export default ManageCoursesPage;
