import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  MessageSquareText,
} from 'lucide-react';
import assignmentApi from '../../api/modules/assignment.api';
import { COLORS } from '../../constants/theme';

const statusTone = {
  graded: 'bg-green-100 text-green-700',
  submitted: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  late: 'bg-red-100 text-red-700',
};

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await assignmentApi.getMySubmissions();
        const submissionList = res.data?.data ?? res.data ?? [];
        setSubmissions(Array.isArray(submissionList) ? submissionList : []);
      } catch (error) {
        console.error('Failed to load submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 pb-12 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          My Submissions
        </h1>
        <p className="text-gray-500">
          Review the work you have submitted and any grades or feedback you have received.
        </p>
      </header>

      {!submissions.length ? (
        <div className="bg-white rounded-3xl border border-dashed p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
          <p className="text-gray-500">Your submitted assignment work will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submissions.map((submission) => {
            const tone = statusTone[submission.status] || 'bg-slate-100 text-slate-700';

            return (
              <motion.div
                key={submission.id}
                className="bg-white rounded-2xl border p-6 shadow-sm"
                style={{ borderColor: COLORS.BORDER }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
                      {submission.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${tone}`}>
                    {submission.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span>Max Marks: {submission.max_marks ?? '-'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>
                      Score: {submission.marks ?? 'Not graded yet'}
                    </span>
                  </div>

                  {submission.answer_text ? (
                    <div className="flex items-start gap-2">
                      <MessageSquareText size={16} className="text-blue-600 mt-0.5" />
                      <p className="line-clamp-3">{submission.answer_text}</p>
                    </div>
                  ) : null}

                  {submission.feedback ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                        Teacher Feedback
                      </p>
                      <p>{submission.feedback}</p>
                    </div>
                  ) : null}
                </div>

                {submission.submission_file_url ? (
                  <a
                    href={submission.submission_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Download size={16} />
                    Download attachment
                  </a>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
