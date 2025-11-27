import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Quote,
  Search,
  Snowflake,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { use, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./Context/AuthContext";
import { bestWorkers, customerReviews } from "./data";
import colors from "./ui/color";
import Modal from "./ui/Modal";

const CustomerDashboard = () => {
  const { user, isAuthenticated } = use(AuthContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const popularServices = [
    {
      id: 1,
      name: "Plumbing",
      description: "Fix leaks, installations, and plumbing emergencies",
      icon: Wrench,
      path: "/workers?service=plumbing",
    },
    {
      id: 2,
      name: "Electrical",
      description: "Wiring, repairs, and electrical installations",
      icon: Zap,
      path: "/workers?service=electrical",
    },
    {
      id: 3,
      name: "Cleaning",
      description: "Home, office, and deep cleaning services",
      icon: Sparkles,
      path: "/workers?service=cleaning",
    },
    {
      id: 4,
      name: "AC Repair",
      description: "AC servicing, repairs, and maintenance",
      icon: Snowflake,
      path: "/workers?service=ac-repair",
    },
  ];

  const handleServiceClick = (path) => {
    navigate(path);
  };

  const handleConditionalClick = () => {
    if (isAuthenticated) {
      navigate('/customer/manage-workers"');
    } else {
      setShowModal(true);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            fill={index < rating ? colors.warning[500] : "none"}
            color={index < rating ? colors.warning[500] : colors.primary[300]}
          />
        ))}
        <span
          className="ml-2 text-sm font-medium"
          style={{ color: colors.primary[600] }}
        >
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };
  return (
    <>
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Authentication Required"
          icon={AlertCircle}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          size="md"
          footerAlignment="right"
          footer={
            <>
              <button
                onClick={() => navigate("/login")}
                className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </>
          }
        >
          <p className="text-gray-600">
            Please sign up or log in to hire workers and access this feature.
          </p>
        </Modal>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="text-left">
              <h1
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                style={{ color: colors.primary[900] }}
              >
                Quick Services at Your{" "}
                <span style={{ color: colors.accent[600] }}>Doorstep</span>
              </h1>
              <p
                className="text-xl mb-6 leading-relaxed"
                style={{ color: colors.primary[700] }}
              >
                Book trusted professionals for all your home service needs
              </p>
              {isAuthenticated && (
                <p
                  className="text-lg mb-8 max-w-xl leading-relaxed"
                  style={{ color: colors.primary[600] }}
                >
                  Welcome back,{" "}
                  <span style={{ color: colors.accent[600], fontWeight: 600 }}>
                    {user?.name}
                  </span>
                  ! Get your tasks done quickly with our verified service
                  professionals. Quality work guaranteed.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConditionalClick}
                className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: colors.accent[600],
                  color: colors.white,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.accent[500];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.accent[600];
                }}
              >
                Find Workers Now
              </button>
              <button
                onClick={handleConditionalClick}
                className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 border transform hover:scale-105"
                style={{
                  borderColor: colors.accent[600],
                  color: colors.accent[600],
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.accent[50];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                View My Bookings
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service.path)}
                    className="p-6 rounded-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg "
                    style={{
                      backgroundColor: colors.white,
                      borderColor: colors.primary[200],
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.accent[200];
                      e.currentTarget.style.backgroundColor = colors.accent[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.primary[200];
                      e.currentTarget.style.backgroundColor = colors.white;
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: colors.accent[50],
                          color: colors.accent[600],
                        }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold mb-2"
                          style={{ color: colors.primary[900] }}
                        >
                          {service.name}
                        </h3>
                        <p
                          className="text-sm mb-3 leading-relaxed"
                          style={{ color: colors.primary[600] }}
                        >
                          {service.description}
                        </p>
                        <div
                          className="flex items-center text-sm font-semibold"
                          style={{ color: colors.accent[600] }}
                        >
                          <span>Book Now</span>
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="py-16" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: colors.primary[900] }}
            >
              Our Top Rated Professionals
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: colors.primary[600] }}
            >
              Highly skilled and trusted professionals with excellent track
              records
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-xl"
                style={{ border: `1px solid ${colors.primary[100]}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: colors.accent[600] }}
                  >
                    {worker.avatar}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      worker.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {worker.isAvailable ? "Available" : "Busy"}
                  </div>
                </div>

                <h3
                  className="text-xl font-semibold mb-1"
                  style={{ color: colors.primary[900] }}
                >
                  {worker.name}
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: colors.primary[600] }}
                >
                  {worker.profession}
                </p>

                {renderStars(worker.rating)}

                <div className="flex flex-wrap gap-2 mt-4">
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: colors.primary[50],
                        color: colors.primary[700],
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16" style={{ backgroundColor: colors.primary[50] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: colors.primary[900] }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: colors.primary[600] }}
            >
              Simple steps to get your services done quickly and efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl transition-transform hover:scale-105">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: colors.accent[50],
                  color: colors.accent[600],
                }}
              >
                <Search size={32} />
              </div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: colors.primary[900] }}
              >
                Search & Choose
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.primary[600] }}
              >
                Find the right service professional based on ratings, reviews,
                and availability
              </p>
            </div>
            <div className="text-center p-6 rounded-xl transition-transform hover:scale-105">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: colors.success[50],
                  color: colors.success[500],
                }}
              >
                <Calendar size={32} />
              </div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: colors.primary[900] }}
              >
                Book Instantly
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.primary[600] }}
              >
                Schedule your service with your preferred date and time
              </p>
            </div>
            <div className="text-center p-6 rounded-xl transition-transform hover:scale-105">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  backgroundColor: colors.warning[50],
                  color: colors.warning[500],
                }}
              >
                <CheckCircle size={32} />
              </div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: colors.primary[900] }}
              >
                Get It Done
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.primary[600] }}
              >
                Professional service delivered with quality and satisfaction
                guaranteed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: colors.primary[900] }}
            >
              What Our Customers Say
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: colors.primary[600] }}
            >
              Real feedback from satisfied customers who used our services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                style={{ border: `1px solid ${colors.primary[100]}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: colors.accent[500] }}
                    >
                      {review.avatar}
                    </div>
                    <div>
                      <h4
                        className="font-semibold"
                        style={{ color: colors.primary[900] }}
                      >
                        {review.name}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: colors.primary[600] }}
                      >
                        {review.service}
                      </p>
                    </div>
                  </div>
                  <Quote size={24} style={{ color: colors.primary[200] }} />
                </div>

                {renderStars(review.rating)}

                <p
                  className="mt-4 mb-4 leading-relaxed"
                  style={{ color: colors.primary[700] }}
                >
                  "{review.comment}"
                </p>

                <div className="text-sm" style={{ color: colors.primary[500] }}>
                  {review.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
