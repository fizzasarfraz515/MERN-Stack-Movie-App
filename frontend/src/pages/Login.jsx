import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { validateLoginForm } from '../utils/validators';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Send people back to the page that asked them to log in.
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/';

  if (user) return <Navigate to={redirectTo} replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLoginForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setServerError('');

    try {
      const loggedInUser = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Log in to pick up where you left off.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        {serverError && (
          <div
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
          placeholder="Your password"
        />

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to CineVerse?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
