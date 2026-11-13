import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { validateRegisterForm } from '../utils/validators';

/** Live checklist so people know the password rules before they submit. */
function PasswordRules({ password }) {
  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'A letter', met: /[A-Za-z]/.test(password) },
    { label: 'A number', met: /\d/.test(password) },
  ];

  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center gap-1 ${rule.met ? 'text-emerald-300' : 'text-muted'}`}
        >
          <Check className={`h-3 w-3 ${rule.met ? 'opacity-100' : 'opacity-30'}`} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    const errors = validateRegisterForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setServerError('');

    try {
      const newUser = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(`Welcome to CineVerse, ${newUser.name.split(' ')[0]}!`);
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        Save movies, rate what you watch and get your own dashboard.
      </p>

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
          id="name"
          label="Name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          autoComplete="name"
          placeholder="Your name"
        />
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
          autoComplete="new-password"
          placeholder="Create a password"
        >
          <PasswordRules password={form.password} />
        </FormField>
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-gold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
