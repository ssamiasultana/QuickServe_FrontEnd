import colors from "../components/ui/color";
const getShiftColor = (shift) => {
  const normalizedShift = shift?.toLowerCase();

  switch (normalizedShift) {
    case 'morning':
    case 'day':
      return {
        background: colors.warning[50],
        text: colors.warning[500],
        border: colors.warning[200],
      };
    case 'evening':
    case 'afternoon':
      return {
        background: colors.accent[50],
        text: colors.accent[600],
        border: colors.accent[200],
      };
    case 'night':
      return {
        background: colors.primary[50],
        text: colors.primary[800],
        border: colors.primary[200],
      };
    case 'flexible':
    case 'any':
      return {
        background: colors.success[50],
        text: colors.success[500],
        border: colors.success[200] || colors.success[500],
      };
    default:
      return {
        background: colors.neutral[100],
        text: colors.neutral[600],
        border: colors.neutral[300],
      };
  }
};

export default getShiftColor;
