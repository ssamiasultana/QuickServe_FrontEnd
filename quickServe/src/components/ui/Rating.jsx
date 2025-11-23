import { Star } from "lucide-react";

function Rating({ value, onChange, max = 5, disabled = false, name }) {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => !disabled && onChange(ratingValue)}
            disabled={disabled}
            className="transition-colors disabled:cursor-not-allowed"
          >
            <Star
              className={`w-5 h-5 ${
                ratingValue <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } ${!disabled && "hover:text-yellow-400 hover:fill-yellow-400"}`}
            />
          </button>
        );
      })}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export default Rating;
