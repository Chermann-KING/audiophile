import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";

export default function () {
  return (
    <HomeStyled>
      <Header />
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};
`;
