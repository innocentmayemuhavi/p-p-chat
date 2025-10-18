import styled from "styled-components";

const StyledLayout = styled.main`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: var(--main-bg-color);
`;

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <StyledLayout>{children}</StyledLayout>;
};
export default Layout;
