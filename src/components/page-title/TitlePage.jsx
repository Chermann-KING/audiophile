import { styled } from "styled-components";
import { theme } from "../../theme/theme";

export default function TitlePage({ label }) {
  return (
    <TitlePageStyled className="tilte-page">
      <h2>{label}</h2>
    </TitlePageStyled>
  );
}

const TitlePageStyled = styled.div`
  height: 238px;
  color: ${theme.colors.tertiaryColor};
  background-color: ${theme.colors.secondaryColor};

  display: flex;
  align-items: center;
  justify-content: center;

  h2 {
    font-size: ${theme.fonts.size.H2};
    font-weight: ${theme.fonts.weights.bold};
    letter-spacing: ${theme.fonts.charSpace.H2CharSpace};
    text-transform: uppercase;
  }

  @media (max-width: 480px) {
    height: 247px;
    height: 102px;
    h2 {
      font-size: 28px;
      letter-spacing: 2px;
    }
  }
`;
