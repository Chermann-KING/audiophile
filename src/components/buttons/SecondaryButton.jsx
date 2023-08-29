import { theme } from "../../theme/theme";
import { styled } from "styled-components";

export default function SecondaryButton({ label }) {
  return <SecondaryButtonStyled>{label}</SecondaryButtonStyled>;
}

const SecondaryButtonStyled = styled.button`
  cursor: pointer;
  width: 160px;
  height: 48px;
  font-size: ${theme.fonts.size.SUBTITLE};
  font-weight: ${theme.fonts.weights.bold};
  letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
  text-transform: uppercase;

  border: 2px solid ${theme.colors.blackColor};
  background-color: transparent;
  color: ${theme.colors.blackColor};

  &:hover {
    color: ${theme.colors.whiteColor};
    border: 2px solid ${theme.colors.blackColor};
    background-color: ${theme.colors.blackColor};
  }
`;
