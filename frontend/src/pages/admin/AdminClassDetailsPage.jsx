import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, Plus, Trash2, Users, Mail, User, UserPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminApi from '../../api/modules/admin.api';
import { AdminCard, AdminSection } from '../../components/admin/AdminUI';

const AdminClassDetailsPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [classItem, setClassItem] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [loadingAvailableStudents, setLoadingAvailableStudents] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Get class details with students and assigned courses
      const classRes = await adminApi.getClassDetails(classId);
      const classDetails = classRes?.data?.data || {};
      
      setClassItem(classDetails.class || null);
      setStudents(Array.isArray(classDetails.students) ? classDetails.students : []);
      setAssignedCourses(Array.isArray(classDetails.assigned_courses) ? classDetails.assigned_courses : []);

      // Get all courses for assignment modal
      const deptRes = await adminApi.getAcademicDepartments();
      const deptData = deptRes?.data?.data || deptRes?.data || {};
      setAllCourses(Array.isArray(deptData.all_courses) ? deptData.all_courses : []);
    } catch (err) {
      console.error('Failed to load class details', err);
      toast.error('Failed to load class details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  useEffect(() => {
    setSelectedTeacherId('');
  }, [selectedCourseId]);

  useEffect(() => {
    setSelectedStudentId('');
  }, [addStudentModalOpen]);

  const selectedCourseTeachers = useMemo(() => {
    if (!selectedCourseId) return [];
    const course = allCourses.find((c) => String(c.id) === String(selectedCourseId));
    return course?.teachers || [];
  }, [selectedCourseId, allCourses]);

  const openModal = () => {
    setSelectedCourseId('');
    setSelectedTeacherId('');
    setModalOpen(true);
  };

  const openAddStudentModal = async () => {
    setAddStudentModalOpen(true);
    setLoadingAvailableStudents(true);
    try {
      const res = await adminApi.getAvailableStudentsForClass(classId);
      const data = res?.data?.data || {};
      setAvailableStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      console.error('Failed to load available students', err);
      toast.error('Failed to load available students.');
      setAvailableStudents([]);
    } finally {
      setLoadingAvailableStudents(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourseId) { toast.error('Select a course.'); return; }
    if (!selectedTeacherId) { toast.error('Select a teacher.'); return; }

    setSaving(true);
    try {
      await adminApi.assignCourseToClass(classId, {
        course_id: Number(selectedCourseId),
        teacher_id: Number(selectedTeacherId),
      });
      toast.success('Course assigned successfully.');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign course.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast.error('Select a student.');
      return;
    }

    setSaving(true);
    try {
      await adminApi.assignStudent({
        student_id: Number(selectedStudentId),
        class_id: Number(classId),
      });
      toast.success('Student added to class successfully.');
      setAddStudentModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add student to class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classItem?.id) return;
    const ok = window.confirm(`Delete class "${classItem.name}"? This will unassign students and remove teacher/course links.`);
    if (!ok) return;

    setDeleting(true);
    try {
      await adminApi.deleteClass(classItem.id);
      toast.success('Class deleted.');
      navigate('/admin/courses');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete class.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    );
  }

  if (!classItem) {
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
          Class not found.
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSection
        title={classItem.name}
        description="Class detail view — assigned courses and teachers."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <ArrowLeft size={16} />
              Back To Academic Management
            </button>
            <button
              type="button"
              onClick={handleDeleteClass}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              title="Delete class"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting…' : 'Delete Class'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Class</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{classItem.name}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Students</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{students.length}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Assigned Courses</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{assignedCourses.length}</p>
          </AdminCard>
        </div>

        {/* Students Section */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Students in Class</p>
              <p className="text-sm text-slate-500">All enrolled and active students</p>
            </div>
            <button
              type="button"
              onClick={openAddStudentModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              <UserPlus size={16} />
              Add Student
            </button>
          </div>

          <div className="mt-4">
            {students.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No students enrolled in this class yet.
              </div>
            )}
            {students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Student ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-full bg-blue-100 p-2 text-blue-600">
                              <User size={16} />
                            </div>
                            <span className="font-medium text-slate-900">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{student.student_id || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mail size={14} />
                            {student.email}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AdminCard>

        {/* Assigned Courses Section */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Assigned Courses</p>
              <p className="text-sm text-slate-500">Each course has a designated teacher for this class.</p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Assign Course
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {assignedCourses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No course assigned yet.
              </div>
            )}
            {assignedCourses.map((ac) => (
              <div key={ac.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-700 shrink-0" />
                    <p className="text-base font-semibold text-slate-900">{ac.course_name}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={13} />
                    {ac.teacher_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </AdminSection>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-700">Assign Course</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{classItem.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Select course, then pick a teacher from that course&apos;s list.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Select course...</option>
                  {allCourses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Teacher
                  {selectedCourseId && selectedCourseTeachers.length === 0 && (
                    <span className="ml-2 text-xs font-normal text-amber-600">No teachers assigned to this course</span>
                  )}
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  disabled={!selectedCourseId || selectedCourseTeachers.length === 0}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {!selectedCourseId ? 'Select a course first' : selectedCourseTeachers.length === 0 ? 'No teachers available' : 'Select teacher...'}
                  </option>
                  {selectedCourseTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignCourse}
                disabled={saving || !selectedCourseId || !selectedTeacherId}
                className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-700">Add Student</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{classItem.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Select a student who is not assigned to another class.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddStudentModalOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 inline-flex items-center gap-2"
              >
                <X size={14} />
                Close
              </button>
            </div>

            <div className="mt-4">
              {loadingAvailableStudents ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-blue-600" size={36} />
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  No available students found. All active students are already assigned to a class.
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                  {availableStudents.map((student) => {
                    const selected = String(selectedStudentId) === String(student.id);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setSelectedStudentId(String(student.id))}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{student.full_name}</p>
                            <p className="mt-1 text-sm text-slate-500">{student.student_id || 'N/A'} • {student.email}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                            {selected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setAddStudentModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStudent}
                disabled={saving || !selectedStudentId}
                className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassDetailsPage;
