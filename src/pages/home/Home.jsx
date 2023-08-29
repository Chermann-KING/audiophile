import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import Main from "./main/Main";
import Footer from "../../components/footer/Footer";

export default function Home() {
  return (
    <HomeStyled>
      <Header />
      <Main />
      <Footer />
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};
`;
