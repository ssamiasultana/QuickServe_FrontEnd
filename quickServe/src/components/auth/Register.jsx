import { Lock, Mail, Phone, User } from "lucide-react";
import { use, useActionState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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

  const roleOptions = [
    { value: "Worker", label: "Worker" },
    { value: "Customer", label: "Customer" },
  ];
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role.toLowerCase();
      switch (role) {
        case "admin":
        case "moderator":
          navigate("/dashboard", { replace: true });
          break;
        case "worker":
          navigate("/worker/dashboard", { replace: true });
          break;
        case "customer":
          navigate("/customer/dashboard", { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await signUpAction(prevState, formData);

      if (result.success && result.data?.token) {
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

      return result;
    },
    {
      success: false,
      message: "",
      data: null,
      errors: {},
    }
  );

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8"
      style={{ backgroundColor: colors.neutral[50] }}
    >
      <div className="w-full lg:w-2/5 max-w-md text-center lg:text-left mb-8 lg:mb-0 lg:pr-12">
        <div className="flex justify-center lg:justify-start mb-6">
          <div className="flex justify-center lg:justify-start mb-3">
            <img src={logo} alt="Logo" className="w-32 h-32 lg:w-48 lg:h-48" />
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

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                required
                error={state.errors?.password}
                icon={Lock}
              />

              <FormInput
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                placeholder="Re-enter your password"
                required
                error={state.errors?.password_confirmation}
                icon={Lock}
              />
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
