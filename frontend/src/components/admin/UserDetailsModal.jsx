import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Calendar, Trash2, Ban, Key, Save, AlertTriangle, CheckCircle, GraduationCap, BookOpen } from 'lucide-react';
import adminApi from '../../api/modules/admin.api';
import toast from 'react-hot-toast';

const UserDetailsModal = ({ user, isOpen, onClose, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      class_id: user.class_id ?? null,
      parent_name: user.parent_name || '',
      parent_email: user.parent_email || '',
      relationship_type: user.relationship_type || 'guardian',
      parent_password: '',
    });
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }, [isOpen, user?.id]);

  if (!user) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
      };

      if (user.role_name === 'STUDENT') {
        payload.class_id = formData.class_id;
        payload.parent_name = formData.parent_name;
        payload.parent_email = formData.parent_email;
        payload.relationship_type = formData.relationship_type || 'guardian';

        if (formData.parent_password) {
          payload.parent_password = formData.parent_password;
        }
      }

      await adminApi.updateUser(payload);
      toast.success("User updated successfully!");
      setIsEditing(false);
      onActionComplete();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      toast.success(`User account ${newStatus === 'active' ? 'activated' : 'banned'} successfully!`);
      onActionComplete();
      onClose();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminApi.deleteUser(user.id);
      toast.success("User deleted permanently");
      onActionComplete();
      onClose();
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newPass = prompt("Enter new password for this user:");
    if (!newPass || newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await adminApi.resetPassword(user.id, newPass);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1 opacity-70 uppercase tracking-widest text-[10px] font-bold">
                      <Shield size={12} />
                      {user.role_name} • ID: #{user.id}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Info Section */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    {isEditing ? (
                      <input 
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                      />
                    ) : (
                      <div className="text-slate-900 font-medium flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {user.full_name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
                    <div className="text-slate-900 font-medium flex items-center gap-2">
                      <Shield size={16} className="text-slate-400" />
                      {user.username}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    {isEditing ? (
                      <input 
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <div className="text-slate-900 font-medium flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined On</label>
                    <div className="text-slate-900 font-medium flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                  </div>

                  {user.role_name === 'STUDENT' && user.class_name && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Assigned Grade/Class</label>
                      <div className="text-blue-900 font-bold flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        <GraduationCap size={16} />
                        {user.class_name}
                      </div>
                    </div>
                  )}

                  {user.role_name === 'STUDENT' && (
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Parent Information</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Name</label>
                          {isEditing ? (
                            <input 
                              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Parent Full Name"
                              value={formData.parent_name || ''}
                              onChange={e => setFormData({...formData, parent_name: e.target.value})}
                            />
                          ) : (
                            <div className="text-slate-900 font-medium text-sm">
                              {user.parent_name || <span className="text-slate-400 italic">Not Linked</span>}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Email</label>
                          {isEditing ? (
                            <input 
                              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="parent@example.com"
                              type="email"
                              value={formData.parent_email || ''}
                              onChange={e => setFormData({...formData, parent_email: e.target.value})}
                            />
                          ) : (
                            <div className="text-slate-900 font-medium text-sm">
                              {user.parent_email || <span className="text-slate-400 italic">No Email</span>}
                            </div>
                          )}
                        </div>

                        {isEditing && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relationship</label>
                            <select
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                value={formData.relationship_type || 'guardian'}
                                onChange={e => setFormData({...formData, relationship_type: e.target.value})}
                              >
                                <option value="guardian">Guardian</option>
                                <option value="mother">Mother</option>
                                <option value="father">Father</option>
                            </select>
                          </div>
                        )}
                        {isEditing && (
                           <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Parent Password (Optional)</label>
                             <input 
                               className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                               placeholder="Leave blank to keep current"
                               type="password"
                               value={formData.parent_password || ''}
                               onChange={e => setFormData({...formData, parent_password: e.target.value})}
                             />
                           </div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role_name === 'TEACHER' && user.subjects && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Teaching Subjects</label>
                      <div className="text-teal-900 font-bold flex items-center gap-2 bg-teal-50 p-2 rounded-lg">
                        <BookOpen size={16} />
                        {user.subjects}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div className="bg-slate-50 rounded-[2rem] p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Account Actions</h3>
                  
                  {isEditing ? (
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                    >
                      <User size={18} />
                      Edit Details
                    </button>
                  )}

                  <button 
                    onClick={handleResetPassword}
                    className="w-full p-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <Key size={18} />
                    Reset Password
                  </button>

                  <button 
                    onClick={handleStatusToggle}
                    className={`w-full p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      user.status === 'active' 
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Ban size={18} />
                    {user.status === 'active' ? 'Ban Account' : 'Unban Account'}
                  </button>

                  <div className="pt-4 mt-4 border-t border-slate-200">
                    {showDeleteConfirm ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-red-600 font-bold text-center uppercase tracking-wider">Are you absolutely sure?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={handleDelete} className="p-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">Yes, Delete</button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="p-3 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full p-4 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                        Delete Permanently
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserDetailsModal;
