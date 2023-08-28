import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import Hero from "./main/Hero";
import Categories from "./main/Categories";
import Products from "./main/Products";
import About from "./main/About";

export default function () {
  return (
    <HomeStyled>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />
        <About />
      </main>
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};

  main {
    margin: 0 auto;
  }
`;
