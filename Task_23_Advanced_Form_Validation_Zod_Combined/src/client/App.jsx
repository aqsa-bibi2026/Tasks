import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound
} from 'lucide-react';

import {
  useForm
} from 'react-hook-form';

import {
  zodResolver
} from '@hookform/resolvers/zod';

import {
  profileSchema
} from '../shared/profileSchema.js';

import {
  createProfile,
  fetchProfileStats
} from './api.js';

const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Product Manager',
  'Other'
];

function passwordScore(value = '') {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

function strengthLabel(score) {
  if (score <= 1) return 'Very weak';
  if (score === 2) return 'Weak';
  if (score === 3) return 'Good';
  if (score === 4) return 'Strong';
  return 'Excellent';
}

export default function App() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [serverMessage, setServerMessage] =
    useState('');

  const [successProfile, setSuccessProfile] =
    useState(null);

  const [profileCount, setProfileCount] =
    useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: {
      errors,
      isSubmitting,
      isValid,
      dirtyFields
    }
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      website: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  });

  const password = watch('password');
  const score = passwordScore(password);

  const completedFields = useMemo(
    () =>
      Object.keys(dirtyFields)
        .filter((key) => key !== 'terms')
        .length,
    [dirtyFields]
  );

  const progress =
    Math.min(
      100,
      Math.round((completedFields / 8) * 100)
    );

  useEffect(() => {
    fetchProfileStats()
      .then((data) =>
        setProfileCount(
          data.totalProfiles || 0
        )
      )
      .catch(() => {});
  }, []);

  const onSubmit = async (values) => {
    setServerMessage('');

    try {
      const response =
        await createProfile(values);

      setSuccessProfile(
        response.profile
      );

      setServerMessage(
        response.message
      );

      setProfileCount(
        (count) => count + 1
      );

      reset();
    } catch (error) {
      setServerMessage(
        error.message
      );

      Object.entries(
        error.fieldErrors || {}
      ).forEach(
        ([field, message]) => {
          setError(field, {
            type: 'server',
            message
          });
        }
      );
    }
  };

  if (successProfile) {
    return (
      <div className="page">
        <Background />

        <section className="success-card">
          <div className="success-orbit">
            <div className="success-icon">
              <Check size={35} />
            </div>
          </div>

          <div className="eyebrow">
            VALIDATION COMPLETE
          </div>

          <h1>
            Profile created
            <em> successfully.</em>
          </h1>

          <p>
            Frontend and backend Zod
            validation both passed, and
            the profile was saved to
            Supabase.
          </p>

          <div className="success-details">
            <article>
              <small>NAME</small>
              <b>
                {successProfile.full_name}
              </b>
            </article>

            <article>
              <small>EMAIL</small>
              <b>
                {successProfile.email}
              </b>
            </article>

            <article>
              <small>COMPANY</small>
              <b>
                {successProfile.company}
              </b>
            </article>

            <article>
              <small>ROLE</small>
              <b>
                {successProfile.role}
              </b>
            </article>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setSuccessProfile(null)
            }
          >
            Create another profile
            <ChevronRight size={17} />
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <Background />

      <main>
        <section className="intro">
          <div className="brand">
            <span>
              <ShieldCheck size={22} />
            </span>

            <div>
              <b>FormShield</b>
              <small>
                Validation Intelligence
              </small>
            </div>
          </div>

          <div className="intro-copy">
            <div className="eyebrow">
              TASK 23 / ZOD VALIDATION
            </div>

            <h1>
              Build trust at
              <em> every field.</em>
            </h1>

            <p>
              A production-style onboarding
              form with client and server
              validation, polished UX,
              secure data checks and
              animated feedback.
            </p>
          </div>

          <div className="feature-list">
            <Feature
              icon={BadgeCheck}
              title="Dual-layer validation"
              text="Zod rules run in the browser and again on the API."
            />

            <Feature
              icon={LockKeyhole}
              title="Strong password policy"
              text="Length, uppercase, lowercase, number and symbol checks."
            />

            <Feature
              icon={Sparkles}
              title="Animated UX"
              text="Progress, focus states, error shake and success motion."
            />
          </div>

          <div className="mini-stat">
            <UsersRound size={18} />
            <div>
              <small>
                VALIDATED PROFILES
              </small>
              <b>{profileCount}</b>
            </div>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-top">
            <div>
              <div className="eyebrow">
                PROFESSIONAL ONBOARDING
              </div>

              <h2>
                Create your profile
              </h2>
            </div>

            <div className="validation-pill">
              <ShieldCheck size={14} />
              Zod protected
            </div>
          </div>

          <div className="progress-wrap">
            <div>
              <span>
                Form completion
              </span>

              <b>{progress}%</b>
            </div>

            <div className="progress-track">
              <span
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
          </div>

          {serverMessage &&
            !successProfile && (
              <div className="server-message">
                <CircleAlert size={17} />
                {serverMessage}
              </div>
            )}

          <form
            onSubmit={
              handleSubmit(onSubmit)
            }
            noValidate
          >
            <div className="grid">
              <Field
                label="Full name"
                icon={UserRound}
                error={errors.fullName}
              >
                <input
                  placeholder="Aqsa Bibi"
                  {...register('fullName')}
                />
              </Field>

              <Field
                label="Email address"
                icon={Mail}
                error={errors.email}
              >
                <input
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                />
              </Field>

              <Field
                label="Phone number"
                icon={Phone}
                error={errors.phone}
              >
                <input
                  placeholder="+92 300 1234567"
                  {...register('phone')}
                />
              </Field>

              <Field
                label="Company"
                icon={Building2}
                error={errors.company}
              >
                <input
                  placeholder="Acme Technologies"
                  {...register('company')}
                />
              </Field>

              <Field
                label="Professional role"
                icon={BriefcaseBusiness}
                error={errors.role}
              >
                <select
                  {...register('role')}
                >
                  <option value="">
                    Select your role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Website (optional)"
                icon={Globe2}
                error={errors.website}
              >
                <input
                  placeholder="https://yourportfolio.com"
                  {...register('website')}
                />
              </Field>

              <Field
                label="Password"
                icon={KeyRound}
                error={errors.password}
                wide
              >
                <div className="password-input">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Create a strong password"
                    {...register('password')}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    title={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>

                <div className="strength">
                  <div>
                    {[1, 2, 3, 4, 5].map(
                      (item) => (
                        <span
                          key={item}
                          className={
                            item <= score
                              ? 'active'
                              : ''
                          }
                        />
                      )
                    )}
                  </div>

                  <small>
                    {strengthLabel(score)}
                  </small>
                </div>
              </Field>

              <Field
                label="Confirm password"
                icon={LockKeyhole}
                error={errors.confirmPassword}
                wide
              >
                <div className="password-input">
                  <input
                    type={
                      showConfirm
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Repeat password"
                    {...register(
                      'confirmPassword'
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        (value) => !value
                      )
                    }
                  >
                    {showConfirm
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
              </Field>
            </div>

            <label
              className={
                errors.terms
                  ? 'terms error'
                  : 'terms'
              }
            >
              <input
                type="checkbox"
                {...register('terms')}
              />

              <span className="custom-check">
                <Check size={13} />
              </span>

              <span>
                I accept the Terms of
                Service and Privacy Policy.
              </span>
            </label>

            {errors.terms && (
              <small className="terms-error">
                {errors.terms.message}
              </small>
            )}

            <div className="submit-row">
              <div className="security-note">
                <ShieldCheck size={16} />
                Validated before database write
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (
                    <>
                      <LoaderCircle
                        className="spin"
                        size={17}
                      />
                      Validating...
                    </>
                  )
                  : (
                    <>
                      Create profile
                      <ChevronRight
                        size={17}
                      />
                    </>
                  )}
              </button>
            </div>
          </form>

          <div className="rules">
            <div>
              <CheckCircle2 size={15} />
              Client Zod
            </div>

            <div>
              <CheckCircle2 size={15} />
              Server Zod
            </div>

            <div>
              <CheckCircle2 size={15} />
              Duplicate email guard
            </div>

            <div>
              <CheckCircle2 size={15} />
              Supabase persistence
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
  wide
}) {
  return (
    <label
      className={[
        'field',
        error ? 'has-error' : '',
        wide ? 'wide' : ''
      ].join(' ')}
    >
      <span className="field-label">
        <Icon size={14} />
        {label}
      </span>

      {children}

      <span className="field-error">
        {error?.message || ' '}
      </span>
    </label>
  );
}

function Feature({
  icon: Icon,
  title,
  text
}) {
  return (
    <article>
      <span>
        <Icon size={18} />
      </span>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </article>
  );
}

function Background() {
  return (
    <>
      <div className="blob one" />
      <div className="blob two" />
      <div className="grid-background" />
    </>
  );
}
