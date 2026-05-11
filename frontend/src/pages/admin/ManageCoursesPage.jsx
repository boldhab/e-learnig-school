import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Plus, Users, UserCheck, Layers3, Sparkles, Loader2, CalendarClock, FileText, MessageSquareText, Megaphone, ClipboardCheck } from 'lucide-react';
import adminApi from '../../api/modules/admin.api';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const ManageCoursesPage = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [hierarchy, setHierarchy] = useState([]);
	const [summary, setSummary] = useState({
		total_courses: 0,
		total_subjects: 0,
		total_grades: 0,
		assigned_teachers: 0,
		active_sections: 0,
		auto_groups: 0,
	});
	const [levels, setLevels] = useState([]);
	const [unassignedCourses, setUnassignedCourses] = useState([]);
	const [expanded, setExpanded] = useState('');
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [detailsError, setDetailsError] = useState('');
	const [courseDetails, setCourseDetails] = useState(null);

	const fetchOverview = async () => {
		setLoading(true);
		setError('');

		try {
			const res = await adminApi.getCoursesOverview();
			const data = res.data?.data || res.data || {};

			setHierarchy(data.hierarchy || []);
			setSummary((prev) => ({ ...prev, ...(data.summary || {}) }));
			setLevels(data.levels || []);
			setUnassignedCourses(data.unassigned_courses || []);

			if ((data.levels || []).length > 0) {
				setExpanded(data.levels[0].name);
			}
		} catch (err) {
			console.error('Failed to fetch course overview:', err);
			setError('Failed to load course and subject data from the database.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOverview();
	}, []);

	const handleCourseSelect = async (course) => {
		setSelectedCourse(course);
		setDetailsLoading(true);
		setDetailsError('');
		setCourseDetails(null);

		try {
			const res = await adminApi.getCourseDetails(course.course_id, course.class_id);
			const data = res.data?.data || res.data || null;
			setCourseDetails(data);
		} catch (err) {
			console.error('Failed to fetch course details:', err);
			setDetailsError('Failed to load subject/course details for the selected card.');
		} finally {
			setDetailsLoading(false);
		}
	};

	const closeCourseDetails = () => {
		setSelectedCourse(null);
		setCourseDetails(null);
		setDetailsError('');
		setDetailsLoading(false);
	};

	const hasNoAssignedCourses = useMemo(() => {
		return levels.every((level) => (level.courses || []).length === 0);
	}, [levels]);

	const selectedCardKey = selectedCourse ? `${selectedCourse.course_id}-${selectedCourse.class_id || selectedCourse.section}` : '';

	if (loading) {
		return (
			<div className="h-64 flex items-center justify-center">
				<Loader2 className="animate-spin text-blue-600" size={48} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<AdminSection
				title="Course & Subject Management"
				description="Manage grades, subjects, sections, teachers, and class analytics from a single academic hierarchy."
				action={
					<button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm">
						<Plus size={16} />
						Create Course
					</button>
				}
			>
				<div className="grid gap-4 md:grid-cols-3">
					{hierarchy.map((item) => (
						<AdminCard key={item.title} className="p-5">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-slate-500">Academic layer</p>
									<h3 className="mt-1 text-xl font-semibold text-slate-900">{item.title}</h3>
								</div>
								<div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Layers3 size={18} /></div>
							</div>
							<p className="mt-3 text-sm text-slate-500">{item.detail}</p>
							<p className="mt-4 text-sm font-semibold text-slate-900">{item.count} configured units</p>
						</AdminCard>
					))}
				</div>

				<div className="grid gap-4 md:grid-cols-4">
					<AdminMetricCard title="Total Courses" value={summary.total_courses} trend={`${summary.total_subjects} subjects`} icon={BookOpen} />
					<AdminMetricCard title="Assigned Teachers" value={summary.assigned_teachers} trend="Live from assignments" icon={UserCheck} />
					<AdminMetricCard title="Active Sections" value={summary.active_sections} trend={`${summary.total_grades} grades`} icon={Users} />
					<AdminMetricCard title="Auto Groups" value={summary.auto_groups} trend="Discussion groups" icon={Sparkles} />
				</div>

				{error && (
					<AdminCard className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm">
						{error}
					</AdminCard>
				)}

				<AdminCard className="p-5">
					<div className="space-y-3">
						{levels.map((level) => (
							<div key={level.id} className="rounded-2xl border border-slate-200">
								<button
									type="button"
									onClick={() => setExpanded(level.name)}
									className="flex w-full items-center justify-between px-5 py-4 text-left"
								>
									<div>
										<p className="text-sm font-semibold text-slate-900">{level.name}</p>
										<p className="text-sm text-slate-500">Sections, teacher assignment, and discussion groups</p>
									</div>
									{expanded === level.name ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
								</button>
								{expanded === level.name && (
									<div className="grid gap-4 border-t border-slate-200 p-5 lg:grid-cols-2">
										{(level.courses || []).length === 0 && (
											<div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 lg:col-span-2">
												No assigned courses/subjects in this grade yet.
											</div>
										)}
										{(level.courses || []).map((course) => {
											const cardKey = `${course.course_id}-${course.class_id || course.section}`;
											const isSelected = selectedCardKey === cardKey;

											return (
											<motion.div
												key={course.assignment_id || cardKey}
												className={`rounded-2xl border p-4 cursor-pointer transition-colors ${isSelected ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-blue-200'}`}
												whileHover={{ y: -2 }}
												onClick={() => handleCourseSelect(course)}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="text-xs uppercase tracking-[0.18em] text-slate-500">{course.code}</p>
														<h4 className="mt-1 text-lg font-semibold text-slate-900">{course.title}</h4>
														<p className="mt-1 text-sm text-slate-500">{course.section}</p>
													</div>
													<AdminBadge tone={course.type === 'Subject' ? 'teal' : 'blue'}>{course.type}</AdminBadge>
												</div>
												<div className="mt-4 grid gap-2 text-sm text-slate-600">
													<div className="flex items-center justify-between"><span>Teacher</span><span className="font-medium text-slate-900">{course.teacher}</span></div>
													<div className="flex items-center justify-between"><span>Students</span><span className="font-medium text-slate-900">{course.students}</span></div>
												</div>
												<div className="mt-4 flex gap-2">
													<button type="button" onClick={(event) => event.stopPropagation()} className="rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white">Assign Teacher</button>
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation();
															handleCourseSelect(course);
														}}
														className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
													>
														Manage Section
													</button>
												</div>
											</motion.div>
											);
										})}

										{selectedCourse && selectedCourse.class_id === level.id && (
											<div className="rounded-2xl border border-blue-200 bg-white p-5 lg:col-span-2">
												<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
													<div>
														<p className="text-xs uppercase tracking-[0.18em] text-blue-700">Course Detail</p>
														<h4 className="text-lg font-semibold text-slate-900">{selectedCourse.title} - {selectedCourse.section}</h4>
													</div>
													<div className="flex items-center gap-2">
														<AdminBadge tone={selectedCourse.type === 'Subject' ? 'teal' : 'blue'}>
															{selectedCourse.type}
														</AdminBadge>
														<button
															type="button"
															onClick={closeCourseDetails}
															className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
														>
															Close
														</button>
													</div>
												</div>

												{detailsLoading && (
													<div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
														<Loader2 size={16} className="animate-spin" />
														Loading teacher activity and related subject analytics...
													</div>
												)}

												{detailsError && (
													<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
														{detailsError}
													</div>
												)}

												{!detailsLoading && !detailsError && courseDetails && (
													<div className="mt-4 space-y-4">
														<div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
															<div className="rounded-xl border border-slate-200 p-3">
																<p className="text-xs text-slate-500">Assignments</p>
																<p className="mt-1 text-lg font-semibold text-slate-900">{courseDetails.stats?.assignments || 0}</p>
															</div>
															<div className="rounded-xl border border-slate-200 p-3">
																<p className="text-xs text-slate-500">Materials</p>
																<p className="mt-1 text-lg font-semibold text-slate-900">{courseDetails.stats?.materials || 0}</p>
															</div>
															<div className="rounded-xl border border-slate-200 p-3">
																<p className="text-xs text-slate-500">Announcements</p>
																<p className="mt-1 text-lg font-semibold text-slate-900">{courseDetails.stats?.announcements || 0}</p>
															</div>
															<div className="rounded-xl border border-slate-200 p-3">
																<p className="text-xs text-slate-500">Discussion Topics</p>
																<p className="mt-1 text-lg font-semibold text-slate-900">{courseDetails.stats?.discussion_topics || 0}</p>
															</div>
															<div className="rounded-xl border border-slate-200 p-3">
																<p className="text-xs text-slate-500">Attendance Records</p>
																<p className="mt-1 text-lg font-semibold text-slate-900">{courseDetails.stats?.attendance_total_records || 0}</p>
															</div>
														</div>

														<div className="grid gap-4 lg:grid-cols-2">
															<div className="rounded-xl border border-slate-200 p-4">
																<p className="text-sm font-semibold text-slate-900">Teacher Assignments</p>
																<div className="mt-3 space-y-2 text-sm text-slate-600">
																	{(courseDetails.teacher_assignments || []).length === 0 && <p>No teacher assignment found for this selection.</p>}
																	{(courseDetails.teacher_assignments || []).map((assignment) => (
																		<div key={assignment.assignment_id} className="rounded-lg bg-slate-50 px-3 py-2">
																			<p className="font-medium text-slate-900">{assignment.teacher_name}</p>
																			<p className="text-xs text-slate-500">Section: {assignment.class_name} | Students: {assignment.students_in_class}</p>
																		</div>
																	))}
																</div>
															</div>

															<div className="rounded-xl border border-slate-200 p-4">
																<p className="text-sm font-semibold text-slate-900">Teacher Activity Summary</p>
																<div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
																	<div className="rounded-lg bg-blue-50 p-2">
																		<FileText size={14} className="mx-auto text-blue-700" />
																		<p className="mt-1 font-semibold text-slate-900">{courseDetails.teacher_activity?.assignments_created || 0}</p>
																		<p className="text-slate-500">Assignments</p>
																	</div>
																	<div className="rounded-lg bg-teal-50 p-2">
																		<ClipboardCheck size={14} className="mx-auto text-teal-700" />
																		<p className="mt-1 font-semibold text-slate-900">{courseDetails.teacher_activity?.attendance_marked || 0}</p>
																		<p className="text-slate-500">Attendance</p>
																	</div>
																	<div className="rounded-lg bg-amber-50 p-2">
																		<BookOpen size={14} className="mx-auto text-amber-700" />
																		<p className="mt-1 font-semibold text-slate-900">{courseDetails.teacher_activity?.materials_uploaded || 0}</p>
																		<p className="text-slate-500">Materials</p>
																	</div>
																</div>
																<div className="mt-3 space-y-2">
																	<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Recent Teacher Actions</p>
																	{(courseDetails.teacher_activity?.recent_actions || []).length === 0 && (
																		<p className="text-sm text-slate-500">No recent teacher activity logged for this course/subject yet.</p>
																	)}
																	{(courseDetails.teacher_activity?.recent_actions || []).map((action, index) => (
																		<div key={`${action.action_time}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-start gap-2">
																			<CalendarClock size={14} className="mt-0.5 text-slate-500" />
																			<div>
																				<p>{action.action_label}</p>
																				<p className="text-xs text-slate-500 mt-0.5">{new Date(action.action_time).toLocaleString()}</p>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														</div>

														<div className="grid gap-4 lg:grid-cols-3">
															<div className="rounded-xl border border-slate-200 p-4">
																<p className="text-sm font-semibold text-slate-900 flex items-center gap-2"><BookOpen size={16} /> Latest Materials</p>
																<div className="mt-2 space-y-2 text-sm text-slate-600">
																	{(courseDetails.recent_materials || []).length === 0 && <p>No material uploaded yet.</p>}
																	{(courseDetails.recent_materials || []).map((material, idx) => (
																		<div key={`${material.title}-${idx}`} className="rounded-lg bg-slate-50 px-3 py-2">
																			<p className="font-medium text-slate-800">{material.title}</p>
																			<p className="text-xs text-slate-500">By {material.uploaded_by}</p>
																		</div>
																	))}
																</div>
															</div>

															<div className="rounded-xl border border-slate-200 p-4">
																<p className="text-sm font-semibold text-slate-900 flex items-center gap-2"><FileText size={16} /> Latest Assignments</p>
																<div className="mt-2 space-y-2 text-sm text-slate-600">
																	{(courseDetails.recent_assignments || []).length === 0 && <p>No assignments created yet.</p>}
																	{(courseDetails.recent_assignments || []).map((assignment) => (
																		<div key={assignment.id} className="rounded-lg bg-slate-50 px-3 py-2">
																			<p className="font-medium text-slate-800">{assignment.title}</p>
																			<p className="text-xs text-slate-500">By {assignment.created_by}</p>
																		</div>
																	))}
																</div>
															</div>

															<div className="rounded-xl border border-slate-200 p-4">
																<p className="text-sm font-semibold text-slate-900">Engagement Snapshot</p>
																<div className="mt-3 space-y-2 text-sm text-slate-600">
																	<div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><MessageSquareText size={14} /> Discussion Messages</span><span className="font-semibold text-slate-900">{courseDetails.stats?.discussion_messages || 0}</span></div>
																	<div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><Megaphone size={14} /> Announcements</span><span className="font-semibold text-slate-900">{courseDetails.stats?.announcements || 0}</span></div>
																	<div className="flex items-center justify-between"><span>Present Records</span><span className="font-semibold text-slate-900">{courseDetails.stats?.attendance_present_records || 0}</span></div>
																	<div className="flex items-center justify-between"><span>Absent Records</span><span className="font-semibold text-slate-900">{courseDetails.stats?.attendance_absent_records || 0}</span></div>
																	<div className="flex items-center justify-between"><span>Late Records</span><span className="font-semibold text-slate-900">{courseDetails.stats?.attendance_late_records || 0}</span></div>
																</div>
															</div>
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								)}
							</div>
						))}

						{hasNoAssignedCourses && unassignedCourses.length > 0 && (
							<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
								<p className="text-sm font-semibold text-amber-900">Unassigned Courses & Subjects</p>
								<p className="mt-1 text-sm text-amber-800">These records exist in the database but are not yet linked to a teacher/class assignment.</p>
								<div className="mt-3 flex flex-wrap gap-2">
									{unassignedCourses.map((course) => (
										<AdminBadge key={course.course_id} tone="amber">
											{course.title} ({course.type})
										</AdminBadge>
									))}
								</div>
							</div>
						)}
					</div>
				</AdminCard>
			</AdminSection>
		</div>
	);
};

export default ManageCoursesPage;

