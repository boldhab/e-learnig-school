import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, Loader2, Megaphone, FileText, GraduationCap, Users, ChartColumn, Clock3, UserPlus, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminApi from '../../api/modules/admin.api';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const AdminCourseDetailsPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [addTeacherModalOpen, setAddTeacherModalOpen] = useState(false);
  const [savingTeacherAssignment, setSavingTeacherAssignment] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  const classId = searchParams.get('class_id') || '';

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, deptRes] = await Promise.all([
        adminApi.getCourseDetails(courseId, classId || undefined),
        adminApi.getAcademicDepartments(),
      ]);

      const data = courseRes?.data?.data || {};
      const deptData = deptRes?.data?.data || deptRes?.data || {};

      setCourseData(data);
      setAllTeachers(Array.isArray(deptData.all_teachers) ? deptData.all_teachers : []);
      setAllClasses(Array.isArray(deptData.all_classes) ? deptData.all_classes : []);
    } catch (err) {
      console.error('Failed to load course details', err);
      toast.error('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, classId]);

  const course = courseData?.course || null;
  const teacherAssignments = Array.isArray(courseData?.teacher_assignments) ? courseData.teacher_assignments : [];
  const recentMaterials = Array.isArray(courseData?.recent_materials) ? courseData.recent_materials : [];
  const recentAssignments = Array.isArray(courseData?.recent_assignments) ? courseData.recent_assignments : [];
  const recentActions = Array.isArray(courseData?.teacher_activity?.recent_actions) ? courseData.teacher_activity.recent_actions : [];
  const stats = courseData?.stats || {};

  const assignedClassIdsByTeacher = useMemo(() => {
    const map = new Map();
    teacherAssignments.forEach((assignment) => {
      const teacherKey = String(assignment.teacher_id);
      if (!map.has(teacherKey)) {
        map.set(teacherKey, new Set());
      }
      map.get(teacherKey).add(String(assignment.class_id));
    });
    return map;
  }, [teacherAssignments]);

  const selectedTeacherAssignedClassIds = selectedTeacherId
    ? assignedClassIdsByTeacher.get(String(selectedTeacherId)) || new Set()
    : new Set();

  const availableClassesForSelectedTeacher = useMemo(() => {
    const selectedSet = selectedTeacherAssignedClassIds;
    return allClasses.filter((cls) => !selectedSet.has(String(cls.id)));
  }, [allClasses, selectedTeacherAssignedClassIds]);

  const assignedTeachers = useMemo(() => {
    const names = teacherAssignments.map((item) => item.teacher_name).filter(Boolean);
    return [...new Set(names)];
  }, [teacherAssignments]);

  const openAddTeacherModal = () => {
    setSelectedTeacherId('');
    setSelectedClassIds([]);
    setAddTeacherModalOpen(true);
  };

  const toggleClassSelection = (id) => {
    setSelectedClassIds((current) => {
      const value = String(id);
      return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    });
  };

  const handleTeacherChange = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedClassIds([]);
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacherId) {
      toast.error('Select a teacher.');
      return;
    }

    if (selectedClassIds.length === 0) {
      toast.error('Select at least one class.');
      return;
    }

    setSavingTeacherAssignment(true);
    try {
      await adminApi.assignTeacher({
        teacher_id: Number(selectedTeacherId),
        course_id: Number(courseId),
        class_ids: selectedClassIds.map((id) => Number(id)),
      });
      toast.success('Teacher added to course successfully.');
      setAddTeacherModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add teacher to course.');
    } finally {
      setSavingTeacherAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/admin/courses')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={16} /> Back To Academic Management
        </button>
        <AdminCard className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm">
          Course not found.
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSection
        title={course.name}
        description="Course detail view — teachers, classes, assignments, materials, and activity."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openAddTeacherModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              <UserPlus size={16} />
              Add Teacher
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <ArrowLeft size={16} />
              Back To Academic Management
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Course</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{course.name}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Teachers</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{assignedTeachers.length}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Classes</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{teacherAssignments.length}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Materials</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{stats.materials || 0}</p>
          </AdminCard>
        </div>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Assigned Teachers</p>
              <p className="text-sm text-slate-500">Teachers linked to this course through class assignments.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {assignedTeachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No teachers assigned yet.</div>
            ) : (
              assignedTeachers.map((teacherName) => (
                <AdminBadge key={teacherName} tone="blue">{teacherName}</AdminBadge>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Course Assignments</p>
              <p className="text-sm text-slate-500">Each row shows the class and the teacher assigned to teach it.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {teacherAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No class assignment found for this course.</div>
            ) : (
              teacherAssignments.map((assignment) => (
                <div key={assignment.assignment_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">{assignment.class_name}</p>
                      <p className="text-sm text-slate-500">Teacher: {assignment.teacher_name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-200"><Users size={12} /> {assignment.students_in_class} students</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-200"><CalendarDays size={12} /> Assigned {new Date(assignment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminCard className="p-5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-700" />
              <p className="text-sm font-semibold text-slate-900">Recent Assignments</p>
            </div>
            <div className="mt-4 space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-sm text-slate-500">No assignments created yet.</p>
              ) : (
                recentAssignments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Due {item.due_date ? new Date(item.due_date).toLocaleString() : 'N/A'} · Created by {item.created_by}</p>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-blue-700" />
              <p className="text-sm font-semibold text-slate-900">Recent Materials</p>
            </div>
            <div className="mt-4 space-y-3">
              {recentMaterials.length === 0 ? (
                <p className="text-sm text-slate-500">No materials uploaded yet.</p>
              ) : (
                recentMaterials.map((item) => (
                  <div key={`${item.title}-${item.created_at}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Uploaded by {item.uploaded_by} · {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>

        <AdminCard className="p-5">
          <div className="flex items-center gap-2">
            <ChartColumn size={16} className="text-blue-700" />
            <p className="text-sm font-semibold text-slate-900">Recent Activity</p>
          </div>
          <div className="mt-4 space-y-3">
            {recentActions.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity found for this course.</p>
            ) : (
              recentActions.map((item, index) => (
                <div key={`${item.action_time}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.action_label}</p>
                  <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1"><Clock3 size={12} /> {item.action_time ? new Date(item.action_time).toLocaleString() : 'N/A'}</p>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </AdminSection>

      {addTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-700">Add Teacher</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a teacher and the classes they will teach for this course.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddTeacherModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <X size={14} />
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Select teacher...</option>
                  {allTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">Classes</p>
                <p className="text-xs text-slate-500">Only classes that are not already assigned to this teacher for this course are shown.</p>
              </div>
            </div>

            <div className="mt-4">
              {!selectedTeacherId ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Select a teacher first to load available classes.
                </div>
              ) : availableClassesForSelectedTeacher.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No available classes for this teacher and course.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableClassesForSelectedTeacher.map((cls) => {
                    const checked = selectedClassIds.includes(String(cls.id));
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${checked ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                          <p className="text-xs text-slate-500">{cls.students_count || 0} students</p>
                        </div>
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                          <Check size={14} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setAddTeacherModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTeacher}
                disabled={savingTeacherAssignment || !selectedTeacherId || selectedClassIds.length === 0}
                className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingTeacherAssignment ? 'Saving...' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseDetailsPage;