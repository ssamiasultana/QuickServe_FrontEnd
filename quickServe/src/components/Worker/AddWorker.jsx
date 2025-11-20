import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createWorker } from "../../services/WorkerService";
import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload";
import Card from "../ui/Card";
export default function CreateWorker() {
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.target);
    
    const serviceTypes = formData.getAll("service_type[]");
    
    const workerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      age: formData.get("age"),
      phone: formData.get("phone"),
      imageUrl: formData.get("imageUrl"),
      service_type: serviceTypes,
      expertise_of_service: formData.get("expertise_of_service"),
      shift: formData.get("shift"),
      rating: formData.get("rating"),
    };
    
    try {
      const result = await createWorker(workerData);
      
      if (result.success || result.data) {
        toast.success(result.message || "Worker registered successfully!");
        e.target.reset();
        setPreview(null);
        setImageUrl(null);
        setErrors({});
      }
    } catch (error) {
      toast.error(error.message || "Failed to register worker");
      
      // Handle validation errors if returned from API
      if (error.errors) {
        setErrors(error.errors);
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const validateTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validateTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
        event.target.value = "";
        setPreview(null);
        setImageUrl(null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        event.target.value = "";
        setPreview(null);
        setImageUrl(null);
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      setUploading(true);
      try {
        const url = await uploadImageToCloudinary(file);
        setImageUrl(url);
      } catch (error) {
        toast.error(`Failed to upload image: ${error.message}`);
        event.target.value = "";
        setPreview(null);
        setImageUrl(null);
      } finally {
        setUploading(false);
      }
    } else {
      setPreview(null);
      setImageUrl(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
        Worker Profile Registration
      </h2>

      <Card
        title=""
        className="mb-6"
        bgColor="bg-gradient-to-br from-blue-25 to-white"
        borderColor="border-blue-100"
        formCard={true}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-blue-100">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-600 font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errors?.name && (
                    <p className="text-sm mt-1 text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-600 font-semibold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errors?.email && (
                    <p className="text-sm mt-1 text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-600 font-semibold">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errors?.age && (
                    <p className="text-sm mt-1 text-red-500">
                      {errors.age}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-600 font-semibold">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {errors?.phone && (
                    <p className="text-sm mt-1 text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-600 font-semibold">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploading && (
                    <p className="mt-2 text-sm text-blue-600">
                      Uploading image...
                    </p>
                  )}
                  {imageUrl && (
                    <p className="mt-2 text-sm text-green-600">
                      Image uploaded successfully!
                    </p>
                  )}
                  {preview && (
                    <div className="mt-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <input type="hidden" name="imageUrl" value={imageUrl || ""} />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-green-100">
              Service Information
            </h3>

            <div className="mb-6">
              <label className="block text-sm mb-3 text-gray-600 font-semibold">
                Service Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Cleaning", "Plumbing", "Electrician", "Cooking"].map(
                  (type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-white"
                    >
                      <input
                        type="checkbox"
                        name="service_type[]"
                        value={type}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {type}
                      </span>
                    </label>
                  )
                )}
              </div>
              {errors?.service_type && (
                <p className="text-sm mt-2 text-red-500">
                  {errors.service_type}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm mb-2 text-gray-600 font-semibold">
                  Expertise Level (1-10) *
                </label>
                <input
                  type="number"
                  name="expertise_of_service"
                  placeholder="Enter 1-10"
                  min="1"
                  max="10"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                />
                {errors?.expertise_of_service && (
                  <p className="text-sm mt-1 text-red-500">
                    {errors.expertise_of_service}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-600 font-semibold">
                  Preferred Shift *
                </label>
                <select
                  name="shift"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="">Select Shift</option>
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                  <option value="Flexible">Flexible</option>
                </select>
                {errors?.shift && (
                  <p className="text-sm mt-1 text-red-500">
                    {errors.shift}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-600 font-semibold">
                  Self Rating (1-5) *
                </label>
                <input
                  type="number"
                  name="rating"
                  placeholder="Enter 1-5"
                  min="1"
                  max="5"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                />
                {errors?.rating && (
                  <p className="text-sm mt-1 text-red-500">
                    {errors.rating}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-100">
            <button
              disabled={isPending}
              type="submit"
              className="px-8 py-3 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer bg-blue-600 hover:bg-blue-700 min-w-48 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isPending ? "Registering..." : "Register Worker"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}