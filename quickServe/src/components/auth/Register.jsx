import { CheckCircle, Eye, EyeOff, Lock, Mail, Phone, Shield, User, UserPlus } from "lucide-react";
import { use, useActionState, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import { signUpAction } from "../../utils/authAction";
import { AuthContext } from "../Context/AuthContext";
import Card from "../ui/Card";
import { colors } from "../ui/color";
import { FormInput } from "../ui/FormInput";
import { FormSelect } from "../ui/FormSelect";

const Register = () => {
  const { login, isAuthenticated, user } = use(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminCreating = location.pathname.includes("user-signup");

  const isModeratorCreating = isAdminCreating && user?.role === 'Moderator';

  const roleOptions = isAdminCreating
    ? isModeratorCreating
      ? [{ value: "Worker", label: "Worker" }]
      : [
          { value: "Worker", label: "Worker" },
          { value: "Moderator", label: "Moderator" },
        ]
    : [
      { value: "Worker", label: "Worker" },
      { value: "Customer", label: "Customer" },
    ];

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  useEffect(() => {
    if (isAdminCreating) return;
    if (isAuthenticated && user) {
      const role = user.role.toLowerCase();
      switch (role) {
        case "admin":
        case "moderator":
          navigate("/dashboard");
          break;
        case "worker":
          navigate("/worker/jobs");
          break;
        case "customer":
          navigate("/customer/dashboard");
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate, isAdminCreating]);

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await signUpAction(prevState, formData);

      if (result.success && result.data?.token) {
        if (!isAdminCreating) {
          login(result.data.token, result.data.user);
          const role = result.data.user.role.toLowerCase();
          if (role === "worker") {
            navigate("/worker");
          } else if (role === "customer") {
            navigate("/customer");
          } else {
            navigate("/login");
          }
        }
      }

      return result;
    },
    {
      success: false,
      message: "",
      data: null,
      errors: {},
    }
  );

  // ─── Admin / Moderator Panel UI ───
  if (isAdminCreating) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${isModeratorCreating ? 'bg-purple-100' : 'bg-blue-100'}`}>
              <UserPlus className={`w-6 h-6 ${isModeratorCreating ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isModeratorCreating ? 'Create Worker Account' : 'Create New Account'}
              </h1>
              <p className="text-sm text-gray-500">
                {isModeratorCreating
                  ? 'Register a new worker into the system'
                  : 'Register a new worker or moderator into the system'}
              </p>
            </div>
          </div>
        </div>

        {/* Success / Error Alert */}
        {state.message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
              state.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            {state.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{state.message}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form action={formAction}>
            {/* Account Info Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-base font-semibold text-gray-800">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  required
                  error={state.errors?.name}
                  icon={User}
                />
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  error={state.errors?.email}
                  icon={Mail}
                />
              </div>
            </div>

            {/* Contact & Role Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-base font-semibold text-gray-800">Contact & Role</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  error={state.errors?.phone}
                  icon={Phone}
                />
                <FormSelect
                  label="Account Type"
                  name="role"
                  options={roleOptions}
                  placeholder="Select role"
                  required
                  error={state.errors?.role}
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="text-base font-semibold text-gray-800">Security</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <FormInput
                    label="Password"
                    name="password"
                    type={showPasswords.password ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    required
                    error={state.errors?.password}
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <FormInput
                    label="Confirm Password"
                    name="password_confirmation"
                    type={showPasswords.password_confirmation ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    required
                    error={state.errors?.password_confirmation}
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password_confirmation')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPasswords.password_confirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isPending}
                className={`px-8 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isModeratorCreating
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}>
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Public Signup UI (unchanged) ───
  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8"
      style={{ backgroundColor: colors.neutral[50] }}
    >
      <div className="w-full lg:w-2/5 max-w-md text-center lg:text-left mb-8 lg:mb-0 lg:pr-12">
        <div className="flex justify-center lg:justify-start mb-6">
          <div className="flex justify-center lg:justify-start mb-3">
            <img
              src={logo}
              alt="Logo"
              className="w-32 h-32 lg:w-48 lg:h-48"
            />
          </div>
        </div>

        <h1
          className="text-3xl lg:text-4xl font-extrabold mb-4"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[900]} 0%, ${colors.accent[600]} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Quick Serve
        </h1>

        <p
          className="text-sm lg:text-base mb-2 leading-relaxed"
          style={{ color: colors.neutral[600] }}
        >
          Connect with trusted service providers in your area. Fast, reliable,
          and convenient.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-3/5 max-w-2xl">
        <div className="mb-6">
          <h2
            className="text-2xl lg:text-3xl font-bold mb-2"
            style={{ color: colors.primary[900] }}
          >
            Create your account
          </h2>
          <p className="text-sm" style={{ color: colors.neutral[500] }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold hover:underline transition-all"
              style={{ color: colors.accent[600] }}
            >
              Sign in here
            </Link>
          </p>
        </div>

        <Card>
          {state.message && (
            <div
              className="p-4 rounded-lg mb-6 text-sm font-medium border"
              style={{
                backgroundColor: state.success
                  ? colors.success[100]
                  : colors.error[100],
                color: state.success ? colors.success[800] : colors.error[800],
                borderColor: state.success
                  ? colors.success[800]
                  : colors.error[800],
              }}
            >
              {state.message}
            </div>
          )}

          <form className="space-y-4" action={formAction}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                error={state.errors?.name}
                icon={User}
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                error={state.errors?.email}
                icon={Mail}
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                error={state.errors?.phone}
                icon={Phone}
              />

              <FormSelect
                label="Account Type"
                name="role"
                options={roleOptions}
                placeholder="Select your role"
                required
                error={state.errors?.role}
              />
              <div className='relative'>
                <FormInput
                  label="Password"
                  name="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  required
                  error={state.errors?.password}
                  icon={Lock}
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('password')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                  {showPasswords.password ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              <div className='relative'>
                <FormInput
                  label="Confirm Password"
                  name="password_confirmation"
                  type={showPasswords.password_confirmation ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  required
                  error={state.errors?.password_confirmation}
                  icon={Lock}
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('password_confirmation')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                  {showPasswords.password_confirmation ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[600]} 100%)`,
                }}
              >
                {isPending ? "Creating your account..." : "Create Account"}
              </button>

              <p
                className="text-xs text-center leading-relaxed"
                style={{ color: colors.neutral[400] }}
              >
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="font-semibold hover:underline"
                  style={{ color: colors.accent[600] }}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-semibold hover:underline"
                  style={{ color: colors.accent[600] }}
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
