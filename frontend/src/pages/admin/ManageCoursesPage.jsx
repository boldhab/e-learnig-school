import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Plus, Users, UserCheck, Layers3, Sparkles } from 'lucide-react';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const courses = [
	{ code: 'MTH-101', title: 'Mathematics', section: 'Grade 10A', teacher: 'Amina Yusuf', students: 42, analytics: '91% completion' },
	{ code: 'ENG-204', title: 'English Literature', section: 'Grade 11B', teacher: 'Grace Mensah', students: 38, analytics: '87% completion' },
	{ code: 'SCI-301', title: 'Integrated Science', section: 'Grade 12A', teacher: 'Daniel Okoro', students: 44, analytics: '94% completion' },
	{ code: 'ICT-115', title: 'Computer Studies', section: 'Grade 9C', teacher: 'Victoria James', students: 36, analytics: '89% completion' },
];

const hierarchy = [
	{ title: 'Grades', detail: 'Junior and senior secondary structure', count: 6 },
	{ title: 'Subjects', detail: 'Core and elective subject map', count: 18 },
	{ title: 'Sections', detail: 'Class groups and enrollment buckets', count: 24 },
];

const ManageCoursesPage = () => {
	const [expanded, setExpanded] = useState('Grade 10');

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
					<AdminMetricCard title="Total Courses" value="142" trend="+6.7%" icon={BookOpen} />
					<AdminMetricCard title="Assigned Teachers" value="84" trend="+2.1%" icon={UserCheck} />
					<AdminMetricCard title="Active Sections" value="24" trend="+4" icon={Users} />
					<AdminMetricCard title="Auto Groups" value="38" trend="+8" icon={Sparkles} />
				</div>

				<AdminCard className="p-5">
					<div className="space-y-3">
						{['Grade 10', 'Grade 11', 'Grade 12'].map((level) => (
							<div key={level} className="rounded-2xl border border-slate-200">
								<button
									type="button"
									onClick={() => setExpanded(level)}
									className="flex w-full items-center justify-between px-5 py-4 text-left"
								>
									<div>
										<p className="text-sm font-semibold text-slate-900">{level}</p>
										<p className="text-sm text-slate-500">Sections, teacher assignment, and discussion groups</p>
									</div>
									{expanded === level ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
								</button>
								{expanded === level && (
									<div className="grid gap-4 border-t border-slate-200 p-5 lg:grid-cols-2">
										{courses.filter((course) => course.section.includes(level === 'Grade 10' ? '10' : level === 'Grade 11' ? '11' : '12')).map((course) => (
											<motion.div key={course.code} className="rounded-2xl border border-slate-200 p-4" whileHover={{ y: -2 }}>
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="text-xs uppercase tracking-[0.18em] text-slate-500">{course.code}</p>
														<h4 className="mt-1 text-lg font-semibold text-slate-900">{course.title}</h4>
														<p className="mt-1 text-sm text-slate-500">{course.section}</p>
													</div>
													<AdminBadge tone="blue">{course.analytics}</AdminBadge>
												</div>
												<div className="mt-4 grid gap-2 text-sm text-slate-600">
													<div className="flex items-center justify-between"><span>Teacher</span><span className="font-medium text-slate-900">{course.teacher}</span></div>
													<div className="flex items-center justify-between"><span>Students</span><span className="font-medium text-slate-900">{course.students}</span></div>
												</div>
												<div className="mt-4 flex gap-2">
													<button type="button" className="rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white">Assign Teacher</button>
													<button type="button" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Manage Section</button>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</AdminCard>
			</AdminSection>
		</div>
	);
};

export default ManageCoursesPage;

