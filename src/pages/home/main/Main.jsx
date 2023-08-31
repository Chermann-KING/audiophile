import React from "react";
import Hero from "./Hero";
import Categories from "../../../components/categories/Categories";
import Products from "./Products";
import About from "../../../components/about/About";
import { styled } from "styled-components";

const MarginWrapper = styled.div`
  margin: 0 13.5%;
`;

export default function Main() {
  return (
    <MainStyled>
      <Hero />
      <MarginWrapper>
        <Categories />
        <Products />
        <About />
      </MarginWrapper>
    </MainStyled>
  );
}

const MainStyled = styled.main`
  margin: 0 auto;
`;
