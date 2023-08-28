import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import Main from "./main/Main";

export default function Home() {
  return (
    <HomeStyled>
      <Header />
      <Main />
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};
`;
