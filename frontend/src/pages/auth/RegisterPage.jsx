import React, { useEffect, useState } from 'react';
import authApi from '../../api/modules/auth.api';
import adminApi from '../../api/modules/admin.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getClasses();
        const data = res?.data?.data ?? res?.data ?? [];
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        // ignore
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_name: fullName,
        username,
        email,
        password,
      };
      if (classId) payload.class_id = parseInt(classId, 10);
      else if (gradeName) payload.grade_name = gradeName;

      const res = await authApi.register(payload);
      toast.success('Registration successful');
      navigate('/auth/login');
    } catch (err) {
      console.error('Register failed', err);
      toast.error(err?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 480, background: 'white', borderRadius: 12, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create an account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <label style={{ fontSize: 12, color: '#334155' }}>Assign by existing class (optional)</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">-- Select class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label style={{ fontSize: 12, color: '#334155' }}>Or enter Grade name (e.g. Grade 10)</label>
          <input placeholder="Grade name (optional)" value={gradeName} onChange={(e) => setGradeName(e.target.value)} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? 'Creating…' : 'Create account'}</button>
            <button type="button" onClick={() => navigate('/auth/login')} style={{ flex: 1 }}>Back to login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
