import { styled } from "styled-components";
import { theme } from "../../theme/theme";

export default function PrimaryButton({ label, className }) {
  return (
    <PrimaryButtonStyled className={className}>{label}</PrimaryButtonStyled>
  );
}

const PrimaryButtonStyled = styled.button`
  cursor: pointer;
  width: 160px;
  height: 48px;
  font-size: ${theme.fonts.size.SUBTITLE};
  font-weight: ${theme.fonts.weights.bold};
  letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
  text-transform: uppercase;

  border: 2px solid ${theme.colors.primaryColor};
  background-color: ${theme.colors.primaryColor};
  color: ${theme.colors.whiteColor};

  &:hover {
    border: 2px solid ${theme.colors.primaryLightColor};
    background-color: ${theme.colors.primaryLightColor};
  }
`;
