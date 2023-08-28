import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import Products from "./Products";
import About from "./About";
import { styled } from "styled-components";

export default function Main() {
  return (
    <MainStyled>
      <Hero />
      <Categories />
      <Products />
      <About />
    </MainStyled>
  );
}

const MainStyled = styled.main`
  margin: 0 auto;
`;
