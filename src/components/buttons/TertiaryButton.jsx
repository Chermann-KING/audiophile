import { styled } from "styled-components";
import { theme } from "../../theme/theme";

export default function TertiaryButton({ label, icon }) {
  return (
    <TertiaryButtonStyled>
      <span className="button-label">{label}</span>
      <span className="button-icon">{icon}</span>
    </TertiaryButtonStyled>
  );
}

const TertiaryButtonStyled = styled.button`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;

  font-size: ${theme.fonts.size.SUBTITLE};
  font-weight: ${theme.fonts.weights.bold};
  letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
  text-transform: uppercase;

  border: none;
  background-color: transparent;

  .button-label {
    color: ${theme.colors.blackColor};
    opacity: 0.6;
    /* &:hover {
              color: ${theme.colors.primaryColor};
              opacity: 1;
            } */
  }
  .button-icon {
    color: ${theme.colors.primaryColor};
  }
`;
