import React from "react";
import Hero from "./Hero";
import Categories from "../../../components/categories/Categories";
import Products from "./Products";
import About from "../../../components/about/About";
import { styled } from "styled-components";

const PaddingWrapper = styled.div`
  padding: 120px 13.5% 13.5% 200px;

  @media (max-width: 768px) {
    padding: 96px 13.5%;
  }
`;
const ProductWrapper = styled.div`
  padding-top: 168px;
  padding-bottom: 200px;

  @media (max-width: 768px) {
    padding: 96px 0px;
  }
  @media (max-width: 480px) {
    padding: 120px 0px;
  }
`;

export default function Main() {
  return (
    <MainStyled>
      <Hero />
      <PaddingWrapper>
        <Categories />
        <ProductWrapper>
          <Products />
        </ProductWrapper>
        <About />
      </PaddingWrapper>
    </MainStyled>
  );
}

const MainStyled = styled.main`
  /* border: 3px solid black; */
`;
