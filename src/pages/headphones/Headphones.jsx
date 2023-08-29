import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";

export default function Headphones() {
  return (
    <HeadphonesStyled>
      <Header />
      <div className="tilte-page">
        <h2>Headphones</h2>
      </div>
    </HeadphonesStyled>
  );
}

const HeadphonesStyled = styled.div`
  .tilte-page {
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
  }
`;
